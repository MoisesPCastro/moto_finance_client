'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Divider } from 'primereact/divider';
import { ProgressSpinner } from 'primereact/progressspinner';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ToastProvider';

export default function AddEntryPage() {
  const router = useRouter();
  const toast = useToast();
  const { currentUser, users, setCurrentUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Estados do formulário
  const [formData, setFormData] = useState({
    date: new Date(),
    dayOfWeek: '',
    grossAmount: 0,
    expenses: 0,
    description: '',
    userId: currentUser?.id || '',
  });

  // Dias da semana
  const daysOfWeek = [
    { label: 'Segunda-feira', value: 'segunda' },
    { label: 'Terça-feira', value: 'terça' },
    { label: 'Quarta-feira', value: 'quarta' },
    { label: 'Quinta-feira', value: 'quinta' },
    { label: 'Sexta-feira', value: 'sexta' },
    { label: 'Sábado', value: 'sábado' },
    { label: 'Domingo', value: 'domingo' },
  ];

  const netAmount = formData.grossAmount - formData.expenses;

  const handleDateChange = (date: Date) => {
    const daysMap = [
      'domingo',
      'segunda',
      'terça',
      'quarta',
      'quinta',
      'sexta',
      'sábado'
    ];

    const dayIndex = date.getDay();
    const dayOfWeekPortuguese = daysMap[dayIndex];

    setFormData({
      ...formData,
      date,
      dayOfWeek: dayOfWeekPortuguese,
    });
  };

  // Adicione esta função (opcional, para exibir bonito):
  const formatDayForDisplay = (day: string) => {
    if (!day) return '';

    const displayMap: Record<string, string> = {
      'segunda': 'Segunda-feira',
      'terça': 'Terça-feira',
      'quarta': 'Quarta-feira',
      'quinta': 'Quinta-feira',
      'sexta': 'Sexta-feira',
      'sábado': 'Sábado',
      'domingo': 'Domingo'
    };

    return displayMap[day] || day.charAt(0).toUpperCase() + day.slice(1);
  };
  // Atualizar campo do formulário
  const handleInputChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  // Salvar registro
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.userId) {
      toast.showWarning('Selecione um usuário');
      return;
    }

    if (formData.grossAmount <= 0) {
      toast.showWarning('Informe o valor bruto');
      return;
    }

    setSaving(true);
    try {
      // Formatar dados para a API
      const entryData = {
        date: formData.date.toISOString(),
        dayOfWeek: formData.dayOfWeek,
        grossAmount: formData.grossAmount,
        expenses: formData.expenses,
        description: formData.description,
        userId: formData.userId,
      };

      const response = await apiClient.createEntry(entryData);

      toast.showSuccess('Registro salvo com sucesso!');

      // Redirecionar após 1 segundo
      setTimeout(() => {
        router.push('/');
      }, 1000);

    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast.showError(error.response?.data?.message || 'Erro ao salvar registro');
    } finally {
      setSaving(false);
    }
  };

  // Template de item de usuário no dropdown
  const userItemTemplate = (option: any) => {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FFC107] to-black flex items-center justify-center">
          <span className="text-white font-bold text-xs">
            {option.name.charAt(0)}
          </span>
        </div>
        <div>
          <div className="font-medium">{option.name}</div>
          <div className="text-xs text-gray-500">{option.email}</div>
        </div>
      </div>
    );
  };

  // Carregar dados iniciais
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({ ...prev, userId: currentUser.id }));
    }
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <ProgressSpinner />
      </div>
    );
  }

  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return '';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para converter string para número
  const parseCurrency = (value: string) => {
    // Remove tudo que não é número, ponto ou vírgula
    const cleanValue = value.replace(/[^\d,.-]/g, '').replace(',', '.');
    return parseFloat(cleanValue) || 0;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button
          label="Voltar para Dashboard"
          icon="pi pi-arrow-left"
          className="p-button-text"
          onClick={() => router.push('/')}
        />
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mt-2">
          Adicionar Dia de Trabalho
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Some TODOS os ganhos (Uber + 99/Pop juntos)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário */}
        <div className="lg:col-span-2">
          <Card>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Seletor de Usuário */}
              {users.length > 1 && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <i className="pi pi-user mr-2"></i>
                      Selecione o Motoboy
                    </label>
                    <Dropdown
                      value={formData.userId}
                      options={users}
                      onChange={(e) => {
                        const selectedUser = users.find(u => u.id === e.value);
                        if (selectedUser) {
                          setCurrentUser(selectedUser);
                          handleInputChange('userId', e.value);
                        }
                      }}
                      optionLabel="name"
                      optionValue="id"
                      itemTemplate={userItemTemplate}
                      placeholder="Selecione um usuário"
                      className="w-full"
                    />
                  </div>
                  <Divider />
                </>
              )}

              {/* Data e Dia da Semana */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <i className="pi pi-calendar mr-2"></i>
                    Data
                  </label>
                  <Calendar
                    value={formData.date}
                    onChange={(e) => handleDateChange(e.value as Date)}
                    dateFormat="dd/mm/yy"
                    className="w-full"
                    showIcon
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <i className="pi pi-sun mr-2"></i>
                    Dia da Semana
                  </label>

                  <Dropdown
                    value={formData.dayOfWeek}
                    options={daysOfWeek}
                    onChange={(e) => handleInputChange('dayOfWeek', e.value)}
                    optionLabel="label"
                    optionValue="value"
                    className="w-full"
                    placeholder="Selecione o dia da semana"
                  />
                </div>
              </div>

              {/* Valores Financeiros */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <i className="pi pi-money-bill mr-2 text-green-500"></i>
                    Ganho Bruto Total (R$)
                  </label>
                  <InputNumber
                    value={formData.grossAmount}
                    onValueChange={(e) => handleInputChange('grossAmount', e.value || 0)}
                    className="w-full"
                    min={0}
                    max={9999}
                    placeholder="0,00"
                    // Remove mode="currency" e usa inputMode
                    inputMode="decimal"
                    useGrouping={false} // Não agrupa milhares
                  />
                  <small className="text-gray-500">
                    Soma de TODOS os ganhos (Uber + 99 + Pop)
                  </small>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <i className="pi pi-wallet mr-2 text-orange-500"></i>
                    Gastos do Dia (R$)
                  </label>
                  <InputNumber
                    value={formData.expenses}
                    onValueChange={(e) => handleInputChange('expenses', e.value || 0)}
                    className="w-full"
                    min={0}
                    max={99999}
                    placeholder="0,00"
                    inputMode="decimal"
                    useGrouping={false}
                  />
                  <small className="text-gray-500">
                    Gasolina, alimentação, manutenção, etc.
                  </small>
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <i className="pi pi-comment mr-2"></i>
                  Observações (opcional)
                </label>
                <InputTextarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full"
                  placeholder="Ex: Boa demanda na 99 hoje, muita corrida curta no Uber, choveu à tarde..."
                />
              </div>

              {/* Botões */}
              <div className="flex flex-wrap gap-3 pt-4">
                <Button
                  type="submit"
                  label={saving ? 'Salvando...' : 'Salvar Registro'}
                  icon={saving ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
                  className="btn-99 flex-1"
                  disabled={saving || !formData.userId}
                />
                <Button
                  type="button"
                  label="Limpar"
                  icon="pi pi-trash"
                  className="p-button-outlined flex-1"
                  onClick={() => setFormData({
                    date: new Date(),
                    dayOfWeek: '',
                    grossAmount: 0,
                    expenses: 0,
                    description: '',
                    userId: formData.userId,
                  })}
                />
                <Button
                  type="button"
                  label="Cancelar"
                  icon="pi pi-times"
                  className="p-button-text flex-1"
                  onClick={() => router.push('/')}
                />
              </div>
            </form>
          </Card>
        </div>

        {/* Preview e Resumo */}
        <div className="lg:col-span-1">
          <Card title="Resumo do Dia" className="sticky top-6">
            <div className="space-y-4">
              {/* Data e Dia */}
              <div className="text-center p-4 bg-gradient-to-r from-[#FFC107] to-black rounded-lg">
                <div className="text-white text-sm">DATA SELECIONADA</div>
                <div className="text-white text-2xl font-bold mt-1">
                  {formData.date.toLocaleDateString('pt-BR')}
                </div>
                <div className="text-white/80 text-sm mt-1">
                  {formData.dayOfWeek ? formData.dayOfWeek.charAt(0).toUpperCase() + formData.dayOfWeek.slice(1) : '-'}
                </div>
              </div>

              {/* Valores */}
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded">
                  <div className="flex items-center gap-2">
                    <i className="pi pi-arrow-up-right text-green-500"></i>
                    <span className="font-medium">Ganho Bruto</span>
                  </div>
                  <span className="font-bold text-green-600">
                    R$ {formData.grossAmount.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded">
                  <div className="flex items-center gap-2">
                    <i className="pi pi-arrow-down-right text-red-500"></i>
                    <span className="font-medium">Gastos</span>
                  </div>
                  <span className="font-bold text-red-600">
                    R$ {formData.expenses.toFixed(2)}
                  </span>
                </div>

                <div className={`flex justify-between items-center p-3 rounded ${netAmount >= 0
                  ? 'bg-blue-50 dark:bg-blue-900/20'
                  : 'bg-gray-50 dark:bg-gray-800'
                  }`}>
                  <div className="flex items-center gap-2">
                    <i className={`pi pi-dollar ${netAmount >= 0 ? 'text-blue-500' : 'text-gray-500'
                      }`}></i>
                    <span className="font-medium">Lucro Líquido</span>
                  </div>
                  <span className={`font-bold text-lg ${netAmount >= 0 ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                    R$ {netAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Dicas rápidas */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                  <i className="pi pi-lightbulb text-[#FFC107]"></i>
                  Dicas
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li className="flex items-start gap-2">
                    <i className="pi pi-check-circle text-green-500 mt-0.5"></i>
                    <span>Some TODOS os ganhos (Uber + 99/Pop juntos)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="pi pi-check-circle text-green-500 mt-0.5"></i>
                    <span>Anote todos os gastos, mesmo pequenos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="pi pi-check-circle text-green-500 mt-0.5"></i>
                    <span>Use observações para lembrar do dia</span>
                  </li>
                </ul>
              </div>

              {/* Botão rápido para adicionar outro */}
              <Button
                label="Adicionar Ontem"
                icon="pi pi-history"
                className="w-full p-button-outlined"
                onClick={() => {
                  const yesterday = new Date();
                  yesterday.setDate(yesterday.getDate() - 1);
                  handleDateChange(yesterday);
                }}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}