'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Divider } from 'primereact/divider';
import { ProgressSpinner } from 'primereact/progressspinner';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ToastProvider';
import { DAYS_OF_WEEK_OPTIONS } from '../../../utils/daysOfWeek';
import { getDayOfWeekFromDate } from '../../../utils/dates';

export default function EditEntryPage() {
  const router = useRouter();
  const { id } = useParams();
  const toast = useToast();
  const { users } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleDateChange = (date: Date) => {
    setFormData(prev => ({
      ...prev,
      date,
      dayOfWeek: getDayOfWeekFromDate(date),
    }));
  };

  const [formData, setFormData] = useState({
    date: new Date(),
    dayOfWeek: '',
    grossAmount: 0,
    expenses: 0,
    description: '',
    userId: '',
  });

  // 🔹 BUSCAR REGISTRO
  useEffect(() => {
    if (!id) return;

    const fetchEntry = async () => {
      try {
        const { data } = await apiClient.getEntry(id as string);

        setFormData({
          date: new Date(data.date),
          dayOfWeek: data.dayOfWeek,
          grossAmount: data.grossAmount,
          expenses: data.expenses,
          description: data.description || '',
          userId: data.userId,
        });
      } catch (error: any) {
        toast.showError('Erro ao carregar registro');
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchEntry();
  }, [id]);

  // 🔹 SALVAR ALTERAÇÕES
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);
    try {
      await apiClient.updateEntry(id as string, {
        date: formData.date.toISOString(),
        dayOfWeek: formData.dayOfWeek,
        grossAmount: formData.grossAmount,
        expenses: formData.expenses,
        description: formData.description,
      });

      toast.showSuccess('Registro atualizado com sucesso!');
      setTimeout(() => router.push('/'), 800);
    } catch (error: any) {
      toast.showError(error.response?.data?.message || 'Erro ao atualizar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button
          label="Voltar"
          icon="pi pi-arrow-left"
          className="p-button-text"
          onClick={() => router.push('/')}
        />
        <h1 className="text-3xl font-bold mt-2">Editar Dia de Trabalho</h1>
        <p className="text-gray-600">Atualize as informações do registro</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {users.length > 1 && (
            <>
              <Dropdown
                value={formData.userId}
                options={users}
                optionLabel="name"
                optionValue="id"
                onChange={e => handleInputChange('userId', e.value)}
                className="w-full"
              />
              <Divider />
            </>
          )}

          {/* Data + Dia */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Calendar
              value={formData.date}
              onChange={e => handleDateChange(e.value as Date)}
              className="w-full"
              showIcon
            />

            <Dropdown
              value={formData.dayOfWeek}
              options={DAYS_OF_WEEK_OPTIONS}
              optionLabel="label"
              optionValue="value"
              onChange={e => handleInputChange('dayOfWeek', e.value)}
              className="w-full"
            />
          </div>

          {/* Valores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputNumber
              value={formData.grossAmount}
              onValueChange={e => handleInputChange('grossAmount', e.value || 0)}
              className="w-full"
            />

            <InputNumber
              value={formData.expenses}
              onValueChange={e => handleInputChange('expenses', e.value || 0)}
              className="w-full"
            />
          </div>

          <InputTextarea
            value={formData.description}
            onChange={e => handleInputChange('description', e.target.value)}
            rows={3}
            className="w-full"
          />

          <div className="flex gap-3">
            <Button
              type="submit"
              label={saving ? 'Salvando...' : 'Salvar Alterações'}
              icon="pi pi-save"
              className="btn-99 flex-1"
              disabled={saving}
            />
            <Button
              type="button"
              label="Cancelar"
              className="p-button-text flex-1"
              onClick={() => router.push('/')}
            />
          </div>
        </form>
      </Card>
    </div>
  );
}
