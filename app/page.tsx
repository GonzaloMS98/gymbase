"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { StatCard } from "@/components/dashboard/stat-card";
import { ExpiringMembersList } from "@/components/dashboard/expiring-members-list";
import { getMembers, getPayments, getSettings } from "@/lib/supabase/database";
import { Member, Payment, Settings } from "@/lib/types";
import { getMemberStatus, generateWhatsAppLink } from "@/lib/utils/member-status";
import {
  Users,
  AlertTriangle,
  XCircle,
  DollarSign,
  UserPlus,
} from "lucide-react";

export default function DashboardPage() {
  const { data: members = [], isLoading: membersLoading } = useSWR<Member[]>(
    "members",
    getMembers
  );
  const { data: payments = [], isLoading: paymentsLoading } = useSWR<Payment[]>(
    "payments",
    getPayments
  );
  const { data: settings, isLoading: settingsLoading } = useSWR<Settings>(
    "settings",
    getSettings
  );

  const isLoading = membersLoading || paymentsLoading || settingsLoading;

  const stats = useMemo(() => {
    if (!settings) return null;

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    let active = 0;
    let expiring = 0;
    let expired = 0;
    let newThisMonth = 0;

    members.forEach((member) => {
      const status = getMemberStatus(member, settings.reminderDays);
      if (status === "activo") active++;
      else if (status === "por-vencer") expiring++;
      else if (status === "vencido") expired++;

      const createdDate = new Date(member.createdAt);
      if (
        createdDate.getMonth() === currentMonth &&
        createdDate.getFullYear() === currentYear
      ) {
        newThisMonth++;
      }
    });

    const monthlyIncome = payments
      .filter((p) => {
        const paymentDate = new Date(p.date);
        return (
          paymentDate.getMonth() === currentMonth &&
          paymentDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      active,
      expiring,
      expired,
      monthlyIncome,
      newThisMonth,
    };
  }, [members, payments, settings]);

  const handleWhatsApp = (member: Member) => {
    if (!settings) return;
    const link = generateWhatsAppLink(member, settings);
    window.open(link, "_blank");
  };

  if (isLoading || !settings || !stats) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Resumen de {settings.gymName}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Alumnos activos"
          value={stats.active}
          icon={Users}
          variant="success"
        />
        <StatCard
          title="Por vencer"
          value={stats.expiring}
          icon={AlertTriangle}
          variant="warning"
          description={`En los próximos ${settings.reminderDays} días`}
        />
        <StatCard
          title="Vencidos"
          value={stats.expired}
          icon={XCircle}
          variant="danger"
        />
        <StatCard
          title="Ingresos del mes"
          value={`$${stats.monthlyIncome.toLocaleString("es-MX")}`}
          icon={DollarSign}
        />
        <StatCard
          title="Nuevos inscritos"
          value={stats.newThisMonth}
          icon={UserPlus}
          description="Este mes"
        />
      </div>

      <div className="mt-6">
        <ExpiringMembersList
          members={members}
          reminderDays={settings.reminderDays}
          onWhatsApp={handleWhatsApp}
        />
      </div>
    </div>
  );
}
