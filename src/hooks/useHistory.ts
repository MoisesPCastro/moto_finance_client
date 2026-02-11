import { useState, useCallback } from 'react';
import {
  formatDateToDisplay,
  getDayOfWeekName,
  getDayOfWeekShort,
  addDays,
  getDaysDifference,
  formatDate,
  getToday,
  getDateDaysAgo,
} from '../utils/dates';
import apiClient from '../lib/api';

export function useHistory() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDayDetails = useCallback(async (date: string, userId?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getDayDetails(date, userId);
      return response.data;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Erro ao buscar detalhes do dia';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getRecentDaysSummary = useCallback(async (days: number = 7, userId?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getRecentDaysSummary(days, userId);
      return response.data;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Erro ao buscar resumo dos dias';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,

    getDayDetails,
    getRecentDaysSummary,

    formatDate: formatDate,
    getToday: getToday,
    getDateDaysAgo: getDateDaysAgo,

    formatDateToDisplay,
    getDayOfWeekName,
    getDayOfWeekShort,
    addDays,
    getDaysDifference,

    clearError: () => setError(null),
  };
}
