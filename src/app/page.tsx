'use client';

import { useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import StatsCard from '@/components/StatsCard';
import DayCard from '@/components/DayCard';

const mockEntries = [
  {
    id: '1',
    date: '2024-01-15',
    dayOfWeek: 'Segunda',
    grossAmount: 220.50,
    expenses: 65.25,
    netAmount: 155.25,
    description: 'Trabalho normal - Zona Sul',
    userId: '1',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    date: '2024-01-16',
    dayOfWeek: 'Terça',
    grossAmount: 195.75,
    expenses: 55.80,
    netAmount: 139.95,
    description: 'Choveu bastante',
    userId: '1',
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z',
  },
];

export default function Dashboard() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [viewType, setViewType] = useState('week');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalGross: 0,
    totalExpenses: 0,
    totalNet: 0,
    avgDaily: 0,
  });

  useEffect(() => {
    // Simular carregamento de dados
    setTimeout(() => {
      setStats({
        totalGross: 416.25,
        totalExpenses: 121.05,
        totalNet: 295.20,
        avgDaily: 147.60,
      });
      setLoading(false);
    }, 1000);
  }, []);

  const viewOptions = [
    { label: 'Esta Semana', value: 'week' },
    { label: 'Este Mês', value: 'month' },
    { label: 'Personalizado', value: 'custom' },
  ];

  const monthNavigatorTemplate = (e: any) => {
    return (
      <Dropdown
        value={e.value}
        options={e.options}
        onChange={(event) => e.onChange(event.originalEvent, event.value)}
        style={{ lineHeight: 1 }}
      />
    );
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Dashboard Financeiro
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Controle seus ganhos do dia
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Dropdown 
            value={viewType} 
            options={viewOptions} 
            onChange={(e) => setViewType(e.value)}
            className="w-full md:w-40"
          />
          <Calendar 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.value as Date)}
            view="month" 
            dateFormat="mm/yy"
            monthNavigator
            yearNavigator
            monthNavigatorTemplate={monthNavigatorTemplate}
            className="w-full md:w-40"
          />
          <Button 
            label="Adicionar Dia" 
            icon="pi pi-plus" 
            className="btn-99"
            onClick={() => window.location.href = '/add-entry'}
          />
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Bruto"
          value={stats.totalGross}
          icon={<i className="pi pi-money-bill text-xl"></i>}
          color="primary"
          trend="+12% em relação à semana passada"
        />
        
        <StatsCard
          title="Total Gastos"
          value={stats.totalExpenses}
          icon={<i className="pi pi-wallet text-xl"></i>}
          color="warning"
          trend="Gasolina: R$ 80,00"
        />
        
        <StatsCard
          title="Lucro Líquido"
          value={stats.totalNet}
          icon={<i className="pi pi-chart-line text-xl"></i>}
          color="success"
          trend="Média diária: R$ 147,60"
        />
        
        <StatsCard
          title="Meta Mensal"
          value="2.500,00"
          icon={<i className="pi pi-flag text-xl"></i>}
          color="info"
          trend="60% concluído"
        />
      </div>

      {/* Progresso da Meta */}
      <Card title="Progresso da Meta Mensal">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Meta: R$ 2.500,00</span>
            <span className="font-bold">R$ 1.500,00 (60%)</span>
          </div>
          <ProgressBar value={60} className="h-3" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Faltam: R$ 1.000,00</span>
            <span>Dias restantes: 15</span>
          </div>
        </div>
      </Card>

      {/* Últimos Dias de Trabalho */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Últimos Dias de Trabalho" className="lg:col-span-2">
          <div className="space-y-4">
            {mockEntries.map((entry) => (
              <DayCard
                key={entry.id}
                day={entry.dayOfWeek}
                date={new Date(entry.date).toLocaleDateString('pt-BR')}
                grossAmount={entry.grossAmount}
                expenses={entry.expenses}
                netAmount={entry.netAmount}
                description={entry.description}
              />
            ))}
            
            {mockEntries.length === 0 && (
              <div className="text-center py-8">
                <i className="pi pi-inbox text-4xl text-gray-300 mb-3"></i>
                <p className="text-gray-500">Nenhum registro encontrado</p>
                <Button 
                  label="Adicionar primeiro registro" 
                  icon="pi pi-plus" 
                  className="btn-99 mt-4"
                  onClick={() => window.location.href = '/add-entry'}
                />
              </div>
            )}
          </div>
        </Card>

        {/* Resumo por App */}
       <Card title="Apps Utilizados">
  <div className="space-y-3">
    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-black to-[#1F1F1F] rounded-lg">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
          <i className="pi pi-car text-white"></i>
        </div>
        <div>
          <div className="font-bold">Uber</div>
          <div className="text-sm text-gray-300">Principal</div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-bold text-lg">70%</div>
        <div className="text-sm text-gray-300">do total</div>
      </div>
    </div>
    
    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#FFC107] to-[#FF9800] rounded-lg">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#FFC107] flex items-center justify-center">
          <i className="pi pi-map-marker text-black"></i>
        </div>
        <div>
          <div className="font-bold">99/Pop</div>
          <div className="text-sm text-gray-700">Complementar</div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-bold text-lg">30%</div>
        <div className="text-sm text-gray-700">do total</div>
      </div>
    </div>
  </div>
</Card>

        {/* Gastos por Categoria */}
        <Card title="Gastos por Categoria">
          <div className="space-y-3">
            {[
              { category: 'Gasolina', amount: 120, color: 'bg-red-500' },
              { category: 'Alimentação', amount: 80, color: 'bg-orange-500' },
              { category: 'Manutenção', amount: 45, color: 'bg-blue-500' },
              { category: 'Outros', amount: 25, color: 'bg-gray-500' },
            ].map((item, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-3 h-3 rounded-full ${item.color} mr-3`}></div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm">
                    <span>{item.category}</span>
                    <span>R$ {item.amount},00</span>
                  </div>
                  <ProgressBar 
                    value={(item.amount / 270) * 100} 
                    className="h-1 mt-1" 
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}