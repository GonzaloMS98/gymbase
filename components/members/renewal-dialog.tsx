"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Member, Settings, PaymentMethod } from "@/lib/types";
import { calculateNewEndDate } from "@/lib/utils/member-status";

interface RenewalDialogProps {
  member: Member | null;
  settings: Settings;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    memberId: string,
    planName: string,
    amount: number,
    method: PaymentMethod,
    newEndDate: string,
    notes?: string
  ) => void;
}

const paymentMethods: PaymentMethod[] = [
  "Efectivo",
  "Transferencia",
  "Tarjeta",
  "Cortesía",
];

export function RenewalDialog({
  member,
  settings,
  open,
  onOpenChange,
  onSubmit,
}: RenewalDialogProps) {
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Efectivo");
  const [notes, setNotes] = useState("");
  const [useCustomDate, setUseCustomDate] = useState(false);
  const [customEndDate, setCustomEndDate] = useState("");

  // Reset form when member changes
  useEffect(() => {
    if (member && open) {
      const currentPlan = settings.plans.find(
        (p) => p.name === member.plan
      );
      setSelectedPlanId(currentPlan?.id || settings.plans[1]?.id || "");
      setCustomAmount("");
      setPaymentMethod("Efectivo");
      setNotes("");
      setUseCustomDate(false);
      setCustomEndDate("");
    }
  }, [member, open, settings.plans]);

  if (!member) return null;

  const selectedPlan = settings.plans.find((p) => p.id === selectedPlanId);
  const isCustomPlan = selectedPlanId === "personalizado";

  // Calculate new end date from today
  const today = new Date().toISOString().split("T")[0];
  const calculatedEndDate = selectedPlan
    ? calculateNewEndDate(today, selectedPlan.durationDays)
    : customEndDate;

  const finalEndDate = useCustomDate ? customEndDate : calculatedEndDate;
  const finalAmount = isCustomPlan
    ? parseFloat(customAmount) || 0
    : selectedPlan?.price || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!finalEndDate || finalAmount <= 0) return;

    const planName = isCustomPlan
      ? "Personalizado"
      : selectedPlan?.name || member.plan;

    onSubmit(
      member.id,
      planName,
      finalAmount,
      paymentMethod,
      finalEndDate,
      notes || undefined
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Renovar membresía</DialogTitle>
        </DialogHeader>

        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-sm font-medium">{member.name}</p>
          <p className="text-xs text-muted-foreground">
            Vence: {new Date(member.endDate).toLocaleDateString("es-MX")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="plan">Plan</Label>
            <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un plan" />
              </SelectTrigger>
              <SelectContent>
                {settings.plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name} - ${plan.price}
                  </SelectItem>
                ))}
                <SelectItem value="personalizado">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isCustomPlan && (
            <div className="space-y-2">
              <Label htmlFor="customAmount">Monto personalizado</Label>
              <Input
                id="customAmount"
                type="number"
                placeholder="500"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                required={isCustomPlan}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Método de pago</Label>
            <Select
              value={paymentMethod}
              onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="endDate">Nueva fecha de vencimiento</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setUseCustomDate(!useCustomDate)}
              >
                {useCustomDate ? "Usar calculada" : "Personalizar"}
              </Button>
            </div>
            <Input
              id="endDate"
              type="date"
              value={finalEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              disabled={!useCustomDate && !isCustomPlan}
              className={!useCustomDate && !isCustomPlan ? "bg-muted" : ""}
            />
            {!useCustomDate && !isCustomPlan && (
              <p className="text-xs text-muted-foreground">
                Calculada a partir de hoy
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Información adicional..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          {/* Summary */}
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total a pagar</span>
              <span className="text-lg font-semibold">
                ${finalAmount.toLocaleString("es-MX")}
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!finalEndDate || finalAmount <= 0}
            >
              Confirmar renovación
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
