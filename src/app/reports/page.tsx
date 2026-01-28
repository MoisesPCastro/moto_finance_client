'use client';

import { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { TabView, TabPanel } from 'primereact/tabview';
import { ProgressSpinner } from 'primereact/progressspinner';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Chart } from 'primereact/chart';
import { Divider } from 'primereact/divider';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { IEntry } from '@/lib/interface';

interface WeeklyEntry {
  day: string;
  gross: number;
  expenses: number;
  net: number;
}

interface MonthlyWeek {
  week: string;
  gross: number;
  expenses: number;
  net: number;
}

interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
}

interface ReportData {
  weekly?: {
    entries: WeeklyEntry[];
    totals: {
      gross: number;
      expenses: number;
      net: number;
    };
  };
  monthly?: {
    byWeek: MonthlyWeek[];
    totals: {
      gross: number;
      expenses: number;
      net: number;
    };
    byCategory: CategoryData[];
  };
  entries?: IEntry[];
  stats?: any;
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [reportType, setReportType] = useState<'weekly' | 'monthly'>('monthly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});
  const toast = useRef<Toast>(null);
  const { users } = useAuth();
  const user = users[0]

  // Buscar dados da API
  const fetchReportData = async () => {
    if (!user?.id) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Aviso',
        detail: 'Usuário não autenticado',
        life: 3000,
      });
      return;
    }

    try {
      setLoading(true);

      // Buscar estatísticas do usuário
      const statsResponse = await apiClient.getUserStats(user.id);
      const stats = statsResponse.data;

      // Buscar entradas do usuário
      const entriesResponse = await apiClient.getEntries(user.id);
      const entries = entriesResponse.data.entries || [];

      let processedData: ReportData = { stats, entries };

      // Processar dados baseado no tipo de relatório
      if (reportType === 'weekly') {
        const weeklyData = processWeeklyData(entries);
        processedData.weekly = weeklyData;
      } else {
        const monthlyData = processMonthlyData(entries, selectedYear, selectedMonth);
        processedData.monthly = monthlyData;
      }

      setReportData(processedData);
      updateCharts(processedData);

    } catch (error: any) {
      console.error('Erro ao buscar dados:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Falha ao carregar relatórios',
        life: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const processWeeklyData = (entries: IEntry[]) => {
    // Últimos 7 dias
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyEntries = entries.filter(entry =>
      new Date(entry.date) >= oneWeekAgo
    );

    // Agrupar por dia da semana
    const daysMap = new Map<string, WeeklyEntry>();
    const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

    weeklyEntries.forEach(entry => {
      const date = new Date(entry.date);
      const dayName = daysOfWeek[date.getDay()];
      const dayKey = `${dayName} (${date.getDate()})`;

      if (!daysMap.has(dayKey)) {
        daysMap.set(dayKey, {
          day: dayKey,
          gross: 0,
          expenses: 0,
          net: 0,
        });
      }

      const dayData = daysMap.get(dayKey)!;
      dayData.gross += entry.grossAmount;
      dayData.expenses += entry.expenses;
      dayData.net += entry.netAmount;
    });

    const entriesArray = Array.from(daysMap.values())
      .sort((a, b) => {
        const daysOrder = daysOfWeek.map(d => d.substring(0, 3));
        const aDay = a.day.substring(0, 3);
        const bDay = b.day.substring(0, 3);
        return daysOrder.indexOf(aDay) - daysOrder.indexOf(bDay);
      });

    // Calcular totais
    const totals = entriesArray.reduce(
      (acc, entry) => ({
        gross: acc.gross + entry.gross,
        expenses: acc.expenses + entry.expenses,
        net: acc.net + entry.net,
      }),
      { gross: 0, expenses: 0, net: 0 }
    );

    return {
      entries: entriesArray,
      totals,
    };
  };

  const processMonthlyData = (entries: IEntry[], year: number, month: number) => {
    // Filtrar por mês selecionado
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    const monthlyEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= startDate && entryDate <= endDate;
    });

    // Agrupar por semana
    const weeksMap = new Map<string, MonthlyWeek>();

    monthlyEntries.forEach(entry => {
      const date = new Date(entry.date);
      const weekNumber = Math.ceil(date.getDate() / 7);
      const weekKey = `Semana ${weekNumber}`;

      if (!weeksMap.has(weekKey)) {
        weeksMap.set(weekKey, {
          week: weekKey,
          gross: 0,
          expenses: 0,
          net: 0,
        });
      }

      const weekData = weeksMap.get(weekKey)!;
      weekData.gross += entry.grossAmount;
      weekData.expenses += entry.expenses;
      weekData.net += entry.netAmount;
    });

    const byWeek = Array.from(weeksMap.values())
      .sort((a, b) => parseInt(a.week.split(' ')[1]) - parseInt(b.week.split(' ')[1]));

    // Calcular totais
    const totals = byWeek.reduce(
      (acc, week) => ({
        gross: acc.gross + week.gross,
        expenses: acc.expenses + week.expenses,
        net: acc.net + week.net,
      }),
      { gross: 0, expenses: 0, net: 0 }
    );

    // Agrupar por categoria
    const categoriesMap = new Map<string, number>();
    let totalExpenses = 0;

    monthlyEntries.forEach(entry => {
      if (entry.category) {
        const currentAmount = categoriesMap.get(entry.category) || 0;
        categoriesMap.set(entry.category, currentAmount + entry.expenses);
        totalExpenses += entry.expenses;
      }
    });

    const byCategory: CategoryData[] = [];
    categoriesMap.forEach((amount, category) => {
      byCategory.push({
        category,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      });
    });

    // Ordenar por maior valor
    byCategory.sort((a, b) => b.amount - a.amount);

    return {
      byWeek,
      totals,
      byCategory,
    };
  };

  const updateCharts = (data: ReportData) => {
    const documentStyle = getComputedStyle(document.documentElement);

    if (reportType === 'weekly' && data.weekly) {
      // Gráfico de barras para semana
      const chartData = {
        labels: data.weekly.entries.map(e => e.day.split(' ')[0]),
        datasets: [
          {
            label: 'Ganho Bruto',
            backgroundColor: documentStyle.getPropertyValue('--green-500'),
            data: data.weekly.entries.map(e => e.gross),
          },
          {
            label: 'Gastos',
            backgroundColor: documentStyle.getPropertyValue('--red-500'),
            data: data.weekly.entries.map(e => e.expenses),
          },
          {
            label: 'Lucro Líquido',
            backgroundColor: documentStyle.getPropertyValue('--blue-500'),
            data: data.weekly.entries.map(e => e.net),
          },
        ],
      };

      setChartData(chartData);
      setChartOptions({
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value: any) {
                return 'R$ ' + value.toFixed(2);
              }
            }
          }
        }
      });

    } else if (reportType === 'monthly' && data.monthly) {
      // Gráfico de pizza para categorias mensais
      const chartData = {
        labels: data.monthly.byCategory.map(c => c.category),
        datasets: [
          {
            data: data.monthly.byCategory.map(c => c.amount),
            backgroundColor: [
              documentStyle.getPropertyValue('--red-500'),
              documentStyle.getPropertyValue('--orange-500'),
              documentStyle.getPropertyValue('--blue-500'),
              documentStyle.getPropertyValue('--green-500'),
              documentStyle.getPropertyValue('--purple-500'),
              documentStyle.getPropertyValue('--yellow-500'),
            ],
          },
        ],
      };

      setChartData(chartData);
      setChartOptions({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
          },
          tooltip: {
            callbacks: {
              label: function (context: any) {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: R$ ${value.toFixed(2)} (${percentage}%)`;
              }
            }
          }
        }
      });
    }
  };

  const reportTypes = [
    { label: 'Relatório Semanal', value: 'weekly' },
    { label: 'Relatório Mensal', value: 'monthly' },
  ];

  const years = Array.from({ length: 5 }, (_, i) => ({
    label: (new Date().getFullYear() - i).toString(),
    value: new Date().getFullYear() - i,
  }));

  const months = [
    { label: 'Janeiro', value: 0 },
    { label: 'Fevereiro', value: 1 },
    { label: 'Março', value: 2 },
    { label: 'Abril', value: 3 },
    { label: 'Maio', value: 4 },
    { label: 'Junho', value: 5 },
    { label: 'Julho', value: 6 },
    { label: 'Agosto', value: 7 },
    { label: 'Setembro', value: 8 },
    { label: 'Outubro', value: 9 },
    { label: 'Novembro', value: 10 },
    { label: 'Dezembro', value: 11 },
  ];

  const exportToCSV = () => {
    if (!reportData?.entries || reportData.entries.length === 0) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Aviso',
        detail: 'Nenhum dado para exportar',
        life: 3000,
      });
      return;
    }

    try {
      const headers = ['Data', 'Descrição', 'Categoria', 'Bruto (R$)', 'Gastos (R$)', 'Líquido (R$)'];
      const csvData = reportData.entries.map(entry => [
        new Date(entry.date).toLocaleDateString('pt-BR'),
        entry.description || '',
        entry.category || '',
        entry.grossAmount.toFixed(2),
        entry.expenses.toFixed(2),
        entry.netAmount.toFixed(2),
      ]);

      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `relatorio_${reportType}_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      toast.current?.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Relatório exportado com sucesso!',
        life: 3000,
      });
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao exportar relatório',
        life: 5000,
      });
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchReportData();
    }
  }, [user, reportType, selectedYear, selectedMonth]);

  useEffect(() => {
    if (reportData) {
      updateCharts(reportData);
    }
  }, [reportData, reportType]);

  if (loading && !reportData) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toast ref={toast} />

      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Relatórios e Análises
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Visualize seus ganhos, gastos e tendências
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            label="Exportar CSV"
            icon="pi pi-download"
            className="p-button-outlined"
            onClick={exportToCSV}
            disabled={!reportData?.entries || reportData.entries.length === 0}
          />
          <Button
            label="Atualizar"
            icon="pi pi-refresh"
            className="btn-99"
            onClick={fetchReportData}
            loading={loading}
          />
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Tipo de Relatório
            </label>
            <Dropdown
              value={reportType}
              options={reportTypes}
              onChange={(e) => setReportType(e.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Ano</label>
            <Dropdown
              value={selectedYear}
              options={years}
              onChange={(e) => setSelectedYear(e.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Mês</label>
            <Dropdown
              value={selectedMonth}
              options={months}
              onChange={(e) => setSelectedMonth(e.value)}
              className="w-full"
              disabled={reportType === 'weekly'}
            />
          </div>

          <div className="flex items-end">
            <Button
              label="Gerar Relatório"
              icon="pi pi-refresh"
              className="btn-99 w-full"
              onClick={fetchReportData}
              loading={loading}
            />
          </div>
        </div>
      </Card>

      {/* Estatísticas rápidas */}
      {reportData?.stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="text-center">
            <div className="text-sm text-gray-500 mb-1">Total de Registros</div>
            <div className="text-2xl font-bold text-primary">
              {reportData.stats.totals?.entries || 0}
            </div>
          </Card>

          <Card className="text-center">
            <div className="text-sm text-gray-500 mb-1">Total Bruto</div>
            <div className="text-2xl font-bold text-green-600">
              R$ {(reportData.stats.totals?.grossAmount || 0).toFixed(2)}
            </div>
          </Card>

          <Card className="text-center">
            <div className="text-sm text-gray-500 mb-1">Total Gastos</div>
            <div className="text-2xl font-bold text-red-600">
              R$ {(reportData.stats.totals?.expenses || 0).toFixed(2)}
            </div>
          </Card>

          <Card className="text-center">
            <div className="text-sm text-gray-500 mb-1">Total Líquido</div>
            <div className="text-2xl font-bold text-blue-600">
              R$ {(reportData.stats.totals?.netAmount || 0).toFixed(2)}
            </div>
          </Card>
        </div>
      )}
      {/* Abas */}
      <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
        <TabPanel header="Visão Geral">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico */}
            <Card title="Distribuição Visual">
              <div className="h-80">
                <Chart
                  type={reportType === 'weekly' ? 'bar' : 'pie'}
                  data={chartData}
                  options={chartOptions}
                />
              </div>
            </Card>

            {/* Totais */}
            <Card title="Totais">
              {reportType === 'weekly' && reportData?.weekly ? (
                <div className="space-y-4">
                  <div className="text-center p-4 bg-gradient-to-r from-[#FFC107] to-black rounded-lg">
                    <div className="text-white text-sm">SEMANA ATUAL</div>
                    <div className="text-white text-3xl font-bold mt-2">
                      R$ {reportData.weekly.totals.net.toFixed(2)}
                    </div>
                    <div className="text-white/80 text-sm mt-1">
                      Lucro Líquido
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded">
                      <div className="text-green-600 font-bold">
                        R$ {reportData.weekly.totals.gross.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">Bruto</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded">
                      <div className="text-red-600 font-bold">
                        R$ {reportData.weekly.totals.expenses.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">Gastos</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                      <div className="text-blue-600 font-bold">
                        R$ {reportData.weekly.totals.net.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">Líquido</div>
                    </div>
                  </div>

                  {reportData.weekly.entries.length > 0 && (
                    <>
                      <Divider />
                      <div>
                        <h4 className="font-bold mb-3">Melhor Dia da Semana</h4>
                        {(() => {
                          const bestDay = reportData.weekly.entries.reduce(
                            (prev, current) => prev.net > current.net ? prev : current,
                          );
                          return (
                            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded">
                              <div>
                                <div className="font-bold">{bestDay.day}</div>
                                <div className="text-sm text-gray-500">
                                  R$ {bestDay.net.toFixed(2)} líquidos
                                </div>
                              </div>
                              <i className="pi pi-trophy text-2xl text-yellow-500"></i>
                            </div>
                          );
                        })()}
                      </div>
                    </>
                  )}
                </div>
              ) : reportType === 'monthly' && reportData?.monthly ? (
                <div className="space-y-4">
                  <div className="text-center p-4 bg-gradient-to-r from-[#FFC107] to-black rounded-lg">
                    <div className="text-white text-sm">MÊS ATUAL</div>
                    <div className="text-white text-3xl font-bold mt-2">
                      R$ {reportData.monthly.totals.net.toFixed(2)}
                    </div>
                    <div className="text-white/80 text-sm mt-1">
                      Lucro Líquido
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-green-50 rounded">
                      <div className="text-green-600 font-bold">
                        R$ {reportData.monthly.totals.gross.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">Bruto Total</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded">
                      <div className="text-red-600 font-bold">
                        R$ {reportData.monthly.totals.expenses.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">Gastos Totais</div>
                    </div>
                  </div>

                  {reportData.monthly.byCategory.length > 0 && (
                    <>
                      <Divider />
                      <div>
                        <h4 className="font-bold mb-3">Distribuição de Gastos</h4>
                        {reportData.monthly.byCategory.map(
                          (cat, index) => (
                            <div key={index} className="mb-3">
                              <div className="flex justify-between text-sm mb-1">
                                <span>{cat.category}</span>
                                <span>
                                  R$ {cat.amount.toFixed(2)} ({cat.percentage.toFixed(1)}%)
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full"
                                  style={{ width: `${cat.percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Nenhum dado disponível para o período selecionado
                </div>
              )}
            </Card>
          </div>
        </TabPanel>

        <TabPanel header="Tabela Detalhada">
          <Card>
            {reportData?.entries && reportData.entries.length > 0 ? (
              reportType === 'weekly' && reportData.weekly ? (
                <DataTable
                  value={reportData.weekly.entries}
                  className="p-datatable-sm"
                  emptyMessage="Nenhum dado disponível"
                >
                  <Column field="day" header="Dia" sortable />
                  <Column
                    field="gross"
                    header="Bruto (R$)"
                    sortable
                    body={(rowData) => rowData.gross.toFixed(2)}
                  />
                  <Column
                    field="expenses"
                    header="Gastos (R$)"
                    sortable
                    body={(rowData) => rowData.expenses.toFixed(2)}
                  />
                  <Column
                    field="net"
                    header="Líquido (R$)"
                    sortable
                    body={(rowData) => (
                      <span className={rowData.net >= 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                        {rowData.net.toFixed(2)}
                      </span>
                    )}
                  />
                </DataTable>
              ) : reportType === 'monthly' && reportData.monthly ? (
                <DataTable
                  value={reportData.monthly.byWeek}
                  className="p-datatable-sm"
                  emptyMessage="Nenhum dado disponível"
                >
                  <Column field="week" header="Semana" sortable />
                  <Column
                    field="gross"
                    header="Bruto (R$)"
                    sortable
                    body={(rowData) => rowData.gross.toFixed(2)}
                  />
                  <Column
                    field="expenses"
                    header="Gastos (R$)"
                    sortable
                    body={(rowData) => rowData.expenses.toFixed(2)}
                  />
                  <Column
                    field="net"
                    header="Líquido (R$)"
                    sortable
                    body={(rowData) => (
                      <span className={rowData.net >= 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                        {rowData.net.toFixed(2)}
                      </span>
                    )}
                  />
                </DataTable>
              ) : (
                <DataTable
                  value={reportData.entries}
                  className="p-datatable-sm"
                  paginator
                  rows={10}
                  emptyMessage="Nenhum registro encontrado"
                >
                  <Column
                    field="date"
                    header="Data"
                    sortable
                    body={(rowData: IEntry) => new Date(rowData.date).toLocaleDateString('pt-BR')}
                  />
                  <Column field="description" header="Descrição" />
                  <Column field="category" header="Categoria" />
                  <Column
                    field="grossAmount"
                    header="Bruto (R$)"
                    sortable
                    body={(rowData: IEntry) => rowData.grossAmount.toFixed(2)}
                  />
                  <Column
                    field="expenses"
                    header="Gastos (R$)"
                    sortable
                    body={(rowData: IEntry) => rowData.expenses.toFixed(2)}
                  />
                  <Column
                    field="netAmount"
                    header="Líquido (R$)"
                    sortable
                    body={(rowData: IEntry) => (
                      <span className={rowData.netAmount >= 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                        {rowData.netAmount.toFixed(2)}
                      </span>
                    )}
                  />
                </DataTable>
              )
            ) : (
              <div className="text-center py-8 text-gray-500">
                Nenhum registro encontrado
              </div>
            )}
          </Card>
        </TabPanel>

        <TabPanel header="Comparativos">
          <Card>
            <div className="text-center py-8">
              <i className="pi pi-chart-line text-4xl text-gray-300 mb-3"></i>
              <p className="text-gray-500">
                Comparativo entre meses em desenvolvimento
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Em breve você poderá comparar seu desempenho mês a mês
              </p>
            </div>
          </Card>
        </TabPanel>
      </TabView>
    </div>
  );
}