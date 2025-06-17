// ================================================================
// src/components/providers/ToastProvider.tsx
// Provider para notificaciones toast
// ================================================================

'use client';

import { Toaster } from '@/components/ui/toaster';

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: Readonly<ToastProviderProps>) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}