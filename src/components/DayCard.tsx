'use client';

import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';

interface DayCardProps {
  day: string;
  date: string;
  grossAmount: number;
  expenses: number;
  netAmount: number;
  description?: string;
  clickable?: boolean;
  onClick?: () => void;
}

export default function DayCard({
  day,
  date,
  grossAmount,
  expenses,
  netAmount,
  description,
  clickable = false,
  onClick,
}: DayCardProps) {
  const getDayColor = (day: string) => {
    const colors: Record<string, string> = {
      segunda: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      terça: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      quarta: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      quinta: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      sexta: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      sábado: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      domingo: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    };
    return (
      colors[day.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const cardClasses = `
    relative
    ${
      clickable
        ? 'cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-700 hover:-translate-y-1'
        : ''
    }
    border border-gray-200 dark:border-gray-700
  `;

  const handleCardClick = (e: React.MouseEvent) => {
    if (clickable && onClick) {
      e.stopPropagation();
      onClick();
    }
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (clickable && onClick) {
      onClick();
    }
  };

  return (
    <Card className={cardClasses} onClick={handleCardClick}>
      <div className="flex justify-between items-start">
        <div className="w-full">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Tag value={day} className={`font-bold ${getDayColor(day)}`} />
              <span className="text-sm text-gray-500 dark:text-gray-400">{date}</span>
            </div>

            {clickable && (
              <Button
                icon="pi pi-eye"
                className="p-button-text p-button-sm text-blue-500 hover:text-blue-600"
                onClick={handleButtonClick}
                aria-label="Ver detalhes"
              />
            )}
          </div>

          {description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
              {description}
            </p>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Bruto</p>
              <p className="font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(grossAmount)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Gastos</p>
              <p className="font-bold text-red-600 dark:text-red-400">{formatCurrency(expenses)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Líquido</p>
              <p
                className={`font-bold ${
                  netAmount >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {formatCurrency(netAmount)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
