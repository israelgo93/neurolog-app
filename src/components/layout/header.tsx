// src/components/layout/header.tsx
// Header del dashboard completamente responsivo y mejorado

'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useAuth } from '@/components/providers/AuthProvider';
import { useLogs } from '@/hooks/use-logs';
import { 
  Bell, 
  Settings, 
  User, 
  LogOut, 
  Shield, 
  ChevronDown,
  Search,
  Plus,
  Menu,
  Home,
  Users,
  BookOpen,
  BarChart3,
  Calendar,
  Download
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Header() {
  const { user, signOut, isAdmin } = useAuth();
  const { stats } = useLogs({ pageSize: 1 });
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  const totalNotifications = (stats.pending_reviews || 0) + (stats.follow_ups_due || 0);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      '/dashboard': 'Dashboard',
      '/dashboard/children': 'Gestión de Niños',
      '/dashboard/logs': 'Registros Diarios',
      '/dashboard/reports': 'Reportes y Análisis',
      '/dashboard/calendar': 'Calendario',
      '/dashboard/export': 'Exportar Datos',
      '/dashboard/admin': 'Administración',
      '/dashboard/settings': 'Configuración'
    };
    
    // Find exact match or closest parent route
    let title = titles[pathname];
    if (!title) {
      for (const [route, routeTitle] of Object.entries(titles)) {
        if (pathname.startsWith(route)) {
          title = routeTitle;
          break;
        }
      }
    }
    
    return title || 'NeuroLog';
  };

  const getUserInitials = () => {
    if (!user?.full_name) return 'U';
    return user.full_name
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const quickActions = [
    { 
      label: 'Nuevo Registro', 
      href: '/dashboard/logs?action=new', 
      icon: Plus,
      color: 'bg-blue-600 hover:bg-blue-700 text-white'
    },
    { 
      label: 'Ver Niños', 
      href: '/dashboard/children', 
      icon: Users,
      color: 'bg-green-600 hover:bg-green-700 text-white'
    },
    { 
      label: 'Reportes', 
      href: '/dashboard/reports', 
      icon: BarChart3,
      color: 'bg-purple-600 hover:bg-purple-700 text-white'
    }
  ];

  const mobileNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Niños', href: '/dashboard/children', icon: Users },
    { name: 'Registros', href: '/dashboard/logs', icon: BookOpen },
    { name: 'Reportes', href: '/dashboard/reports', icon: BarChart3 },
    { name: 'Calendario', href: '/dashboard/calendar', icon: Calendar },
    { name: 'Exportar', href: '/dashboard/export', icon: Download },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="flex items-center justify-between px-3 sm:px-4 lg:px-6 h-14 sm:h-16">
        
        {/* Left Section - Logo y Title */}
        <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
          {/* Mobile Menu Button */}
          {isMobile && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle className="flex items-center">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-2">
                      <span className="text-white font-bold text-sm">NL</span>
                    </div>
                    NeuroLog
                  </SheetTitle>
                  <SheetDescription>
                    Navegación principal
                  </SheetDescription>
                </SheetHeader>
                <nav className="mt-6 space-y-2">
                  {mobileNavItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                        pathname === item.href || pathname.startsWith(item.href + '/')
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      )}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          )}

          {/* Logo y Título */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm sm:text-base">NL</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                NeuroLog
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 hidden md:block">
                {getPageTitle()}
              </p>
            </div>
          </div>
        </div>

        {/* Center Section - Search (Desktop) */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar niños, registros..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Section - Actions y User */}
        <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
          
          {/* Quick Actions - Hidden on small mobile */}
          <div className="hidden sm:flex items-center space-x-1">
            {!isMobile && (
              <TooltipProvider>
                {quickActions.slice(0, 2).map((action) => (
                  <Tooltip key={action.label}>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className={cn("h-8 w-8 sm:h-9 sm:w-9 p-0", action.color)}
                        asChild
                      >
                        <Link href={action.href}>
                          <action.icon className="h-4 w-4" />
                          <span className="sr-only">{action.label}</span>
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{action.label}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            )}
          </div>

          {/* Mobile Search Button */}
          <Button variant="ghost" size="sm" className="lg:hidden">
            <Search className="h-4 w-4" />
            <span className="sr-only">Buscar</span>
          </Button>

          {/* Notifications */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                  {totalNotifications > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
                    >
                      {totalNotifications > 9 ? '9+' : totalNotifications}
                    </Badge>
                  )}
                  <span className="sr-only">Notificaciones</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Notificaciones ({totalNotifications})</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 h-8 sm:h-10 px-2 sm:px-3">
                <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                  <AvatarImage src={user?.avatar_url} />
                  <AvatarFallback className="text-xs sm:text-sm">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-24 lg:max-w-32">
                    {user?.full_name ?? 'Usuario'}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.role === 'parent' ? 'Padre/Madre' : 
                     user?.role === 'teacher' ? 'Docente' :
                     user?.role === 'specialist' ? 'Especialista' :
                     user?.role === 'admin' ? 'Admin' : 'Usuario'}
                  </p>
                </div>
                <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  Configuración
                </Link>
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/admin" className="flex items-center">
                    <Shield className="mr-2 h-4 w-4" />
                    Administración
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleSignOut}
                className="flex items-center text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Page Title */}
      {isMobile && (
        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50">
          <h2 className="text-sm font-medium text-gray-900">{getPageTitle()}</h2>
        </div>
      )}
    </header>
  );
}