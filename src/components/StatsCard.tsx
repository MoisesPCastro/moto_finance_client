'use client';

import { Card } from 'primereact/card';
import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  trend?: string;
}

export default function StatsCard({ title, value, icon, color, trend }: StatsCardProps) {
  const colors = {
    primary: 'bg-[#FFC107] text-black',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-white',
    danger: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white',
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold mt-2">{typeof value === 'number' ? `R$ ${value.toFixed(2)}` : value}</p>
          {trend && (
            <p className="text-xs mt-1 text-gray-500">{trend}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${colors[color]}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}