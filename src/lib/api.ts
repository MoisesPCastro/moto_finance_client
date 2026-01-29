import axios from 'axios';
import { IDayDetails, IDaySummary, IEntry, IUser, IWeeklySummary } from './interface';
import { isValidDateString } from '../utils/dates';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    authorization: API_TOKEN,
  },
});

export const apiClient = {
  createEntry: (data: Omit<IEntry, 'id' | 'createdAt' | 'updatedAt' | 'netAmount'>) =>
    api.post<IEntry>('/entries', data),

  getEntries: (userId?: string) =>
    api.get<{ entries: IEntry[]; meta: any }>('/entries', {
      params: { userId },
    }),

  getEntry: (id: string) => api.get<IEntry>(`/entries/${id}`),

  updateEntry: (id: string, data: Partial<IEntry>) => api.patch<IEntry>(`/entries/${id}`, data),

  deleteEntry: (id: string) => api.delete(`/entries/${id}`),

  getWeeklySummary: (userId: string, start: string, end: string) =>
    api.get<IWeeklySummary>('/entries/reports/weekly', {
      params: { userId, start, end },
    }),

  getMonthlySummary: (userId: string, year: number, month: number) =>
    api.get<IWeeklySummary>('/entries/reports/monthly', {
      params: { userId, year, month },
    }),

  getUserStats: (userId: string) => api.get<any>(`/entries/reports/stats/${userId}`),

  getRecentEntries: (userId: string, limit: number = 7) =>
    api.get<IEntry[]>(`/entries/reports/recent/${userId}`, {
      params: { limit },
    }),

  createUser: (data: { email: string; name: string; password: string }) =>
    api.post<IUser>('/users', data),

  getUsers: () => api.get<IUser[]>('/users'),

  getUser: (id: string) => api.get<IUser>(`/users/${id}`),

  getUserByEmail: (email: string) => api.get<IUser>(`/users/email/${email}`),

  getUserStatsFiltered: (userId: string, params: { startDate?: string; endDate?: string }) =>
    api.get<any>(`/entries/stats/${userId}/filtered`, { params }),

  getDayDetails: (date: string, userId?: string) => {
    if (!isValidDateString(date)) {
      throw new Error(`Data inválida: ${date}. Use o formato YYYY-MM-DD`);
    }

    return api.get<IDayDetails>('/entries/day/details', {
      params: { date, userId },
    });
  },

  getRecentDaysSummary: (days: number = 7, userId?: string) => {
    if (days < 1 || days > 365) {
      throw new Error('Número de dias deve estar entre 1 e 365');
    }

    return api.get<IDaySummary[]>('/entries/recent/summary', {
      params: { days, userId },
    });
  },
};

export default apiClient;
