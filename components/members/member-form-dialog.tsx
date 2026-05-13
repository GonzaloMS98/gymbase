"use client";

import { useState } from "react";
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

interface MemberFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: Settings;
  onSubmit: (data: Omit<Member, "id" | "createdAt">) => void;
}

const paymentMethods: PaymentMethod[] = [
  "Efectivo",
  "Transferencia",
  "Tarjeta",
  "Cortesía",
];

export function MemberFormDialog({
  open,
  onOpenChange,
  settings,
  onSubmit,
}: MemberFormDialogProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState(settings.plans[1]?.id || "");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Efectivo");
  const [notes, setNotes] = useState("");

  const selectedPlan = settings.plans.find((p) => p.id === selectedPlanId);
  const endDate = selectedPlan
    ? calculateNewEndDate(startDate, selectedPlan.durationDays)
    : "";
  const amount = selectedPlan?.price || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPlan) return;

    onSubmit({
      name,
      phone,
      plan: selectedPlan.name,
      startDate,
      endDate,
      amount,
      paymentMethod,
      notes: notes || undefined,
    });

    // Reset form
    setName("");
    setPhone("");
    setSelectedPlanId(settings.plans[1]?.id || "");
    setStartDate(new Date().toISOString().split("T")[0]);
    setPaymentMethod("Efectivo");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar nuevo alumno</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre completo</Label>
            <Input
              id="name"
              placeholder="Juan Pérez"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">WhatsApp</Label>
            <Input
              id="phone"
              placeholder="5215512345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Incluye código de país (52 para México)
            </p>
          </div>

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
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha de inicio</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Fecha de vencimiento</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Monto</Label>
              <Input
                value={`$${amount}`}
                disabled
                className="bg-muted"
              />
            </div>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Información adicional..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Registrar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
