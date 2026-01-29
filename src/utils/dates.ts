// utils/dates.ts

/**
 * Formata data para o formato YYYY-MM-DD
 * @param date Data (Date object ou string)
 * @returns Data formatada como YYYY-MM-DD
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;

  // Garantir que é uma data válida
  if (isNaN(d.getTime())) {
    throw new Error('Data inválida fornecida para formatDate');
  }

  return d.toISOString().split('T')[0];
};

export const getToday = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const getDateDaysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};

/**
 * Obtém o primeiro dia do mês atual
 * @returns Primeiro dia do mês atual (YYYY-MM-01)
 */
export const getFirstDayOfMonth = (): string => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
};

/**
 * Formata data para exibição no formato DD/MM/YYYY
 * @param date Data (Date object ou string)
 * @returns Data formatada como DD/MM/YYYY
 */
export const formatDateToDisplay = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) {
    return 'Data inválida';
  }

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
};

/**
 * Obtém o nome do dia da semana em português
 * @param date Data (Date object ou string)
 * @returns Nome do dia da semana (ex: "Segunda-feira")
 */
export const getDayOfWeekName = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) {
    return 'Data inválida';
  }

  const days = [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
  ];

  return days[d.getDay()];
};

/**
 * Obtém a abreviação do dia da semana em português
 * @param date Data (Date object ou string)
 * @returns Abreviação do dia (ex: "Seg")
 */
export const getDayOfWeekShort = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) {
    return 'Inválida';
  }

  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  return days[d.getDay()];
};

/**
 * Verifica se uma string está no formato YYYY-MM-DD
 * @param dateString String a ser validada
 * @returns Verdadeiro se estiver no formato correto
 */
export const isValidDateString = (dateString: string): boolean => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const date = new Date(dateString);
  return !isNaN(date.getTime()) && dateString === date.toISOString().split('T')[0];
};

/**
 * Calcula a diferença em dias entre duas datas
 * @param startDate Data inicial
 * @param endDate Data final
 * @returns Número de dias de diferença
 */
export const getDaysDifference = (startDate: Date | string, endDate: Date | string): number => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Adiciona dias a uma data
 * @param date Data base
 * @param days Número de dias a adicionar (pode ser negativo)
 * @returns Nova data
 */
export const addDays = (date: Date | string, days: number): Date => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const newDate = new Date(d);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
};

/**
 * Obtém o último dia do mês
 * @param year Ano
 * @param month Mês (1-12)
 * @returns Último dia do mês
 */
export const getLastDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 0).getDate();
};

/**
 * Gera um array de datas entre um intervalo
 * @param startDate Data inicial
 * @param endDate Data final
 * @returns Array de strings no formato YYYY-MM-DD
 */
export const getDateRange = (startDate: Date | string, endDate: Date | string): string[] => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

  const dates: string[] = [];
  const current = new Date(start);

  while (current <= end) {
    dates.push(formatDate(new Date(current)));
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

export const formatDateForAPI = (date: Date | string): string => {
  let d: Date;

  if (typeof date === 'string') {
    // Se já for YYYY-MM-DD, retorna
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    d = new Date(date);
  } else {
    d = date;
  }

  // Usar UTC para evitar problemas de timezone
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};
