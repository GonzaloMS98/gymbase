"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import useSWR from "swr";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getPayments } from "@/lib/supabase/database";
import { Payment } from "@/lib/types";
import { CreditCard, Search, X } from "lucide-react";

export default function PagosPage() {
  const { data: payments = [], isLoading } = useSWR<Payment[]>(
    "payments",
    getPayments
  );
  const [search, setSearch] = useState("");

  const filteredPayments = payments
    .filter((payment) => {
      if (!search) return true;
      const searchLower = search.toLowerCase();
      return (
        payment.memberName.toLowerCase().includes(searchLower) ||
        payment.concept.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalMonth = payments
    .filter((p) => {
      const paymentDate = new Date(p.date);
      const today = new Date();
      return (
        paymentDate.getMonth() === today.getMonth() &&
        paymentDate.getFullYear() === today.getFullYear()
      );
    })
    .reduce((sum, p) => sum + p.amount, 0);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Pagos</h1>
        <p className="text-sm text-muted-foreground">
          Historial de pagos registrados
        </p>
      </header>

      {/* Summary Card */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total del mes
          </CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CreditCard className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${totalMonth.toLocaleString("es-MX")}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {filteredPayments.filter((p) => {
              const d = new Date(p.date);
              const today = new Date();
              return (
                d.getMonth() === today.getMonth() &&
                d.getFullYear() === today.getFullYear()
              );
            }).length}{" "}
            transacciones este mes
          </p>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar por nombre o concepto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-9"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        {filteredPayments.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12">
            <p className="text-muted-foreground">No se encontraron pagos</p>
          </div>
        ) : (
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alumno</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Concepto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {payment.memberName}
                    </TableCell>
                    <TableCell>
                      {format(new Date(payment.date), "dd MMM yyyy", {
                        locale: es,
                      })}
                    </TableCell>
                    <TableCell className="font-medium">
                      ${payment.amount.toLocaleString("es-MX")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{payment.method}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {payment.concept}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="grid gap-3 md:hidden">
        {filteredPayments.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12">
            <p className="text-muted-foreground">No se encontraron pagos</p>
          </div>
        ) : (
          filteredPayments.map((payment) => (
            <Card key={payment.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{payment.memberName}</p>
                    <p className="text-sm text-muted-foreground">
                      {payment.concept}
                    </p>
                  </div>
                  <p className="font-semibold">
                    ${payment.amount.toLocaleString("es-MX")}
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {payment.method}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(payment.date), "dd MMM yyyy", {
                      locale: es,
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
