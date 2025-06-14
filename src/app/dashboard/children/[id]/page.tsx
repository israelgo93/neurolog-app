// ================================================================
// src/app/dashboard/children/[id]/page.tsx
// Página de detalles de niño completa
// ================================================================

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/components/providers/AuthProvider';
import { useChildren } from '@/hooks/use-children';
import { useLogs } from '@/hooks/use-logs';
import type { 
  ChildWithRelation
} from '@/types';
import { 
  EditIcon,
  MoreVerticalIcon,
  UserPlusIcon,
  CalendarIcon,
  BookOpenIcon,
  TrendingUpIcon,
  BarChart3Icon,
  DownloadIcon,
  PlusIcon,
  UsersIcon,
  ActivityIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  EyeIcon,
  GraduationCapIcon,
  ShieldIcon,
  ClockIcon,
  ArrowLeftIcon
} from 'lucide-react';
import { format, differenceInYears, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ChildDetailPage() {
  const params = useParams();
  const router = useRouter();
  const childId = params.id as string;
  const { children, loading: childLoading, getChildById } = useChildren();
  const { logs, loading: logsLoading, stats } = useLogs({ childId });
  
  const [child, setChild] = useState<ChildWithRelation | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (childId && !childLoading) {
      const foundChild = getChildById(childId);
      setChild(foundChild || null);
    }
  }, [childId, childLoading, getChildById]);

  if (childLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Niño no encontrado</h2>
        <p className="text-gray-600 mt-2">El niño que buscas no existe o no tienes permisos para verlo.</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/children">Volver a la lista</Link>
        </Button>
      </div>
    );
  }

  const calculateAge = (birthDate: string) => {
    return differenceInYears(new Date(), new Date(birthDate));
  };

  const getRelationshipColor = (type: string) => {
    switch (type) {
      case 'parent': return 'bg-blue-100 text-blue-800';
      case 'teacher': return 'bg-green-100 text-green-800';
      case 'specialist': return 'bg-purple-100 text-purple-800';
      case 'observer': return 'bg-gray-100 text-gray-800';
      case 'family': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Estadísticas del niño
  const childStats = {
    totalLogs: logs.length,
    logsThisWeek: logs.filter(log => new Date(log.created_at) > subWeeks(new Date(), 1)).length,
    logsThisMonth: logs.filter(log => new Date(log.created_at) > subMonths(new Date(), 1)).length,
    lastLogDate: logs.length > 0 ? logs[0].created_at : null,
    pendingReviews: logs.filter(log => !log.reviewed_by).length,
    followUpsRequired: logs.filter(log => log.follow_up_required && !log.follow_up_date).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{child.name}</h1>
            <p className="text-gray-600">
              {child.birth_date && `${calculateAge(child.birth_date)} años`} • 
              Creado {format(new Date(child.created_at), 'dd MMM yyyy', { locale: es })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <DownloadIcon className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVerticalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <EditIcon className="h-4 w-4 mr-2" />
                Editar información
              </DropdownMenuItem>
              <DropdownMenuItem>
                <UserPlusIcon className="h-4 w-4 mr-2" />
                Gestionar usuarios
              </DropdownMenuItem>
              <DropdownMenuItem>
                <PlusIcon className="h-4 w-4 mr-2" />
                Nuevo registro
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <AlertCircleIcon className="h-4 w-4 mr-2" />
                Archivar niño
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpenIcon className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{childStats.totalLogs}</p>
                <p className="text-xs text-gray-600">Total registros</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUpIcon className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{childStats.logsThisWeek}</p>
                <p className="text-xs text-gray-600">Esta semana</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{childStats.logsThisMonth}</p>
                <p className="text-xs text-gray-600">Este mes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircleIcon className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{childStats.pendingReviews}</p>
                <p className="text-xs text-gray-600">Sin revisar</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ClockIcon className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{childStats.followUpsRequired}</p>
                <p className="text-xs text-gray-600">Seguimientos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UsersIcon className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{child.user_relations?.length || 0}</p>
                <p className="text-xs text-gray-600">Usuarios</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">General</TabsTrigger>
          <TabsTrigger value="logs">Registros</TabsTrigger>
          <TabsTrigger value="progress">Progreso</TabsTrigger>
          <TabsTrigger value="team">Equipo</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>

        {/* Tab: Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Child Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <GraduationCapIcon className="h-5 w-5 mr-2" />
                    Información Personal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={child.avatar_url} alt={child.name} />
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-xl font-bold">
                        {child.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{child.name}</h3>
                        {child.birth_date && (
                          <p className="text-gray-600">
                            Nacido el {format(new Date(child.birth_date), 'dd MMMM yyyy', { locale: es })} 
                            ({calculateAge(child.birth_date)} años)
                          </p>
                        )}
                      </div>
                      
                      {child.diagnosis && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Diagnóstico</h4>
                          <p className="text-sm text-gray-600">{child.diagnosis}</p>
                        </div>
                      )}
                      
                      {child.notes && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Notas adicionales</h4>
                          <p className="text-sm text-gray-600">{child.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Logs */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center">
                    <ActivityIcon className="h-5 w-5 mr-2" />
                    Registros Recientes
                  </CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/logs?child=${childId}`}>
                      Ver todos
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {logs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-start space-x-3 py-3 border-b border-gray-100 last:border-0">
                      <div 
                        className="w-3 h-3 rounded-full mt-2"
                        style={{ backgroundColor: log.category_color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {log.category_name || 'Sin categoría'}
                          </p>
                          <span className="text-xs text-gray-500">
                            {format(new Date(log.created_at), 'dd MMM, HH:mm', { locale: es })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {log.content}
                        </p>
                        <div className="flex items-center mt-2 space-x-2">
                          {log.is_private && (
                            <Badge variant="secondary" className="text-xs">
                              <EyeIcon className="h-3 w-3 mr-1" />
                              Privado
                            </Badge>
                          )}
                          {log.follow_up_required && (
                            <Badge variant="outline" className="text-xs text-orange-600">
                              <ClockIcon className="h-3 w-3 mr-1" />
                              Seguimiento
                            </Badge>
                          )}
                          {log.reviewed_by && (
                            <Badge variant="outline" className="text-xs text-green-600">
                              <CheckCircleIcon className="h-3 w-3 mr-1" />
                              Revisado
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {logs.length === 0 && (
                    <div className="text-center py-8">
                      <BookOpenIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No hay registros aún</p>
                      <Button size="sm" className="mt-2" asChild>
                        <Link href="/dashboard/logs/new">Crear primer registro</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Team Access */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShieldIcon className="h-5 w-5 mr-2" />
                    Equipo de Apoyo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {child.user_relations?.map((relation) => (
                    <div key={`${relation.user_id}-${relation.relationship_type}`} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {relation.user_email?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {relation.user_name || relation.user_email}
                          </p>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getRelationshipColor(relation.relationship_type)}`}
                          >
                            {relation.relationship_type === 'parent' && 'Padre/Madre'}
                            {relation.relationship_type === 'teacher' && 'Docente'}
                            {relation.relationship_type === 'specialist' && 'Especialista'}
                            {relation.relationship_type === 'observer' && 'Observador'}
                            {relation.relationship_type === 'family' && 'Familiar'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {relation.can_edit && (
                          <Badge variant="outline" className="text-xs">
                            <EditIcon className="h-3 w-3" />
                          </Badge>
                        )}
                        {relation.can_export && (
                          <Badge variant="outline" className="text-xs">
                            <DownloadIcon className="h-3 w-3" />
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <Separator />
                  <Button variant="outline" size="sm" className="w-full">
                    <UserPlusIcon className="h-4 w-4 mr-2" />
                    Agregar persona
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Acciones Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Nuevo registro
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Programar evento
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <BarChart3Icon className="h-4 w-4 mr-2" />
                    Ver progreso
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    Exportar datos
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tab: Logs */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Registros</CardTitle>
              <CardDescription>
                Todos los registros documentados para {child.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* TODO: Implementar lista detallada de logs con filtros */}
              <p className="text-gray-500">Vista detallada de registros próximamente...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Progress */}
        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Progreso</CardTitle>
              <CardDescription>
                Gráficos y métricas de desarrollo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* TODO: Implementar gráficos de progreso */}
              <p className="text-gray-500">Gráficos de progreso próximamente...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Team */}
        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>Gestión del Equipo</CardTitle>
              <CardDescription>
                Administrar usuarios y permisos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* TODO: Implementar gestión de equipo */}
              <p className="text-gray-500">Gestión de equipo próximamente...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Settings */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configuración</CardTitle>
              <CardDescription>
                Ajustes específicos para {child.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* TODO: Implementar configuración específica */}
              <p className="text-gray-500">Configuración específica próximamente...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}