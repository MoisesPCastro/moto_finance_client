'use client';

import { Menubar } from 'primereact/menubar';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();

  const items = [
    {
      label: 'Dashboard',
      icon: 'pi pi-home',
      command: () => router.push('/'),
    },
    {
      label: 'Adicionar Dia',
      icon: 'pi pi-plus-circle',
      command: () => router.push('/add-entry'),
    },
    {
      label: 'Relatórios',
      icon: 'pi pi-chart-bar',
      command: () => router.push('/reports'),
    },
    {
      label: 'Histórico',
      icon: 'pi pi-history',
      command: () => router.push('/history-data'),
    },
  ];

  const start = (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FFC107] to-black flex items-center justify-center">
        <i className="pi pi-bolt text-white text-sm"></i>
      </div>
      <span className="font-bold text-xl bg-gradient-to-r from-[#FFC107] to-black bg-clip-text text-transparent">
        Moto Finance
      </span>
    </div>
  );

  const end = (
    <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <i className="pi pi-calendar text-gray-600 dark:text-gray-300"></i>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {new Date().toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'short',
        })}
      </span>
    </div>
  );

  return (
    <div className="sticky top-0 z-50 shadow-md bg-white dark:bg-gray-900">
      <Menubar model={items} start={start} end={end} className="border-0 rounded-none" />
    </div>
  );
}
