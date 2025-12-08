  export interface Expense {
    id: number;
    date: string;      // ISO date
    title: string;
    category?: string;
    amount: number;
    paymentMethod?: string;
    notes?: string;
  }