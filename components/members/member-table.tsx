"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./status-badge";
import { Member, MemberStatus, Settings } from "@/lib/types";
import { getDaysRemaining, getMemberStatus } from "@/lib/utils/member-status";
import { Eye, RefreshCw, MessageCircle } from "lucide-react";

interface MemberTableProps {
  members: Member[];
  settings: Settings;
  onView: (member: Member) => void;
  onRenew: (member: Member) => void;
  onWhatsApp: (member: Member) => void;
}

export function MemberTable({
  members,
  settings,
  onView,
  onRenew,
  onWhatsApp,
}: MemberTableProps) {
  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12">
        <p className="text-muted-foreground">No se encontraron alumnos</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead className="hidden sm:table-cell">WhatsApp</TableHead>
            <TableHead className="hidden md:table-cell">Plan</TableHead>
            <TableHead className="hidden lg:table-cell">Inicio</TableHead>
            <TableHead>Vencimiento</TableHead>
            <TableHead className="hidden sm:table-cell">Días</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => {
            const status = getMemberStatus(member, settings.reminderDays);
            const daysRemaining = getDaysRemaining(member);

            return (
              <TableRow key={member.id}>
                <TableCell className="font-medium">{member.name}</TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {member.phone}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {member.plan}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {format(new Date(member.startDate), "dd/MM/yy")}
                </TableCell>
                <TableCell>
                  {format(new Date(member.endDate), "dd/MM/yy")}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <span
                    className={`font-medium ${
                      daysRemaining < 0
                        ? "text-status-expired"
                        : daysRemaining <= 5
                        ? "text-status-expiring"
                        : "text-status-active"
                    }`}
                  >
                    {daysRemaining < 0 ? daysRemaining : daysRemaining}
                  </span>
                </TableCell>
                <TableCell>
                  <StatusBadge status={status} />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onView(member)}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">Ver</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onRenew(member)}
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span className="sr-only">Renovar</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onWhatsApp(member)}
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span className="sr-only">WhatsApp</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
