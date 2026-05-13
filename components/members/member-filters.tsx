"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FilterStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";

interface MemberFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  filter: FilterStatus;
  onFilterChange: (value: FilterStatus) => void;
}

const filterOptions: { value: FilterStatus; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "activo", label: "Activos" },
  { value: "por-vencer", label: "Por vencer" },
  { value: "vencido", label: "Vencidos" },
];

export function MemberFilters({
  search,
  onSearchChange,
  filter,
  onFilterChange,
}: MemberFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar por nombre o teléfono..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 pr-9"
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
        {filterOptions.map((option) => (
          <Button
            key={option.value}
            variant={filter === option.value ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange(option.value)}
            className={cn(
              "shrink-0 text-xs",
              filter === option.value && "bg-primary text-primary-foreground"
            )}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
