'use client';

import { Chip } from 'primereact/chip';

export default function AppsBadge() {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <Chip label="Uber" icon="pi pi-car" className="bg-black text-white border-0" />
      <span className="text-gray-400">+</span>
      <Chip label="99/Pop" icon="pi pi-map-marker" className="bg-[#FFC107] text-black border-0" />
      <span className="text-sm text-gray-500">= Total</span>
    </div>
  );
}
