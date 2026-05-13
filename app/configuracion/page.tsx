"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { getSettings, updateSettings } from "@/lib/supabase/database";
import { Settings, Plan } from "@/lib/types";
import { toast } from "sonner";
import {
  Settings as SettingsIcon,
  Bell,
  FileText,
  CreditCard,
  Plus,
  Trash2,
  Save,
} from "lucide-react";

export default function ConfiguracionPage() {
  const { data: settings, isLoading } = useSWR<Settings>("settings", getSettings);
  const [localSettings, setLocalSettings] = useState<Settings | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize local settings when remote data loads
  const currentSettings = localSettings ?? settings;

  const handleChange = (updates: Partial<Settings>) => {
    if (!currentSettings) return;
    setLocalSettings({ ...currentSettings, ...updates });
    setHasChanges(true);
  };

  const handlePlanChange = (index: number, updates: Partial<Plan>) => {
    if (!currentSettings) return;
    const newPlans = [...currentSettings.plans];
    newPlans[index] = { ...newPlans[index], ...updates };
    handleChange({ plans: newPlans });
  };

  const handleAddPlan = () => {
    if (!currentSettings) return;
    const newPlan: Plan = {
      id: `plan-${Date.now()}`,
      name: "Nuevo plan",
      price: 0,
      durationDays: 30,
    };
    handleChange({ plans: [...currentSettings.plans, newPlan] });
  };

  const handleRemovePlan = (index: number) => {
    if (!currentSettings || currentSettings.plans.length <= 1) return;
    const newPlans = currentSettings.plans.filter((_, i) => i !== index);
    handleChange({ plans: newPlans });
  };

  const handleSave = async () => {
    if (!currentSettings) return;
    setIsSaving(true);

    const result = await updateSettings(currentSettings);

    if (result) {
      setHasChanges(false);
      setLocalSettings(null);
      mutate("settings");
      toast.success("Configuración guardada");
    } else {
      toast.error("Error al guardar la configuración");
    }

    setIsSaving(false);
  };

  if (isLoading || !currentSettings) {
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
          <h1 className="text-2xl font-bold">Configuración</h1>
          <p className="text-sm text-muted-foreground">
            Personaliza tu sistema de gestión
          </p>
        </div>
        {hasChanges && (
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Guardando..." : "Guardar cambios"}
          </Button>
        )}
      </header>

      <div className="space-y-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <SettingsIcon className="h-4 w-4" />
              General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gymName">Nombre del gimnasio</Label>
              <Input
                id="gymName"
                value={currentSettings.gymName}
                onChange={(e) => handleChange({ gymName: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-4 w-4" />
              Notificaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reminderDays">
                Días antes de vencimiento para recordatorio
              </Label>
              <Input
                id="reminderDays"
                type="number"
                min="1"
                max="30"
                value={currentSettings.reminderDays}
                onChange={(e) =>
                  handleChange({ reminderDays: parseInt(e.target.value) || 5 })
                }
                className="max-w-[100px]"
              />
              <p className="text-xs text-muted-foreground">
                Los alumnos con este número de días o menos aparecerán como
                &quot;Por vencer&quot;
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Plans */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4" />
              Planes disponibles
            </CardTitle>
            <Button variant="outline" size="sm" onClick={handleAddPlan}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Agregar
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentSettings.plans.map((plan, index) => (
              <div
                key={plan.id}
                className="rounded-lg border border-border p-4"
              >
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Nombre</Label>
                    <Input
                      value={plan.name}
                      onChange={(e) =>
                        handlePlanChange(index, { name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Precio ($)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={plan.price}
                      onChange={(e) =>
                        handlePlanChange(index, {
                          price: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Duración (días)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min="1"
                        value={plan.durationDays}
                        onChange={(e) =>
                          handlePlanChange(index, {
                            durationDays: parseInt(e.target.value) || 1,
                          })
                        }
                      />
                      {currentSettings.plans.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemovePlan(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Eliminar plan</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Message Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              Plantillas de mensaje
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="expiringMessage">
                Mensaje para alumnos por vencer
              </Label>
              <Textarea
                id="expiringMessage"
                rows={3}
                value={currentSettings.messageTemplates.expiring}
                onChange={(e) =>
                  handleChange({
                    messageTemplates: {
                      ...currentSettings.messageTemplates,
                      expiring: e.target.value,
                    },
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                Variables disponibles: {"{nombre}"}, {"{gym}"},{" "}
                {"{fecha_vencimiento}"}
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="expiredMessage">
                Mensaje para alumnos vencidos
              </Label>
              <Textarea
                id="expiredMessage"
                rows={3}
                value={currentSettings.messageTemplates.expired}
                onChange={(e) =>
                  handleChange({
                    messageTemplates: {
                      ...currentSettings.messageTemplates,
                      expired: e.target.value,
                    },
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                Variables disponibles: {"{nombre}"}, {"{gym}"},{" "}
                {"{fecha_vencimiento}"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button (Mobile) */}
        {hasChanges && (
          <div className="sticky bottom-20 md:hidden">
            <Button onClick={handleSave} disabled={isSaving} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
