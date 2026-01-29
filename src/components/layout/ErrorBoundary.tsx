// src/components/layout/ErrorBoundary.tsx
// Error Boundary para prevenir crashes que afectan el estado del usuario

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  readonly children: ReactNode;
  readonly fallback?: ReactNode;
  readonly showError?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Actualizar el estado para mostrar la UI de error
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // ✅ LOGGING MEJORADO PARA DEBUG
    console.error('🚨 ErrorBoundary caught an error:', error);
    console.error('📝 Error details:', errorInfo);
    
    // ✅ ACTUALIZAR ESTADO CON INFORMACIÓN DETALLADA
    this.setState({
      error,
      errorInfo
    });

    // ✅ OPCIONAL: Enviar error a servicio de monitoreo
    // this.logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleGoHome = () => {
    globalThis.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      // ✅ FALLBACK UI PERSONALIZABLE
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // ✅ UI DE ERROR POR DEFECTO
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">
                Oops! Algo salió mal
              </CardTitle>
              <CardDescription className="text-gray-600">
                Ocurrió un error inesperado. No te preocupes, tus datos están seguros.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* ✅ MOSTRAR DETALLES DEL ERROR SOLO EN DESARROLLO */}
              {process.env.NODE_ENV === 'development' && this.props.showError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-red-800 mb-2">
                    Detalles del error (solo en desarrollo):
                  </h4>
                  <pre className="text-xs text-red-700 overflow-auto">
                    {this.state.error?.toString()}
                  </pre>
                  {this.state.errorInfo && (
                    <pre className="text-xs text-red-600 mt-2 overflow-auto">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}

              {/* ✅ ACCIONES PARA EL USUARIO */}
              <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
                <Button 
                  onClick={this.handleRetry}
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Intentar de nuevo
                </Button>
                
                <Button 
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex-1"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Ir al inicio
                </Button>
              </div>

              {/* ✅ INFORMACIÓN ADICIONAL */}
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Si el problema persiste, contacta al soporte técnico.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// ✅ EXPORT COMPONENTS
export default ErrorBoundary;

// ✅ HOC PARA ENVOLVER COMPONENTES AUTOMÁTICAMENTE
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// ✅ HOOK PARA MANEJAR ERRORES EN COMPONENTES FUNCIONALES
export function useErrorHandler() {
  return (error: Error, errorInfo?: any) => {
    console.error('🚨 Error handled by useErrorHandler:', error);
    if (errorInfo) {
      console.error('📝 Additional error info:', errorInfo);
    }
    
    // ✅ OPCIONAL: Enviar a servicio de monitoreo
    // logErrorToService(error, errorInfo);
  };
}