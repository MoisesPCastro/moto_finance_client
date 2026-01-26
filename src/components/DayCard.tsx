'use client';

import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';

interface DayCardProps {
  day: string;
  date: string;
  grossAmount: number;
  expenses: number;
  netAmount: number;
  description?: string;
}

export default function DayCard({ 
  day, 
  date, 
  grossAmount, 
  expenses, 
  netAmount, 
  description 
}: DayCardProps) {
  
  const getDayColor = (day: string) => {
    switch(day.toLowerCase()) {
      case 'segunda': return 'bg-blue-100 text-blue-800';
      case 'terça': return 'bg-green-100 text-green-800';
      case 'quarta': return 'bg-purple-100 text-purple-800';
      case 'quinta': return 'bg-orange-100 text-orange-800';
      case 'sexta': return 'bg-red-100 text-red-800';
      case 'sábado': return 'bg-yellow-100 text-yellow-800';
      case 'domingo': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Tag value={day} className={`font-bold ${getDayColor(day)}`} />
            <span className="text-sm text-gray-500">{date}</span>
          </div>
          
          {description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{description}</p>
          )}

          <div className="grid grid-cols-3 gap-4 mt-4">
            <div>
              <p className="text-xs text-gray-500">Bruto</p>
              <p className="font-bold text-green-600">R$ {grossAmount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Gastos</p>
              <p className="font-bold text-red-600">R$ {expenses.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Líquido</p>
              <p className={`font-bold ${netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {netAmount.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <i className="pi pi-ellipsis-v text-gray-400 cursor-pointer"></i>
        </div>
      </div>
    </Card>
  );
}