export interface Member {
  id: string;
  name: string;
  phone: string;
  plan: string;
  startDate: string;
  endDate: string;
  amount: number;
  paymentMethod: string;
  notes?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  method: string;
  date: string;
  concept: string;
}

export interface Settings {
  gymName: string;
  reminderDays: number;
  plans: Plan[];
  messageTemplates: {
    expiring: string;
    expired: string;
  };
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  durationDays: number;
}

export type MemberStatus = 'activo' | 'por-vencer' | 'vencido';

export type FilterStatus = 'todos' | MemberStatus;

export type PaymentMethod = 'Efectivo' | 'Transferencia' | 'Tarjeta' | 'Cortesía';
