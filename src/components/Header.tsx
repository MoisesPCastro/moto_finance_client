'use client';

import { Menubar } from 'primereact/menubar';
import { Button } from 'primereact/button';
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
    // {
    //   label: 'Histórico',
    //   icon: 'pi pi-history',
    //   command: () => router.push('/history'),
    // },
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
    <div className="flex gap-2">
      <Button 
        label="Uber" 
        icon="pi pi-car" 
        className="btn-uber text-sm"
        severity="secondary"
      />
      <Button 
        label="99/Pop" 
        icon="pi pi-map-marker" 
        className="btn-99 text-sm"
      />
    </div>
  );

  return (
    <div className="sticky top-0 z-50 shadow-md bg-white dark:bg-gray-900">
      <Menubar 
        model={items} 
        start={start} 
        end={end}
        className="border-0 rounded-none"
      />
    </div>
  );
}