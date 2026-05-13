"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Member } from "@/lib/types";
import { getDaysRemaining, getMemberStatus, getStatusLabel } from "@/lib/utils/member-status";
import { cn } from "@/lib/utils";
import { Clock, MessageCircle, ArrowRight } from "lucide-react";

interface ExpiringMembersListProps {
  members: Member[];
  reminderDays: number;
  onWhatsApp: (member: Member) => void;
}

export function ExpiringMembersList({
  members,
  reminderDays,
  onWhatsApp,
}: ExpiringMembersListProps) {
  const expiringMembers = members
    .filter((m) => {
      const status = getMemberStatus(m, reminderDays);
      return status === "por-vencer" || status === "vencido";
    })
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
    .slice(0, 5);

  if (expiringMembers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4" />
            Próximos a vencer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No hay alumnos próximos a vencer en este momento.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-4 w-4" />
          Próximos a vencer
        </CardTitle>
        <Link href="/alumnos?filtro=por-vencer">
          <Button variant="ghost" size="sm" className="gap-1 text-xs">
            Ver todos
            <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {expiringMembers.map((member) => {
          const status = getMemberStatus(member, reminderDays);
          const daysRemaining = getDaysRemaining(member);

          return (
            <div
              key={member.id}
              className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
            >
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">{member.name}</span>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      status === "por-vencer" &&
                        "border-status-expiring/30 bg-status-expiring/10 text-status-expiring",
                      status === "vencido" &&
                        "border-status-expired/30 bg-status-expired/10 text-status-expired"
                    )}
                  >
                    {getStatusLabel(status)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {daysRemaining < 0
                      ? `Venció hace ${Math.abs(daysRemaining)} días`
                      : daysRemaining === 0
                      ? "Vence hoy"
                      : `${daysRemaining} días restantes`}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => onWhatsApp(member)}
              >
                <MessageCircle className="h-4 w-4" />
                <span className="sr-only">Enviar WhatsApp</span>
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
