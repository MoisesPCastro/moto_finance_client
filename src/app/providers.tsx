'use client';

import { PrimeReactProvider } from 'primereact/api';
import { ReactNode } from 'react';
import { ToastProvider } from '@/components/ToastProvider';
import { AuthProvider } from '@/contexts/AuthContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <PrimeReactProvider>
      <ToastProvider>
        <AuthProvider>{children}</AuthProvider>
      </ToastProvider>
    </PrimeReactProvider>
  );
}
