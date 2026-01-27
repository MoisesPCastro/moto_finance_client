'use client';

import { useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { ProgressSpinner } from 'primereact/progressspinner';
import StatsCard from '@/components/StatsCard';
import DayCard from '@/components/DayCard';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ToastProvider';
import AppsBadge from '@/components/AppsBadge';

export default function Dashboard() {
  const { currentUser, users, setCurrentUser } = useAuth();
  const toast = useToast();

  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [viewType, setViewType] = useState('week');
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalGross: 0,
    totalExpenses: 0,
    totalNet: 0,
    avgDaily: 0,
  });
  const [userStats, setUserStats] = useState<any>(null);

  // Carregar dados
  useEffect(() => {
    const loadData = async () => {
      try {
        // Se não tem usuário mas tem usuários disponíveis, selecione o primeiro
        if (!currentUser && users.length > 0) {
          setCurrentUser(users[0]);
          return;
        }

        // Se tem usuário, carrega dados
        if (currentUser) {
          await loadDashboardData();
        } else {
          // Se não tem usuários, mostra mensagem
          setLoading(false);
        }
      } catch (error) {
        console.error('Erro ao inicializar:', error);
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser, users]);

  const loadDashboardData = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Tenta carregar estatísticas do usuário
      try {
        const statsResponse = await apiClient.getUserStats(currentUser.id);
        setUserStats(statsResponse.data);
      } catch (statsError) {
        console.log('Não foi possível carregar stats:', statsError);
        // Continua mesmo sem stats
      }

      // Carregar últimos registros
      try {
        const recentResponse = await apiClient.getRecentEntries(
          currentUser.id,
          5,
        );
        setEntries(recentResponse.data || []);

        // Calcular totais
        if (recentResponse.data && recentResponse.data.length > 0) {
          const totals = recentResponse.data.reduce(
            (acc, entry) => {
              acc.totalGross += entry.grossAmount;
              acc.totalExpenses += entry.expenses;
              acc.totalNet += entry.netAmount;
              return acc;
            },
            { totalGross: 0, totalExpenses: 0, totalNet: 0 },
          );

          setStats({
            ...totals,
            avgDaily: totals.totalNet / recentResponse.data.length,
          });
        }
      } catch (entriesError) {
        console.log('Não foi possível carregar registros:', entriesError);
        setEntries([]);
      }
    } catch (error: any) {
      console.error('Erro ao carregar dashboard:', error);
      toast.showError('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const viewOptions = [
    { label: 'Esta Semana', value: 'week' },
    { label: 'Este Mês', value: 'month' },
    { label: 'Personalizado', value: 'custom' },
  ];

  // Calcular progresso da meta (exemplo: meta de R$ 2500/mês)
  const monthlyGoal = 4000;
  const currentProgress = userStats?.totals?.netAmount || 0;
  const goalPercentage = Math.min((currentProgress / monthlyGoal) * 100, 100);
  const daysRemaining =
    new Date(
      selectedMonth.getFullYear(),
      selectedMonth.getMonth() + 1,
      0,
    ).getDate() - selectedMonth.getDate();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <ProgressSpinner />
          <p className="mt-4 text-gray-500">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  // Se não tem usuários cadastrados
  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <i className="pi pi-user-plus text-5xl text-gray-300 mb-4"></i>
        <h2 className="text-xl font-bold text-gray-700 mb-2">
          Bem-vindo ao Moto Finance!
        </h2>
        <p className="text-gray-500 mb-6">
          Crie seu primeiro usuário para começar
        </p>
        <Button
          label="Criar Primeiro Usuário"
          icon="pi pi-user-plus"
          className="btn-99"
          onClick={async () => {
            try {
              // Criar usuário padrão
              const userData = {
                email: 'motoboy@exemplo.com',
                name: 'Motoboy Principal',
                password: 'senha123',
              };

              const response = await apiClient.createUser(userData);
              setCurrentUser(response.data);
              toast.showSuccess('Usuário criado com sucesso!');
            } catch (error) {
              toast.showError('Erro ao criar usuário');
            }
          }}
        />
        <p className="text-sm text-gray-400 mt-4">
          Ou se preferir, crie manualmente nas Configurações
        </p>
      </div>
    );
  }

  // Se tem usuários mas nenhum está selecionado
  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <i className="pi pi-user text-5xl text-gray-300 mb-4"></i>
        <h2 className="text-xl font-bold text-gray-700 mb-2">
          Selecione um usuário
        </h2>
        <p className="text-gray-500 mb-6">
          Escolha um motoboy para ver o dashboard
        </p>
        <Dropdown
          value={null}
          options={users}
          onChange={(e) => {
            const selected = users.find((u) => u.id === e.value);
            if (selected) {
              setCurrentUser(selected);
            }
          }}
          optionLabel="name"
          optionValue="id"
          placeholder="Selecione um usuário"
          className="w-64 mx-auto mb-4"
        />
        <Button
          label="Usar Primeiro Usuário"
          icon="pi pi-check"
          className="btn-99"
          onClick={() => {
            if (users.length > 0) {
              setCurrentUser(users[0]);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <AppsBadge />
            <span className="text-sm text-gray-500">
              • Todos os apps somados
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Dashboard - {currentUser.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Ganhos totais (Uber + 99/Pop) - Simples e direto
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
            className="w-full md:w-40"
          />
          <Button
            label="Adicionar Dia"
            icon="pi pi-plus"
            className="btn-99"
            onClick={() => (window.location.href = '/add-entry')}
          />
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Bruto"
          value={userStats?.totals?.grossAmount || 0}
          icon={<i className="pi pi-money-bill text-xl"></i>}
          color="primary"
          trend={`${entries.length} dias registrados`}
        />

        <StatsCard
          title="Total Gastos"
          value={userStats?.totals?.expenses || 0}
          icon={<i className="pi pi-wallet text-xl"></i>}
          color="warning"
          trend={`Média: R$ ${(userStats?.averages?.expenses || 0).toFixed(2)}/dia`}
        />

        <StatsCard
          title="Lucro Líquido"
          value={userStats?.totals?.netAmount || 0}
          icon={<i className="pi pi-chart-line text-xl"></i>}
          color="success"
          trend={`Média: R$ ${(userStats?.averages?.netAmount || 0).toFixed(2)}/dia`}
        />

        <StatsCard
          title="Meta Mensal"
          value={monthlyGoal.toFixed(2)}
          icon={<i className="pi pi-flag text-xl"></i>}
          color="info"
          trend={`${goalPercentage.toFixed(1)}% concluído`}
        />
      </div>

      {/* Progresso da Meta */}
      <Card
        title={`Progresso da Meta Mensal - ${selectedMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`}
      >
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              Meta: R$ {monthlyGoal.toFixed(2)}
            </span>
            <span className="font-bold">
              R$ {currentProgress.toFixed(2)} ({goalPercentage.toFixed(1)}%)
            </span>
          </div>
          <ProgressBar value={goalPercentage} className="h-3" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>
              Faltam: R$ {Math.max(0, monthlyGoal - currentProgress).toFixed(2)}
            </span>
            <span>Dias restantes: {daysRemaining}</span>
          </div>
        </div>
      </Card>

      {/* Últimos Dias de Trabalho */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Últimos Dias de Trabalho" className="lg:col-span-2">
          <div className="space-y-4">
            {entries.length > 0 ? (
              entries.map((entry) => (
                <DayCard
                  key={entry.id}
                  day={entry.dayOfWeek}
                  date={new Date(entry.date).toLocaleDateString('pt-BR')}
                  grossAmount={entry.grossAmount}
                  expenses={entry.expenses}
                  netAmount={entry.netAmount}
                  description={entry.description}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <i className="pi pi-inbox text-4xl text-gray-300 mb-3"></i>
                <p className="text-gray-500">Nenhum registro encontrado</p>
                <p className="text-sm text-gray-400 mb-4">
                  Adicione seu primeiro dia de trabalho
                </p>
                <Button
                  label="Adicionar primeiro registro"
                  icon="pi pi-plus"
                  className="btn-99"
                  onClick={() => (window.location.href = '/add-entry')}
                />
              </div>
            )}
          </div>
        </Card>

        {/* Destaques */}
        <Card title="Destaques">
          <div className="space-y-4">
            {userStats?.bestDay ? (
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <i className="pi pi-trophy text-green-500"></i>
                    <span className="font-bold">Melhor Dia</span>
                  </div>
                  <span className="text-green-600 font-bold">
                    +R$ {userStats.bestDay.netAmount.toFixed(2)}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(userStats.bestDay.date).toLocaleDateString('pt-BR')}{' '}
                  • {userStats.bestDay.dayOfWeek}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-center text-gray-500">
                  <i className="pi pi-chart-line text-xl mb-2"></i>
                  <p>Adicione registros para ver seus destaques</p>
                </div>
              </div>
            )}

            {/* Estatística de média */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <i className="pi pi-chart-bar text-blue-500"></i>
                  <span className="font-bold">Média Diária</span>
                </div>
                <span className="text-blue-600 font-bold">
                  R$ {(userStats?.averages?.netAmount || 0).toFixed(2)}
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Baseado em {userStats?.totals?.entries || 0} dias trabalhados
              </div>
            </div>
          </div>
        </Card>

        {/* Dicas Rápidas */}
        <Card title="Dicas">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <i className="pi pi-plus-circle text-[#FFC107] mt-0.5"></i>
              <div>
                <div className="font-medium">Registre todo dia</div>
                <div className="text-sm text-gray-500">
                  Mesmo que o valor seja baixo, mantenha o hábito
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <i className="pi pi-wallet text-green-500 mt-0.5"></i>
              <div>
                <div className="font-medium">Anote todos os gastos</div>
                <div className="text-sm text-gray-500">
                  Gasolina, alimentação, manutenção - tudo conta
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <i className="pi pi-chart-line text-blue-500 mt-0.5"></i>
              <div>
                <div className="font-medium">Acompanhe sua meta</div>
                <div className="text-sm text-gray-500">
                  Defina uma meta mensal e acompanhe o progresso
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
