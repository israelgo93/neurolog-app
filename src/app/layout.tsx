// src/app/layout.tsx
// Layout principal CORREGIDO con Error Boundary para proteger el AuthProvider

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/providers/AuthProvider'
import ErrorBoundary from '@/components/layout/ErrorBoundary'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NeuroLog - Seguimiento NEE',
  description: 'Sistema de registro diario para niños con necesidades educativas especiales',
  keywords: ['neurolog', 'NEE', 'educación especial', 'seguimiento', 'registro diario'],
  authors: [{ name: 'NeuroLog Team' }]
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

// ✅ COMPONENTE DE FALLBACK ESPECÍFICO PARA EL LAYOUT
function LayoutErrorFallback() {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Error en la aplicación
            </h1>
            <p className="text-gray-600 mb-4">
              Ocurrió un problema al cargar NeuroLog
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Recargar página
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}

export default function RootLayout({
  children,
}: {
  readonly children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {/* ✅ ERROR BOUNDARY PRINCIPAL QUE ENVUELVE TODO */}
        <ErrorBoundary fallback={<LayoutErrorFallback />}>
          {/* ✅ AUTH PROVIDER PROTEGIDO POR ERROR BOUNDARY */}
          <ErrorBoundary 
            fallback={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Error de autenticación
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Problema al cargar la sesión de usuario
                  </p>
                  <button 
                    onClick={() => window.location.href = '/auth/login'}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Ir a Login
                  </button>
                </div>
              </div>
            }
          >
            <AuthProvider>
              {/* ✅ CONTENIDO PRINCIPAL TAMBIÉN PROTEGIDO */}
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
              
              {/* ✅ TOASTER PARA NOTIFICACIONES */}
              <Toaster />
            </AuthProvider>
          </ErrorBoundary>
        </ErrorBoundary>
      </body>
    </html>
  )
}