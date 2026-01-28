// Tipos
export interface IEntry {
  id: string;
  date: string;
  dayOfWeek: string;
  grossAmount: number;
  expenses: number;
  netAmount: number;
  description?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  category?: string;
}

export interface IUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface IWeeklySummary {
  entries: IEntry[];
  totals: {
    totalGross: number;
    totalExpenses: number;
    totalNet: number;
  };
  byDayOfWeek: Record<string, any>;
  daysCount: number;
  period: {
    start: string;
    end: string;
  };
}

export interface IUserStats {
  totals: {
    entries: number;
    grossAmount: number;
    expenses: number;
    netAmount: number;
  };
  averages: {
    grossAmount: number;
    expenses: number;
    netAmount: number;
  };
  bestDay?: IEntry;
  worstDay?: IEntry;
}
