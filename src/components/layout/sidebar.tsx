// src/components/layout/sidebar.tsx
// Sidebar completamente responsivo con navegación mejorada

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/components/providers/AuthProvider';
import { useLogs } from '@/hooks/use-logs';
import {
  Home,
  Users,
  BookOpen,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  Bell,
  Shield,
  FileText,
  Calendar,
  Download,
  HelpCircle,
  ChevronRight
} from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  adminOnly?: boolean;
  description?: string;
}

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const pathname = usePathname();
  const { user, signOut, isAdmin } = useAuth();
  const { stats, loading: statsLoading } = useLogs({ pageSize: 1 });

  // Calcular notificaciones
  useEffect(() => {
    if (!statsLoading) {
      const totalNotifications = (stats.pending_reviews || 0) + (stats.follow_ups_due || 0);
      setNotifications(totalNotifications);
    }
  }, [stats, statsLoading]);

  // Cerrar sidebar en mobile cuando se navega
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevenir scroll del body cuando el sidebar está abierto en mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const navigation: NavigationItem[] = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: Home,
      description: 'Resumen general y estadísticas'
    },
    { 
      name: 'Niños', 
      href: '/dashboard/children', 
      icon: Users,
      description: 'Gestionar niños en seguimiento'
    },
    { 
      name: 'Registros', 
      href: '/dashboard/logs', 
      icon: BookOpen,
      badge: notifications > 0 ? notifications : undefined,
      description: 'Registros diarios y observaciones'
    },
    { 
      name: 'Reportes', 
      href: '/dashboard/reports', 
      icon: BarChart3,
      description: 'Análisis y reportes de progreso'
    },
    { 
      name: 'Calendario', 
      href: '/dashboard/calendar', 
      icon: Calendar,
      description: 'Programar eventos y seguimientos'
    },
    { 
      name: 'Exportar', 
      href: '/dashboard/export', 
      icon: Download,
      description: 'Exportar datos y reportes'
    },
    { 
      name: 'Administración', 
      href: '/dashboard/admin', 
      icon: Shield,
      adminOnly: true,
      description: 'Panel de administración'
    },
    { 
      name: 'Configuración', 
      href: '/dashboard/settings', 
      icon: Settings,
      description: 'Configuración personal'
    },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActiveLink = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile menu button - Fixed position for better accessibility */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="bg-white/90 backdrop-blur-sm shadow-lg border-gray-200 hover:bg-white"
          aria-label="Abrir menú de navegación"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Backdrop - Improved for better mobile UX */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside className={cn(
        // Base styles
        'fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-gray-200 shadow-xl',
        // Mobile styles
        'w-80 max-w-[85vw] transform transition-transform duration-300 ease-out',
        // Desktop styles
        'lg:static lg:transform-none lg:shadow-none lg:w-72',
        // Mobile visibility
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm lg:text-lg">NL</span>
            </div>
            <div className="hidden lg:block">
              <h1 className="text-xl font-bold text-gray-900">NeuroLog</h1>
              <p className="text-xs text-gray-500">Seguimiento NEE</p>
            </div>
            <div className="lg:hidden">
              <h1 className="text-lg font-bold text-gray-900">NeuroLog</h1>
            </div>
          </div>

          {/* Close button (mobile only) */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="lg:hidden"
            aria-label="Cerrar menú de navegación"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* User Info Card */}
        <div className="p-4 lg:p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 ring-2 ring-blue-100">
              <AvatarImage src={user?.avatar_url ?? undefined} alt={user?.full_name ?? undefined} />
              <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 text-blue-700 font-semibold">
                {user?.full_name?.charAt(0)?.toUpperCase() ?? 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.full_name ?? 'Usuario'}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role === 'parent' ? 'Padre/Madre' :
                 user?.role === 'teacher' ? 'Docente' :
                 user?.role === 'specialist' ? 'Especialista' : 
                 user?.role === 'admin' ? 'Administrador' : 'Usuario'}
              </p>
            </div>
            {notifications > 0 && (
              <Badge 
                variant="destructive" 
                className="h-5 w-5 text-xs p-0 flex items-center justify-center"
              >
                {notifications > 9 ? '9+' : notifications}
              </Badge>
            )}
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 lg:px-4">
          <nav className="space-y-1 py-4">
            {navigation
              .filter(item => !item.adminOnly || isAdmin)
              .map((item) => {
                const isActive = isActiveLink(item.href);
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      // Base styles
                      'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                      // Hover states
                      'hover:bg-gray-50 hover:text-gray-900',
                      // Active states
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                        : 'text-gray-700'
                    )}
                  >
                    <Icon className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0 transition-colors',
                      isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                    )} />
                    
                    <span className="flex-1 truncate">{item.name}</span>
                    
                    {/* Badge para notificaciones */}
                    {item.badge && (
                      <Badge 
                        variant="destructive" 
                        className="ml-2 h-5 w-5 text-xs p-0 flex items-center justify-center"
                      >
                        {item.badge > 9 ? '9+' : item.badge}
                      </Badge>
                    )}
                    
                    {/* Chevron para indicar página activa */}
                    {isActive && (
                      <ChevronRight className="ml-2 h-4 w-4 text-blue-600" />
                    )}
                  </Link>
                );
              })}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 lg:p-6 border-t border-gray-200 space-y-3">
          {/* Help Button */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            asChild
          >
            <Link href="/help">
              <HelpCircle className="mr-3 h-4 w-4" />
              Ayuda y soporte
            </Link>
          </Button>

          {/* Sign Out Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Cerrar sesión
          </Button>
          
          {/* Version info */}
          <div className="text-center pt-2">
            <p className="text-xs text-gray-400">NeuroLog v1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  );
}