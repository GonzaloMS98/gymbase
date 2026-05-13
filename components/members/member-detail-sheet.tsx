"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import useSWR from "swr";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "./status-badge";
import { Member, Settings, Payment } from "@/lib/types";
import { getPaymentsByMemberId } from "@/lib/supabase/database";
import {
  getMemberStatus,
  getDaysRemaining,
} from "@/lib/utils/member-status";
import { cn } from "@/lib/utils";
import {
  Phone,
  Calendar,
  CreditCard,
  Clock,
  FileText,
  RefreshCw,
  MessageCircle,
} from "lucide-react";

interface MemberDetailSheetProps {
  member: Member | null;
  settings: Settings;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRenew: (member: Member) => void;
  onWhatsApp: (member: Member) => void;
}

export function MemberDetailSheet({
  member,
  settings,
  open,
  onOpenChange,
  onRenew,
  onWhatsApp,
}: MemberDetailSheetProps) {
  const { data: payments = [] } = useSWR<Payment[]>(
    member && open ? `payments-${member.id}` : null,
    () => (member ? getPaymentsByMemberId(member.id) : Promise.resolve([]))
  );

  if (!member) return null;

  const status = getMemberStatus(member, settings.reminderDays);
  const daysRemaining = getDaysRemaining(member);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader className="text-left">
          <SheetTitle className="flex items-center gap-3">
            {member.name}
            <StatusBadge status={status} />
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Contact Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              Información de contacto
            </h4>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <Phone className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">{member.phone}</p>
                <p className="text-xs text-muted-foreground">WhatsApp</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Subscription Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              Información de membresía
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border p-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs">Inicio</span>
                </div>
                <p className="mt-1 text-sm font-medium">
                  {format(new Date(member.startDate), "dd MMM yyyy", {
                    locale: es,
                  })}
                </p>
              </div>

              <div className="rounded-lg border border-border p-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs">Vencimiento</span>
                </div>
                <p className="mt-1 text-sm font-medium">
                  {format(new Date(member.endDate), "dd MMM yyyy", {
                    locale: es,
                  })}
                </p>
              </div>

              <div className="rounded-lg border border-border p-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span className="text-xs">Plan</span>
                </div>
                <p className="mt-1 text-sm font-medium">{member.plan}</p>
              </div>

              <div className="rounded-lg border border-border p-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs">Días restantes</span>
                </div>
                <p
                  className={cn(
                    "mt-1 text-sm font-medium",
                    daysRemaining < 0 && "text-status-expired",
                    daysRemaining >= 0 && daysRemaining <= 5 && "text-status-expiring",
                    daysRemaining > 5 && "text-status-active"
                  )}
                >
                  {daysRemaining < 0
                    ? `${Math.abs(daysRemaining)} días vencido`
                    : `${daysRemaining} días`}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Payment Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              Último pago
            </h4>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  ${member.amount.toLocaleString("es-MX")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {member.paymentMethod}
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                {format(new Date(member.startDate), "dd/MM/yy")}
              </Badge>
            </div>
          </div>

          {/* Notes */}
          {member.notes && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Notas
                </h4>
                <p className="text-sm text-foreground">{member.notes}</p>
              </div>
            </>
          )}

          {/* Payment History */}
          <Separator />
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              Historial de pagos
            </h4>
            <div className="space-y-2">
              {payments.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin pagos registrados</p>
              ) : (
                payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium">{payment.concept}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(payment.date), "dd MMM yyyy", {
                          locale: es,
                        })}
                      </p>
                    </div>
                    <span className="text-sm font-medium">
                      ${payment.amount.toLocaleString("es-MX")}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onWhatsApp(member)}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              WhatsApp
            </Button>
            <Button className="flex-1" onClick={() => onRenew(member)}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Renovar
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
