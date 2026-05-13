import { differenceInDays, parseISO, startOfDay } from "date-fns";
import { Member, MemberStatus, Settings } from "../types";

export function getMemberStatus(
  member: Member,
  reminderDays: number = 5
): MemberStatus {
  const today = startOfDay(new Date());
  const endDate = startOfDay(parseISO(member.endDate));
  const daysRemaining = differenceInDays(endDate, today);

  if (daysRemaining < 0) {
    return "vencido";
  } else if (daysRemaining <= reminderDays) {
    return "por-vencer";
  }
  return "activo";
}

export function getDaysRemaining(member: Member): number {
  const today = startOfDay(new Date());
  const endDate = startOfDay(parseISO(member.endDate));
  return differenceInDays(endDate, today);
}

export function getStatusLabel(status: MemberStatus): string {
  switch (status) {
    case "activo":
      return "Activo";
    case "por-vencer":
      return "Por vencer";
    case "vencido":
      return "Vencido";
  }
}

export function generateWhatsAppLink(
  member: Member,
  settings: Settings
): string {
  const status = getMemberStatus(member, settings.reminderDays);
  const template =
    status === "vencido"
      ? settings.messageTemplates.expired
      : settings.messageTemplates.expiring;

  const formattedDate = new Date(member.endDate).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const message = template
    .replace("{nombre}", member.name.split(" ")[0])
    .replace("{gym}", settings.gymName)
    .replace("{fecha_vencimiento}", formattedDate);

  const phone = member.phone.replace(/\D/g, "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function calculateNewEndDate(startDate: string, durationDays: number): string {
  const start = parseISO(startDate);
  const end = new Date(start);
  end.setDate(end.getDate() + durationDays);
  return end.toISOString().split("T")[0];
}
