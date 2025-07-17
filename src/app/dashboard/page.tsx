// src/app/dashboard/page.tsx
// Dashboard principal ACTUALIZADO con componentes corregidos y diseño responsivo

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/components/providers/AuthProvider';
import { useChildren } from '@/hooks/use-children';
import { useLogs } from '@/hooks/use-logs';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Heart,
  AlertCircle,
  Eye,
  Plus,
  BarChart3,
  Activity,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { format, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';
import type { DashboardStats, ChildWithRelation, LogWithDetails } from '@/types';

// ================================================================
// INTERFACES Y TIPOS
// ================================================================

interface QuickStatsProps {
  readonly stats: DashboardStats;
  readonly loading: boolean;
}

interface AccessibleChildrenProps {
  readonly childrenList: ChildWithRelation[];
  readonly loading: boolean;
}

interface RecentLogsProps {
  readonly logs: LogWithDetails[];
  readonly loading: boolean;
}

// ================================================================
// FUNCIONES HELPER
// ================================================================

/**
 * Determina el color del indicador de progreso basado en la cantidad de logs semanales
 */
function getProgressIndicatorColor(weeklyLogs: number): string {
  if (weeklyLogs >= 5) {
    return "bg-green-500";
  }
  if (weeklyLogs >= 3) {
    return "bg-yellow-500";
  }
  return "bg-red-500";
}

/**
 * Formatea una fecha para mostrar "Hoy", "Ayer" o el formato de fecha
 */
function formatDisplayDate(dateString: string): string {
  const date = new Date(dateString);
  if (isToday(date)) {
    return 'Hoy';
  }
  if (isYesterday(date)) {
    return 'Ayer';
  }
  return format(date, 'dd MMM', { locale: es });
}

// ================================================================
// COMPONENTE DE ESTADÍSTICAS RÁPIDAS RESPONSIVO
// ================================================================

function QuickStats({ stats, loading }: QuickStatsProps) {
  const statCards = [
    {
      title: 'Niños',
      value: stats.total_children ?? 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      description: 'En seguimiento',
      trend: 0
    },
    {
      title: 'Registros',
      value: stats.total_logs ?? 0,
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      description: 'Documentados',
      trend: 0
    },
    {
      title: 'Esta Semana',
      value: stats.logs_this_week ?? 0,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      description: 'Nuevos registros',
      trend: 0
    },
    {
      title: 'Pendientes',
      value: stats.pending_reviews ?? 0,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      description: 'Para revisar',
      trend: 0
    }
  ];

  if (loading) {
    return (
      <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Card key={`quickstats-skeleton-${i}`} className="animate-pulse border-l-4 border-gray-200">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
                  <Skeleton className="h-6 sm:h-8 w-12 sm:w-16" />
                  <Skeleton className="h-2 sm:h-3 w-14 sm:w-18" />
                  <Skeleton className="h-2 w-10" />
                </div>
                <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={`stat-${stat.title.toLowerCase()}`} className={`hover:shadow-md transition-all duration-200 ${stat.borderColor} border-l-4`}>
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-1 sm:space-y-2 flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                  {stat.title}
                </p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                  {stat.value.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {stat.description}
                </p>
                {stat.trend !== 0 && (
                  <div className={`text-xs flex items-center ${stat.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <TrendingUp className={`h-3 w-3 mr-1 ${stat.trend < 0 ? 'rotate-180' : ''}`} />
                    <span>{Math.abs(stat.trend)}%</span>
                  </div>
                )}
              </div>
              <div className={`p-2 sm:p-3 rounded-lg ${stat.bgColor} flex-shrink-0`}>
                <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ================================================================
// COMPONENTE DE NIÑOS ACCESIBLES RESPONSIVO
// ================================================================

function AccessibleChildren({ childrenList, loading }: AccessibleChildrenProps) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Card key={`children-skeleton-${i}`} className="animate-pulse border-0 shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <Skeleton className="h-14 w-14 sm:h-16 sm:w-16 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24 sm:w-32" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-3 w-16 sm:w-20" />
                    <Skeleton className="h-3 w-12 sm:w-16" />
                  </div>
                  <Skeleton className="h-3 w-20 sm:w-24" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-8" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (childrenList.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12">
        <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Users className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
        </div>
        <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
          No hay niños registrados
        </h3>
        <p className="text-sm sm:text-base text-gray-500 mb-6 max-w-sm mx-auto">
          Comienza agregando el primer niño para comenzar el seguimiento
        </p>
        <Button asChild size="lg">
          <Link href="/dashboard/children/new">
            <Plus className="mr-2 h-4 w-4" />
            Agregar Primer Niño
          </Link>
        </Button>
      </div>
    );
  }

  const getRelationshipColor = (type: string) => {
    switch (type) {
      case 'parent': return 'bg-blue-100 text-blue-800';
      case 'teacher': return 'bg-green-100 text-green-800';
      case 'specialist': return 'bg-purple-100 text-purple-800';
      case 'observer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRelationshipLabel = (type: string) => {
    switch (type) {
      case 'parent': return 'Padre/Madre';
      case 'teacher': return 'Docente';
      case 'specialist': return 'Especialista';
      case 'observer': return 'Observador';
      case 'family': return 'Familia';
      default: return type;
    }
  };

  const getPermissionIcon = (canEdit: boolean) => {
    return canEdit ? 'text-green-600' : 'text-gray-600';
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Grid responsivo adaptado al número de niños */}
      <div className={`grid gap-4 sm:gap-6 ${
        childrenList.length === 1 
          ? 'grid-cols-1 max-w-lg mx-auto' 
          : childrenList.length === 2
          ? 'grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto'
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      }`}>
        {childrenList.slice(0, 6).map((child) => (
          <Card key={child.id} className="hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white group">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <Avatar className="h-14 w-14 sm:h-16 sm:w-16 border-2 border-white shadow-md">
                  <AvatarImage 
                    src={child.avatar_url ?? undefined} 
                    alt={child.name}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-lg">
                    {child.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 truncate mb-2" title={child.name}>
                    {child.name}
                  </h4>
                  
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge 
                      variant="secondary" 
                      className={`${getRelationshipColor(child.relationship_type)} text-xs font-medium`}
                    >
                      {getRelationshipLabel(child.relationship_type)}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={`text-xs font-medium ${child.can_edit ? 'border-green-200 text-green-700 bg-green-50' : 'border-gray-200 text-gray-600 bg-gray-50'}`}
                    >
                      <Eye className={`h-3 w-3 mr-1 ${getPermissionIcon(child.can_edit)}`} />
                      {child.can_edit ? "Editor" : "Solo lectura"}
                    </Badge>
                  </div>
                  
                  {/* Información adicional */}
                  <div className="space-y-1 text-sm text-gray-600">
                    {child.birth_date && (
                      <div className="flex items-center">
                        <span className="font-medium">{calculateAge(child.birth_date)} años</span>
                        <span className="mx-1">•</span>
                        <span>{format(new Date(child.birth_date), 'dd/MM/yyyy')}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/dashboard/children/${child.id}`}>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              
              {/* Progress bar de actividad mejorado */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Actividad semanal</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    0/7
                  </span>
                </div>
                <Progress 
                  value={0} 
                  className="h-2"
                  indicatorClassName={getProgressIndicatorColor(0)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {childrenList.length > 6 && (
        <div className="text-center pt-4">
          <Button variant="outline" asChild>
            <Link href="/dashboard/children">
              Ver todos los niños ({childrenList.length})
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

// ================================================================
// COMPONENTE DE REGISTROS RECIENTES RESPONSIVO
// ================================================================

function RecentLogs({ logs, loading }: RecentLogsProps) {
  if (loading) {
    return (
      <div className="space-y-3 sm:space-y-4">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={`logs-skeleton-${i}`} className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg border bg-white animate-pulse">
            <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex justify-between items-start">
                <Skeleton className="h-4 w-32" />
                <div className="flex space-x-2">
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-6 w-6 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12">
        <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
        </div>
        <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
          No hay registros recientes
        </h3>
        <p className="text-sm sm:text-base text-gray-500 mb-6 max-w-sm mx-auto">
          Comienza creando tu primer registro diario
        </p>
        <Button asChild size="lg">
          <Link href="/dashboard/logs/new">
            <Plus className="mr-2 h-4 w-4" />
            Crear Registro
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {logs.slice(0, 5).map((log) => (
        <div key={log.id} className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg border bg-white hover:bg-gray-50 transition-colors group">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage 
              src={log.child_avatar_url ?? undefined} 
              alt={log.child_name}
            />
            <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
              {log.child_name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <h4 className="text-sm font-medium text-gray-900 truncate pr-2">
                {log.title}
              </h4>
              <div className="flex items-center space-x-2 flex-shrink-0">
                {log.mood_score && (
                  <div className="flex items-center">
                    <Heart className="h-3 w-3 text-red-400 mr-1" />
                    <span className="text-xs text-gray-500">{log.mood_score}/5</span>
                  </div>
                )}
                <Badge variant="outline" className="text-xs">
                  {log.category_name ?? 'General'}
                </Badge>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {log.content}
            </p>
            
            <div className="flex items-center justify-between mt-2">
              <div className="text-xs text-gray-500">
                <span className="font-medium">{log.child_name}</span>
                <span className="mx-1">•</span>
                <span>
                  {formatDisplayDate(log.created_at)}
                </span>
              </div>
              
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/dashboard/logs/${log.id}`}>
                    <Eye className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      <div className="text-center pt-4">
        <Button variant="outline" asChild>
          <Link href="/dashboard/logs">
            Ver todos los registros
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

// ================================================================
// COMPONENTE PRINCIPAL DEL DASHBOARD
// ================================================================

export default function DashboardPage() {
  const { user } = useAuth();
  const { children, loading: childrenLoading } = useChildren();
  const { logs, loading: logsLoading, stats } = useLogs();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 px-4 sm:px-6 lg:px-8">
      {/* Header responsivo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {greeting()}, {user?.full_name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'Usuario'}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl">
            Aquí está el resumen de hoy para tus niños en seguimiento
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <Button variant="outline" size="sm" asChild className="hidden sm:flex">
            <Link href="/dashboard/reports">
              <BarChart3 className="mr-2 h-4 w-4" />
              Reportes
            </Link>
          </Button>
          <Button size="sm" asChild className="w-full sm:w-auto">
            <Link href="/dashboard/logs/new">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Nuevo Registro</span>
              <span className="sm:hidden">Registro</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <QuickStats stats={stats} loading={logsLoading} />

      {/* Grid principal responsivo */}
      <div className="grid gap-4 sm:gap-6 lg:gap-8 lg:grid-cols-3">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Niños accesibles */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div>
                  <CardTitle className="flex items-center text-lg sm:text-xl">
                    <Users className="mr-2 h-5 w-5" />
                    Niños en Seguimiento
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Niños a los que tienes acceso para registrar actividades
                  </CardDescription>
                </div>
                
                <Button variant="outline" size="sm" asChild className="self-start sm:self-auto">
                  <Link href="/dashboard/children">
                    <span className="sm:hidden">Ver</span>
                    <span className="hidden sm:inline">Ver Todos</span>
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <AccessibleChildren childrenList={children} loading={childrenLoading} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar derecho */}
        <div className="space-y-4 sm:space-y-6">
          {/* Resumen de actividad */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg">
                <Activity className="mr-2 h-5 w-5" />
                Resumen Semanal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {logsLoading ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-26" />
                    <Skeleton className="h-4 w-18" />
                  </div>
                  <Skeleton className="h-9 w-full" />
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Registros diarios</span>
                    <span className="font-medium">
                      {stats.logs_this_week ? Math.round(stats.logs_this_week / 7) : 0} registros/día
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Humor promedio</span>
                    <div className="flex items-center">
                      <Heart className="h-4 w-4 text-red-400 mr-1" />
                      <span className="font-medium">
                        {logs.length > 0 ? 
                          (logs.reduce((acc, log) => acc + (log.mood_score || 0), 0) / logs.filter(l => l.mood_score).length || 0).toFixed(1) : 
                          'N/A'
                        }/5
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Último registro</span>
                    <span className="text-xs text-gray-500">
                      {logs.length > 0 ? 
                        format(new Date(logs[0].created_at), 'dd MMM', { locale: es }) : 
                        'Ninguno'
                      }
                    </span>
                  </div>

                  <div className="pt-2">
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href="/dashboard/reports">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Ver Reportes Completos
                      </Link>
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Registros recientes */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg">
                <BookOpen className="mr-2 h-5 w-5" />
                Actividad Reciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RecentLogs logs={logs} loading={logsLoading} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}