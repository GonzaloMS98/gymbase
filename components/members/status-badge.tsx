"use client";

import { cn } from "@/lib/utils";
import { MemberStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: MemberStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        status === "activo" &&
          "bg-status-active/10 text-status-active",
        status === "por-vencer" &&
          "bg-status-expiring/10 text-status-expiring",
        status === "vencido" &&
          "bg-status-expired/10 text-status-expired",
        className
      )}
    >
      {status === "activo" && "Activo"}
      {status === "por-vencer" && "Por vencer"}
      {status === "vencido" && "Vencido"}
    </span>
  );
}
