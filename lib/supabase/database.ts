"use client";

import { createClient } from "./client";
import type { Member, Payment, Settings, Plan } from "@/lib/types";

const supabase = createClient();

// Helper to convert database row to Member type
function dbToMember(row: {
  id: string;
  name: string;
  phone: string;
  plan: string;
  start_date: string;
  end_date: string;
  amount: number;
  payment_method: string;
  notes: string | null;
  created_at: string;
}): Member {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    plan: row.plan,
    startDate: row.start_date,
    endDate: row.end_date,
    amount: Number(row.amount),
    paymentMethod: row.payment_method,
    notes: row.notes || undefined,
    createdAt: row.created_at,
  };
}

// Helper to convert database row to Payment type
function dbToPayment(row: {
  id: string;
  member_id: string;
  member_name: string;
  amount: number;
  method: string;
  date: string;
  concept: string;
}): Payment {
  return {
    id: row.id,
    memberId: row.member_id,
    memberName: row.member_name,
    amount: Number(row.amount),
    method: row.method,
    date: row.date,
    concept: row.concept,
  };
}

// Helper to convert database row to Settings type
function dbToSettings(row: {
  gym_name: string;
  reminder_days: number;
  plans: Plan[];
  message_templates: { expiring: string; expired: string };
}): Settings {
  return {
    gymName: row.gym_name,
    reminderDays: row.reminder_days,
    plans: row.plans,
    messageTemplates: row.message_templates,
  };
}

// ============ MEMBERS ============

export async function getMembers(): Promise<Member[]> {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching members:", error);
    return [];
  }

  return (data || []).map(dbToMember);
}

export async function getMemberById(id: string): Promise<Member | null> {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching member:", error);
    return null;
  }

  return data ? dbToMember(data) : null;
}

export async function createMember(
  member: Omit<Member, "id" | "createdAt">
): Promise<Member | null> {
  const { data, error } = await supabase
    .from("members")
    .insert({
      name: member.name,
      phone: member.phone,
      plan: member.plan,
      start_date: member.startDate,
      end_date: member.endDate,
      amount: member.amount,
      payment_method: member.paymentMethod,
      notes: member.notes || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating member:", error);
    return null;
  }

  return data ? dbToMember(data) : null;
}

export async function updateMember(
  id: string,
  updates: Partial<Omit<Member, "id" | "createdAt">>
): Promise<Member | null> {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
  if (updates.plan !== undefined) dbUpdates.plan = updates.plan;
  if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
  if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate;
  if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
  if (updates.paymentMethod !== undefined)
    dbUpdates.payment_method = updates.paymentMethod;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes || null;

  const { data, error } = await supabase
    .from("members")
    .update(dbUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating member:", error);
    return null;
  }

  return data ? dbToMember(data) : null;
}

export async function deleteMember(id: string): Promise<boolean> {
  const { error } = await supabase.from("members").delete().eq("id", id);

  if (error) {
    console.error("Error deleting member:", error);
    return false;
  }

  return true;
}

// ============ PAYMENTS ============

export async function getPayments(): Promise<Payment[]> {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    console.error("Error fetching payments:", error);
    return [];
  }

  return (data || []).map(dbToPayment);
}

export async function getPaymentsByMemberId(
  memberId: string
): Promise<Payment[]> {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("member_id", memberId)
    .order("date", { ascending: false });

  if (error) {
    console.error("Error fetching payments for member:", error);
    return [];
  }

  return (data || []).map(dbToPayment);
}

export async function createPayment(
  payment: Omit<Payment, "id">
): Promise<Payment | null> {
  const { data, error } = await supabase
    .from("payments")
    .insert({
      member_id: payment.memberId,
      member_name: payment.memberName,
      amount: payment.amount,
      method: payment.method,
      date: payment.date,
      concept: payment.concept,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating payment:", error);
    return null;
  }

  return data ? dbToPayment(data) : null;
}

// ============ SETTINGS ============

const SETTINGS_ID = "00000000-0000-0000-0000-000000000001";

export async function getSettings(): Promise<Settings> {
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("id", SETTINGS_ID)
    .single();

  if (error || !data) {
    console.error("Error fetching settings:", error);
    // Return defaults if settings not found
    return {
      gymName: "Yokai Gym",
      reminderDays: 5,
      plans: [
        { id: "semanal", name: "Semanal", price: 150, durationDays: 7 },
        { id: "mensual", name: "Mensual", price: 500, durationDays: 30 },
        { id: "clase-suelta", name: "Clase suelta", price: 50, durationDays: 1 },
      ],
      messageTemplates: {
        expiring:
          "Hola {nombre}, te recordamos que tu mensualidad en {gym} está próxima a vencer el {fecha_vencimiento}. Puedes renovar en recepción para seguir entrenando sin interrupciones.",
        expired:
          "Hola {nombre}, tu mensualidad en {gym} venció el {fecha_vencimiento}. Puedes renovar en recepción para reactivar tu acceso.",
      },
    };
  }

  return dbToSettings(data);
}

export async function updateSettings(
  updates: Partial<Settings>
): Promise<Settings | null> {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.gymName !== undefined) dbUpdates.gym_name = updates.gymName;
  if (updates.reminderDays !== undefined)
    dbUpdates.reminder_days = updates.reminderDays;
  if (updates.plans !== undefined) dbUpdates.plans = updates.plans;
  if (updates.messageTemplates !== undefined)
    dbUpdates.message_templates = updates.messageTemplates;
  dbUpdates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("settings")
    .update(dbUpdates)
    .eq("id", SETTINGS_ID)
    .select()
    .single();

  if (error) {
    console.error("Error updating settings:", error);
    return null;
  }

  return data ? dbToSettings(data) : null;
}
