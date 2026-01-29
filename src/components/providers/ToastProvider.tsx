// ================================================================
// src/components/providers/ToastProvider.tsx
// Provider para notificaciones toast
// ================================================================

'use client';

import { Toaster } from '@/components/ui/toaster';

interface ToastProviderProps {
  readonly children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}