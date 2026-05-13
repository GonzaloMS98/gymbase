"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import useSWR, { mutate } from "swr";
import { Button } from "@/components/ui/button";
import { MemberFilters } from "@/components/members/member-filters";
import { MemberTable } from "@/components/members/member-table";
import { MemberCard } from "@/components/members/member-card";
import { MemberDetailSheet } from "@/components/members/member-detail-sheet";
import { MemberFormDialog } from "@/components/members/member-form-dialog";
import { RenewalDialog } from "@/components/members/renewal-dialog";
import {
  getMembers,
  getSettings,
  createMember,
  updateMember,
  createPayment,
} from "@/lib/supabase/database";
import { Member, FilterStatus, Settings, PaymentMethod } from "@/lib/types";
import { getMemberStatus, generateWhatsAppLink } from "@/lib/utils/member-status";
import { toast } from "sonner";
import { Plus } from "lucide-react";

function MembersContent() {
  const searchParams = useSearchParams();

  const { data: members = [], isLoading: membersLoading } = useSWR<Member[]>(
    "members",
    getMembers
  );
  const { data: settings, isLoading: settingsLoading } = useSWR<Settings>(
    "settings",
    getSettings
  );

  const isLoading = membersLoading || settingsLoading;

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterStatus>(
    (searchParams.get("filtro") as FilterStatus) || "todos"
  );

  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isRenewalOpen, setIsRenewalOpen] = useState(false);
  const [renewingMember, setRenewingMember] = useState<Member | null>(null);

  const filteredMembers = useMemo(() => {
    if (!settings) return [];

    return members.filter((member) => {
      const status = getMemberStatus(member, settings.reminderDays);

      // Filter by status
      if (filter !== "todos" && status !== filter) {
        return false;
      }

      // Filter by search
      if (search) {
        const searchLower = search.toLowerCase();
        return (
          member.name.toLowerCase().includes(searchLower) ||
          member.phone.includes(search)
        );
      }

      return true;
    });
  }, [members, settings, filter, search]);

  const handleViewMember = (member: Member) => {
    setSelectedMember(member);
    setIsDetailOpen(true);
  };

  const handleRenewMember = (member: Member) => {
    setRenewingMember(member);
    setIsRenewalOpen(true);
  };

  const handleWhatsApp = (member: Member) => {
    if (!settings) return;
    const link = generateWhatsAppLink(member, settings);
    window.open(link, "_blank");
  };

  const handleCreateMember = async (data: Omit<Member, "id" | "createdAt">) => {
    const newMember = await createMember(data);

    if (newMember) {
      // Also add the initial payment
      await createPayment({
        memberId: newMember.id,
        memberName: newMember.name,
        amount: newMember.amount,
        method: newMember.paymentMethod,
        date: newMember.startDate,
        concept: newMember.plan,
      });

      // Revalidate SWR cache
      mutate("members");
      mutate("payments");
      setIsFormOpen(false);
      toast.success("Alumno registrado correctamente");
    } else {
      toast.error("Error al registrar el alumno");
    }
  };

  const handleRenewal = async (
    memberId: string,
    planName: string,
    amount: number,
    method: PaymentMethod,
    newEndDate: string,
    notes?: string
  ) => {
    const member = members.find((m) => m.id === memberId);
    if (!member) return;

    const updatedMember = await updateMember(memberId, {
      endDate: newEndDate,
      plan: planName,
      amount,
      paymentMethod: method,
      notes: notes || member.notes,
    });

    if (updatedMember) {
      await createPayment({
        memberId,
        memberName: member.name,
        amount,
        method,
        date: new Date().toISOString().split("T")[0],
        concept: `Renovación ${planName}`,
      });

      // Revalidate SWR cache
      mutate("members");
      mutate("payments");
      setIsRenewalOpen(false);
      setRenewingMember(null);
      toast.success("Membresía renovada correctamente");
    } else {
      toast.error("Error al renovar la membresía");
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Alumnos</h1>
          <p className="text-sm text-muted-foreground">
            {filteredMembers.length} de {members.length} alumnos
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo alumno
        </Button>
      </header>

      <MemberFilters
        search={search}
        onSearchChange={setSearch}
        filter={filter}
        onFilterChange={setFilter}
      />

      {/* Desktop Table View */}
      <div className="mt-4 hidden md:block">
        <MemberTable
          members={filteredMembers}
          settings={settings}
          onView={handleViewMember}
          onRenew={handleRenewMember}
          onWhatsApp={handleWhatsApp}
        />
      </div>

      {/* Mobile Card View */}
      <div className="mt-4 grid gap-3 md:hidden">
        {filteredMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12">
            <p className="text-muted-foreground">No se encontraron alumnos</p>
          </div>
        ) : (
          filteredMembers.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              status={getMemberStatus(member, settings.reminderDays)}
              onView={() => handleViewMember(member)}
              onRenew={() => handleRenewMember(member)}
              onWhatsApp={() => handleWhatsApp(member)}
            />
          ))
        )}
      </div>

      {/* Detail Sheet */}
      <MemberDetailSheet
        member={selectedMember}
        settings={settings}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onRenew={(member) => {
          setIsDetailOpen(false);
          handleRenewMember(member);
        }}
        onWhatsApp={handleWhatsApp}
      />

      {/* Create Member Form */}
      <MemberFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        settings={settings}
        onSubmit={handleCreateMember}
      />

      {/* Renewal Dialog */}
      <RenewalDialog
        member={renewingMember}
        settings={settings}
        open={isRenewalOpen}
        onOpenChange={(open) => {
          setIsRenewalOpen(open);
          if (!open) setRenewingMember(null);
        }}
        onSubmit={handleRenewal}
      />
    </div>
  );
}

export default function AlumnosPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <MembersContent />
    </Suspense>
  );
}
