// pages/history/index.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Calendar } from 'primereact/calendar';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { useRef } from 'react';
import { formatDateForAPI, formatDateToDisplay, getDayOfWeekName } from '../../utils/dates';
import { IDayDetails, IDaySummary } from '../../lib/interface';
import apiClient from '../../lib/api';
import DayCard from '../../components/DayCard';
import { DayDetailsModal } from './DayDetailsModal';

export default function HistoryPage() {
  const router = useRouter();
  const toast = useRef<Toast>(null);

  const [recentDays, setRecentDays] = useState<IDaySummary[]>([]);
  const [selectedDay, setSelectedDay] = useState<IDayDetails | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchDate, setSearchDate] = useState<string>('');
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    loadRecentDays();
  }, []);

  const loadRecentDays = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getRecentDaysSummary(7);
      setRecentDays(response.data);
    } catch (error: any) {
      showError('Erro ao carregar histórico', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchDate = async () => {
    if (!searchDate) {
      showError('Erro', 'Selecione uma data para buscar');
      return;
    }

    try {
      setSearchLoading(true);

      console.log('Data enviada para API:', searchDate);

      const response = await apiClient.getDayDetails(searchDate);

      setSelectedDay(response.data);
      setModalVisible(true);
    } catch (error: any) {
      if (error.response?.status === 404) {
        showInfo(
          'Sem registros',
          `Nenhum registro encontrado para ${formatDateToDisplay(searchDate)}`
        );
      } else {
        showError('Erro na busca', error.message || 'Erro desconhecido');
      }
    } finally {
      setSearchLoading(false);
    }
  };

  const handleDayClick = async (day: IDaySummary) => {
    if (!day.hasEntries) {
      showInfo('Sem registros', `Nenhum registro encontrado para ${formatDateToDisplay(day.date)}`);
      return;
    }

    try {
      const response = await apiClient.getDayDetails(day.date);
      setSelectedDay(response.data);
      setModalVisible(true);
    } catch (error: any) {
      showError('Erro ao carregar detalhes', error.message);
    }
  };

  const showError = (title: string, message: string) => {
    toast.current?.show({
      severity: 'error',
      summary: title,
      detail: message,
      life: 5000,
    });
  };

  const showInfo = (title: string, message: string) => {
    toast.current?.show({
      severity: 'info',
      summary: title,
      detail: message,
      life: 3000,
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const daysWithEntries = recentDays.filter(day => day.hasEntries);
  const totalLiquido = daysWithEntries.reduce((sum, day) => sum + day.totalNetAmount, 0);
  const mediaDiaria = daysWithEntries.length > 0 ? totalLiquido / daysWithEntries.length : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Toast ref={toast} position="top-right" />

      <div className="mb-6">
        <Button
          label="Voltar para Dashboard"
          icon="pi pi-arrow-left"
          className="p-button-text text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          onClick={() => router.push('/')}
        />
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mt-2">
          Histórico Detalhado
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Visualize e analise seus registros diários
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 md:mb-0">
              <i className="pi pi-calendar mr-2"></i>
              Buscar por Data
            </h3>
            <div className="flex gap-2">
              <Calendar
                value={searchDate ? new Date(`${searchDate}T00:00:00`) : null}
                placeholder="Selecione uma data"
                onChange={e => {
                  if (e.value) {
                    setSearchDate(formatDateForAPI(e.value));
                  } else {
                    setSearchDate('');
                  }
                }}
              />
              <Button
                icon="pi pi-search"
                onClick={handleSearchDate}
                loading={searchLoading}
                disabled={!searchDate}
                className="p-button-primary bg-blue-500 hover:bg-blue-600 border-blue-500 p-2"
              />
            </div>
          </div>

          <div className="hidden md:block h-12 w-px bg-gray-200 dark:bg-gray-700 mx-4"></div>

          <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg min-w-[120px]">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total de Dias</div>
            <div className="text-xl font-bold text-gray-800 dark:text-white">
              {daysWithEntries.length}
            </div>
          </div>

          <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg min-w-[120px]">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Média Diária</div>
            <div className="text-xl font-bold text-green-600">{formatCurrency(mediaDiaria)}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card
          title={
            <div className="flex items-center gap-2">
              <span>Últimos 7 Dias</span>
              <Tag value="Recente" severity="info" />
            </div>
          }
          className="lg:col-span-2"
        >
          <div className="p-5">
            {loading ? (
              <div className="flex justify-center py-10">
                <ProgressSpinner />
              </div>
            ) : recentDays.length > 0 ? (
              <div className="space-y-4">
                {recentDays.map(day => (
                  <DayCard
                    key={day.date}
                    day={getDayOfWeekName(day.date)}
                    date={formatDateToDisplay(day.date)}
                    grossAmount={day.totalGrossAmount}
                    expenses={day.totalExpenses}
                    netAmount={day.totalNetAmount}
                    description={day.previewDescription}
                    clickable={true}
                    onClick={() => handleDayClick(day)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <i className="pi pi-inbox text-4xl text-gray-300 dark:text-gray-600 mb-3"></i>
                <p className="text-gray-500 dark:text-gray-400">Nenhum registro encontrado</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                  Adicione seu primeiro dia de trabalho
                </p>
                <Button
                  label="Adicionar primeiro registro"
                  icon="pi pi-plus"
                  className="btn-99 bg-[#FFC107] hover:bg-[#FFB300] border-[#FFC107]"
                  onClick={() => router.push('/add-entry')}
                />
              </div>
            )}
          </div>
        </Card>
      </div>

      <DayDetailsModal
        dayDetails={selectedDay}
        visible={modalVisible}
        onHide={() => setModalVisible(false)}
        onDeleted={loadRecentDays}
      />
    </div>
  );
}
