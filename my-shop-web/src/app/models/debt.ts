export enum DebtDirection {
    WeOwe = 1,    // نحن مدينون
    OwedToUs = 2  // الآخرين مدينون لنا
  }
  
  export interface Debt {
    id?: number;
    personName: string;
    isVendor: boolean;
    phone?: string;
    date: string;   // ISO string (yyyy-MM-dd or full ISO)
    amount: number; // number -> serialized as JSON number (backend decimal)
    direction: DebtDirection | number;
    notes?: string | null;
  }
  