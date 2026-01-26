'use client';

import { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { TabView, TabPanel } from 'primereact/tabview';
import { ProgressSpinner } from 'primereact/progressspinner';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Chart } from 'primereact/chart';
import { Divider } from 'primereact/divider';
import { apiClient } from '@/lib/api';

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [reportType, setReportType] = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [userId, setUserId] = useState<string>('');
  const [reportData, setReportData] = useState<any>(null);

  // Dados mockados para exemplo
  const mockReportData = {
    weekly: {
      entries: [
        { day: 'Segunda', gross: 220.50, expenses: 65.25, net: 155.25 },
        { day: 'Terça', gross: 195.75, expenses: 55.80, net: 139.95 },
        { day: 'Quarta', gross: 240.00, expenses: 70.50, net: 169.50 },
        { day: 'Quinta', gross: 210.25, expenses: 60.75, net: 149.50 },
        { day: 'Sexta', gross: 280.00, expenses: 85.25, net: 194.75 },
      ],
      totals: { gross: 1146.50, expenses: 337.55, net: 808.95 },
    },
    monthly: {
      byWeek: [
        { week: 'Semana 1', gross: 1146.50, expenses: 337.55, net: 808.95 },
        { week: 'Semana 2', gross: 1250.75, expenses: 320.25, net: 930.50 },
        { week: 'Semana 3', gross: 1320.00, expenses: 350.75, net: 969.25 },
        { week: 'Semana 4', gross: 1105.25, expenses: 295.50, net: 809.75 },
      ],
      totals: { gross: 4822.50, expenses: 1304.05, net: 3518.45 },
      byCategory: [
        { category: 'Gasolina', amount: 520, percentage: 40 },
        { category: 'Alimentação', amount: 390, percentage: 30 },
        { category: 'Manutenção', amount: 195, percentage: 15 },
        { category: 'Outros', amount: 195, percentage: 15 },
      ],
    },
  };

  // Configurações dos gráficos
  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});

  useEffect(() => {
    // Simular carregamento
    setTimeout(() => {
      setReportData(mockReportData);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    // Atualizar gráfico quando dados mudarem
    if (reportData) {
      updateCharts();
    }
  }, [reportData, reportType]);

  const updateCharts = () => {
    if (reportType === 'weekly') {
      // Gráfico de barras para semana
      const documentStyle = getComputedStyle(document.documentElement);
      const data = {
        labels: reportData.weekly.entries.map((e: any) => e.day),
        datasets: [
          {
            label: 'Ganho Bruto',
            backgroundColor: documentStyle.getPropertyValue('--green-500'),
            borderColor: documentStyle.getPropertyValue('--green-500'),
            data: reportData.weekly.entries.map((e: any) => e.gross),
          },
          {
            label: 'Gastos',
            backgroundColor: documentStyle.getPropertyValue('--red-500'),
            borderColor: documentStyle.getPropertyValue('--red-500'),
            data: reportData.weekly.entries.map((e: any) => e.expenses),
          },
          {
            label: 'Lucro Líquido',
            backgroundColor: documentStyle.getPropertyValue('--blue-500'),
            borderColor: documentStyle.getPropertyValue('--blue-500'),
            data: reportData.weekly.entries.map((e: any) => e.net),
          },
        ],
      };
      const options = {
        responsive: true,
        maintainAspectRatio: false,
      };

      setChartData(data);
      setChartOptions(options);
    } else {
      // Gráfico de pizza para categorias mensais
      const documentStyle = getComputedStyle(document.documentElement);
      const data = {
        labels: reportData.monthly.byCategory.map((c: any) => c.category),
        datasets: [
          {
            data: reportData.monthly.byCategory.map((c: any) => c.amount),
            backgroundColor: [
              documentStyle.getPropertyValue('--red-500'),
              documentStyle.getPropertyValue('--orange-500'),
              documentStyle.getPropertyValue('--blue-500'),
              documentStyle.getPropertyValue('--gray-500'),
            ],
            hoverBackgroundColor: [
              documentStyle.getPropertyValue('--red-400'),
              documentStyle.getPropertyValue('--orange-400'),
              documentStyle.getPropertyValue('--blue-400'),
              documentStyle.getPropertyValue('--gray-400'),
            ],
          },
        ],
      };
      const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
          },
        },
      };

      setChartData(data);
      setChartOptions(options);
    }
  };

  const reportTypes = [
    { label: 'Relatório Semanal', value: 'weekly' },
    { label: 'Relatório Mensal', value: 'monthly' },
    { label: 'Comparativo', value: 'comparative' },
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
    // Implementar exportação para CSV
    alert('Exportação para CSV em desenvolvimento!');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
          />
          <Button 
            label="Imprimir" 
            icon="pi pi-print" 
            className="p-button-outlined"
          />
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Tipo de Relatório</label>
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
              value={selectedMonth.getMonth()}
              options={months}
              onChange={(e) => {
                const newDate = new Date(selectedMonth);
                newDate.setMonth(e.value);
                setSelectedMonth(newDate);
              }}
              className="w-full"
            />
          </div>
          
          <div className="flex items-end">
            <Button 
              label="Gerar Relatório" 
              icon="pi pi-refresh" 
              className="btn-99 w-full"
            />
          </div>
        </div>
      </Card>

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
              {reportType === 'weekly' ? (
                <div className="space-y-4">
                  <div className="text-center p-4 bg-gradient-to-r from-[#FFC107] to-black rounded-lg">
                    <div className="text-white text-sm">SEMANA ATUAL</div>
                    <div className="text-white text-3xl font-bold mt-2">
                      R$ {reportData.weekly.totals.net.toFixed(2)}
                    </div>
                    <div className="text-white/80 text-sm mt-1">Lucro Líquido</div>
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

                  <Divider />

                  <div>
                    <h4 className="font-bold mb-3">Melhor Dia da Semana</h4>
                    {(() => {
                      const bestDay = reportData.weekly.entries.reduce((prev: any, current: any) => 
                        prev.net > current.net ? prev : current
                      );
                      return (
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded">
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
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center p-4 bg-gradient-to-r from-[#FFC107] to-black rounded-lg">
                    <div className="text-white text-sm">MÊS ATUAL</div>
                    <div className="text-white text-3xl font-bold mt-2">
                      R$ {reportData.monthly.totals.net.toFixed(2)}
                    </div>
                    <div className="text-white/80 text-sm mt-1">Lucro Líquido</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded">
                      <div className="text-green-600 font-bold">
                        R$ {reportData.monthly.totals.gross.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">Bruto Total</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded">
                      <div className="text-red-600 font-bold">
                        R$ {reportData.monthly.totals.expenses.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">Gastos Totais</div>
                    </div>
                  </div>

                  <Divider />

                  <div>
                    <h4 className="font-bold mb-3">Distribuição de Gastos</h4>
                    {reportData.monthly.byCategory.map((cat: any, index: number) => (
                      <div key={index} className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>{cat.category}</span>
                          <span>R$ {cat.amount.toFixed(2)} ({cat.percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${cat.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </TabPanel>

        <TabPanel header="Tabela Detalhada">
          <Card>
            {reportType === 'weekly' ? (
              <DataTable value={reportData.weekly.entries} className="p-datatable-sm">
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
                <Column 
                  header="Margem" 
                  body={(rowData) => {
                    const margin = ((rowData.net / rowData.gross) * 100).toFixed(1);
                    return `${margin}%`;
                  }}
                />
              </DataTable>
            ) : (
              <DataTable value={reportData.monthly.byWeek} className="p-datatable-sm">
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
                <Column 
                  header="Evolução" 
                  body={(rowData, options) => {
                    const prevWeek = reportData.monthly.byWeek[options.rowIndex - 1];
                    if (!prevWeek) return '-';
                    const change = ((rowData.net - prevWeek.net) / prevWeek.net * 100).toFixed(1);
                    return (
                      <span className={parseFloat(change) >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {parseFloat(change) >= 0 ? '+' : ''}{change}%
                      </span>
                    );
                  }}
                />
              </DataTable>
            )}
          </Card>
        </TabPanel>

        <TabPanel header="Comparativos">
          <Card>
            <div className="text-center py-8">
              <i className="pi pi-chart-line text-4xl text-gray-300 mb-3"></i>
              <p className="text-gray-500">Comparativo entre meses em desenvolvimento</p>
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