"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "./status-badge";
import { Member, MemberStatus } from "@/lib/types";
import { getDaysRemaining } from "@/lib/utils/member-status";
import { Eye, RefreshCw, MessageCircle } from "lucide-react";

interface MemberCardProps {
  member: Member;
  status: MemberStatus;
  onView: () => void;
  onRenew: () => void;
  onWhatsApp: () => void;
}

export function MemberCard({
  member,
  status,
  onView,
  onRenew,
  onWhatsApp,
}: MemberCardProps) {
  const daysRemaining = getDaysRemaining(member);

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-medium truncate">{member.name}</h3>
            <StatusBadge status={status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{member.phone}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-muted-foreground">Plan:</span>
          <span className="ml-1 font-medium">{member.plan}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Vence:</span>
          <span className="ml-1 font-medium">
            {format(new Date(member.endDate), "dd MMM", { locale: es })}
          </span>
        </div>
        <div className="col-span-2">
          <span className="text-muted-foreground">Días restantes:</span>
          <span
            className={`ml-1 font-medium ${
              daysRemaining < 0
                ? "text-status-expired"
                : daysRemaining <= 5
                ? "text-status-expiring"
                : "text-status-active"
            }`}
          >
            {daysRemaining < 0 ? `${Math.abs(daysRemaining)} días vencido` : daysRemaining}
          </span>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={onView}>
          <Eye className="mr-1.5 h-3.5 w-3.5" />
          Ver
        </Button>
        <Button variant="outline" size="sm" className="flex-1" onClick={onRenew}>
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Renovar
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={onWhatsApp}>
          <MessageCircle className="h-3.5 w-3.5" />
          <span className="sr-only">WhatsApp</span>
        </Button>
      </div>
    </Card>
  );
}
