'use client';

import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { createContext, useContext, ReactNode } from 'react';

interface ToastContextType {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const toast = useRef<Toast>(null);

  const showSuccess = (message: string) => {
    toast.current?.show({
      severity: 'success',
      summary: 'Sucesso',
      detail: message,
      life: 3000,
    });
  };

  const showError = (message: string) => {
    toast.current?.show({
      severity: 'error',
      summary: 'Erro',
      detail: message,
      life: 5000,
    });
  };

  const showWarning = (message: string) => {
    toast.current?.show({
      severity: 'warn',
      summary: 'Atenção',
      detail: message,
      life: 4000,
    });
  };

  const showInfo = (message: string) => {
    toast.current?.show({
      severity: 'info',
      summary: 'Informação',
      detail: message,
      life: 3000,
    });
  };

  return (
    <>
      <Toast ref={toast} position="top-right" />
      <ToastContext.Provider
        value={{ showSuccess, showError, showWarning, showInfo }}
      >
        {children}
      </ToastContext.Provider>
    </>
  );
}
