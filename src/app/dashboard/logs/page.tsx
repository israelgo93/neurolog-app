// src/app/dashboard/logs/page.tsx
// Página principal de logs actualizada con el nuevo modelo

'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  LogWithDetails, 
  LogFilters, 
  IntensityLevel, 
  ChildWithRelation 
} from '@/types';
import { 
  PlusIcon, 
  SearchIcon, 
  FilterIcon,
  MoreVerticalIcon,
  EditIcon,
  EyeIcon,
  EyeOffIcon,
  ClockIcon,
  TagIcon,
  MapPinIcon,
  CloudIcon,
  FileIcon,
  MessageSquareIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  DownloadIcon,
  RefreshCwIcon,
  CalendarIcon,
  TrendingUpIcon
} from 'lucide-react';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

// ================================================================
// COMPONENTES AUXILIARES
// ================================================================

interface LogCardProps {
  readonly log: LogWithDetails;
  readonly onEdit: (log: LogWithDetails) => void;
  readonly onViewDetails: (log: LogWithDetails) => void;
  readonly onTogglePrivacy: (log: LogWithDetails) => void;
  readonly onAddFeedback: (log: LogWithDetails) => void;
}

function LogCard({ log, onEdit, onViewDetails, onTogglePrivacy, onAddFeedback }: LogCardProps) {
  const getIntensityColor = (level: IntensityLevel) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
    }
  };

  const getMoodEmoji = (score?: number) => {
    if (!score) return null;
    const emojis = ['😢', '😕', '😐', '😊', '😄'];
    return emojis[score - 1];
  };

  const formatLogDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return 'Hoy';
    if (isYesterday(date)) return 'Ayer';
    return format(date, 'dd MMM', { locale: es });
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          {/* Log Header */}
          <div className="flex items-start space-x-4 flex-1">
            <Avatar className="h-12 w-12">
              <AvatarImage 
                src={log.child_avatar_url} 
                alt={log.child_name}
              />
              <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-semibold">
                {log.child_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {log.title}
                </h3>
                {log.is_private && (
                  <EyeOffIcon className="h-4 w-4 text-gray-400" title="Registro privado" />
                )}
                {log.is_flagged && (
                  <AlertCircleIcon className="h-4 w-4 text-red-500" title="Marcado para atención" />
                )}
              </div>
              
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium text-blue-600">
                  {log.child_name}
                </span>
                <span className="text-gray-300">•</span>
                <span className="text-sm text-gray-600">
                  {formatLogDate(log.log_date)}
                </span>
                <span className="text-gray-300">•</span>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(log.created_at), { 
                    addSuffix: true, 
                    locale: es 
                  })}
                </span>
              </div>

              <div className="flex items-center space-x-2 mb-3">
                {log.category_name && (
                  <Badge 
                    variant="secondary" 
                    className="text-xs"
                    style={{ 
                      backgroundColor: `${log.category_color}20`,
                      color: log.category_color 
                    }}
                  >
                    {log.category_name}
                  </Badge>
                )}
                
                <Badge className={`text-xs ${getIntensityColor(log.intensity_level)}`}>
                  {log.intensity_level === 'low' && 'Bajo'}
                  {log.intensity_level === 'medium' && 'Medio'}
                  {log.intensity_level === 'high' && 'Alto'}
                </Badge>

                {log.mood_score && (
                  <div className="flex items-center space-x-1">
                    <span className="text-lg">{getMoodEmoji(log.mood_score)}</span>
                    <span className="text-xs text-gray-600">{log.mood_score}/5</span>
                  </div>
                )}
              </div>
              
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {log.content}
              </p>

              {/* Metadata */}
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                {log.tags.length > 0 && (
                  <div className="flex items-center">
                    <TagIcon className="h-3 w-3 mr-1" />
                    <span>{log.tags.slice(0, 2).join(', ')}</span>
                    {log.tags.length > 2 && <span> +{log.tags.length - 2}</span>}
                  </div>
                )}
                
                {log.location && (
                  <div className="flex items-center">
                    <MapPinIcon className="h-3 w-3 mr-1" />
                    <span>{log.location}</span>
                  </div>
                )}
                
                {log.weather && (
                  <div className="flex items-center">
                    <CloudIcon className="h-3 w-3 mr-1" />
                    <span>{log.weather}</span>
                  </div>
                )}
                
                {log.attachments.length > 0 && (
                  <div className="flex items-center">
                    <FileIcon className="h-3 w-3 mr-1" />
                    <span>{log.attachments.length} archivo{log.attachments.length !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVerticalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onViewDetails(log)}>
                <EyeIcon className="mr-2 h-4 w-4" />
                Ver Detalles
              </DropdownMenuItem>
              {log.can_edit && (
                <DropdownMenuItem onClick={() => onEdit(log)}>
                  <EditIcon className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onTogglePrivacy(log)}>
                {log.is_private ? (
                  <>
                    <EyeIcon className="mr-2 h-4 w-4" />
                    Hacer Público
                  </>
                ) : (
                  <>
                    <EyeOffIcon className="mr-2 h-4 w-4" />
                    Hacer Privado
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onAddFeedback(log)}>
                <MessageSquareIcon className="mr-2 h-4 w-4" />
                Agregar Comentario
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status Indicators */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Review Status */}
              {log.reviewed_by ? (
                <div className="flex items-center text-xs text-green-600">
                  <CheckCircleIcon className="h-3 w-3 mr-1" />
                  <span>Revisado por {log.reviewer_name}</span>
                </div>
              ) : (
                <div className="flex items-center text-xs text-orange-600">
                  <ClockIcon className="h-3 w-3 mr-1" />
                  <span>Pendiente de revisión</span>
                </div>
              )}

              {/* Follow-up Status */}
              {log.follow_up_required && (
                <div className="flex items-center text-xs text-purple-600">
                  <AlertCircleIcon className="h-3 w-3 mr-1" />
                  <span>
                    Seguimiento {log.follow_up_date ? 
                      `programado para ${format(new Date(log.follow_up_date), 'dd MMM', { locale: es })}` : 
                      'requerido'
                    }
                  </span>
                </div>
              )}
            </div>

            {/* Logged by */}
            <div className="text-xs text-gray-500">
              por {log.logged_by_name}
            </div>
          </div>

          {/* Feedback Preview */}
          {(log.specialist_notes || log.parent_feedback) && (
            <div className="mt-2 space-y-1">
              {log.specialist_notes && (
                <div className="text-xs text-purple-600 bg-purple-50 p-2 rounded">
                  <strong>Nota del especialista:</strong> {log.specialist_notes.slice(0, 100)}
                  {log.specialist_notes.length > 100 && '...'}
                </div>
              )}
              {log.parent_feedback && (
                <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                  <strong>Comentario de padres:</strong> {log.parent_feedback.slice(0, 100)}
                  {log.parent_feedback.length > 100 && '...'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-4 flex space-x-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
            onClick={() => onViewDetails(log)}
          >
            <EyeIcon className="mr-2 h-4 w-4" />
            Ver Completo
          </Button>
          {log.can_edit && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onEdit(log)}
            >
              <EditIcon className="mr-2 h-4 w-4" />
              Editar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface FiltersBarProps {
  filters: LogFilters;
  onFiltersChange: (filters: LogFilters) => void;
  children: ChildWithRelation[];
  totalCount: number;
  filteredCount: number;
}

function FiltersBar({ filters, onFiltersChange, children, totalCount, filteredCount }: FiltersBarProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <FilterIcon className="mr-2 h-5 w-5" />
              Filtros de Búsqueda
            </CardTitle>
            <CardDescription>
              Mostrando {filteredCount} de {totalCount} registros
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onFiltersChange({})}
          >
            Limpiar Filtros
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Search */}
          <div className="md:col-span-2 relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar en título y contenido..."
              value={filters.search_term ?? ''}
              onChange={(e) => onFiltersChange({ ...filters, search_term: e.target.value })}
              className="pl-10"
            />
          </div>

          {/* Child Filter */}
          <Select 
            value={filters.child_id || 'all'} 
            onValueChange={(value) => onFiltersChange({ 
              ...filters, 
              child_id: value === 'all' ? undefined : value 
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos los niños" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los niños</SelectItem>
              {children.map((child) => (
                <SelectItem key={child.id} value={child.id}>
                  {child.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Range */}
          <Input
            type="date"
            placeholder="Desde"
            value={filters.date_from ?? ''}
            onChange={(e) => onFiltersChange({ ...filters, date_from: e.target.value })}
          />

          <Input
            type="date"
            placeholder="Hasta"
            value={filters.date_to ?? ''}
            onChange={(e) => onFiltersChange({ ...filters, date_to: e.target.value })}
          />

          {/* Review Status */}
          <Select 
            value={filters.reviewed_status ?? 'all'} 
            onValueChange={(value) => onFiltersChange({ 
              ...filters, 
              reviewed_status: value === 'all' ? undefined : value as any
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Estado de revisión" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="reviewed">Revisados</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Additional Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Intensity Level */}
          <Select 
            value={filters.intensity_level ?? 'all'} 
            onValueChange={(value) => onFiltersChange({ 
              ...filters, 
              intensity_level: value === 'all' ? undefined : value as IntensityLevel
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Intensidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las intensidades</SelectItem>
              <SelectItem value="low">Baja</SelectItem>
              <SelectItem value="medium">Media</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
            </SelectContent>
          </Select>

          {/* Mood Score Range */}
          <div className="flex space-x-2">
            <Input
              type="number"
              placeholder="Humor mín"
              min="1"
              max="5"
              value={filters.mood_score_min ?? ''}
              onChange={(e) => onFiltersChange({ 
                ...filters, 
                mood_score_min: e.target.value ? parseInt(e.target.value) : undefined 
              })}
            />
            <Input
              type="number"
              placeholder="Humor máx"
              min="1"
              max="5"
              value={filters.mood_score_max ?? ''}
              onChange={(e) => onFiltersChange({ 
                ...filters, 
                mood_score_max: e.target.value ? parseInt(e.target.value) : undefined 
              })}
            />
          </div>

          {/* Privacy Filter */}
          <Select 
            value={filters.is_private === undefined ? 'all' : filters.is_private.toString()} 
            onValueChange={(value) => onFiltersChange({ 
              ...filters, 
              is_private: value === 'all' ? undefined : value === 'true' 
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Privacidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="false">Públicos</SelectItem>
              <SelectItem value="true">Privados</SelectItem>
            </SelectContent>
          </Select>

          {/* Follow-up Status */}
          <Select 
            value={filters.follow_up_status || 'all'} 
            onValueChange={(value) => onFiltersChange({ 
              ...filters, 
              follow_up_status: value === 'all' ? undefined : value as any
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seguimiento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="required">Con seguimiento</SelectItem>
              <SelectItem value="completed">Sin seguimiento</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

// ================================================================
// COMPONENTE PRINCIPAL
// ================================================================

export default function LogsPage() {
  const { user } = useAuth();
  const { children } = useChildren({ includeInactive: false });
  const { 
    logs, 
    stats, 
    loading, 
    error, 
    hasMore,
    filterLogs,
    loadMore,
    refreshLogs,
    togglePrivacy
  } = useLogs({ 
    includePrivate: true,
    realtime: true,
    pageSize: 20 
  });

  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<LogFilters>({
    child_id: searchParams.get('child_id') ?? undefined,
    category_id: searchParams.get('category_id') ?? undefined,
  });

  // Aplicar filtros
  const filteredLogs = useMemo(() => {
    return filterLogs(filters);
  }, [logs, filters, filterLogs]);

  // Handlers
  const handleEdit = (log: LogWithDetails) => {
    window.location.href = `/dashboard/logs/${log.id}/edit`;
  };

  const handleViewDetails = (log: LogWithDetails) => {
    window.location.href = `/dashboard/logs/${log.id}`;
  };

  const handleTogglePrivacy = async (log: LogWithDetails) => {
    try {
      await togglePrivacy(log.id);
    } catch (error) {
      console.error('Error toggling privacy:', error);
    }
  };

  const handleAddFeedback = (log: LogWithDetails) => {
    window.location.href = `/dashboard/logs/${log.id}?action=feedback`;
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-full" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error al cargar registros</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => refreshLogs()} 
              className="w-full"
            >
              <RefreshCwIcon className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Registros Diarios
          </h1>
          <p className="text-gray-600 mt-1">
            Historial completo de observaciones y eventos documentados
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => refreshLogs()}>
            <RefreshCwIcon className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/logs/export">
              <DownloadIcon className="mr-2 h-4 w-4" />
              Exportar
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/logs/new">
              <PlusIcon className="mr-2 h-4 w-4" />
              Nuevo Registro
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Registros</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_logs}</p>
              </div>
              <TrendingUpIcon className="h-8 w-8 text-blue-600 ml-auto" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div>
                <p className="text-sm font-medium text-gray-600">Esta Semana</p>
                <p className="text-2xl font-bold text-green-600">{stats.logs_this_week}</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-green-600 ml-auto" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending_reviews}</p>
              </div>
              <ClockIcon className="h-8 w-8 text-orange-600 ml-auto" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div>
                <p className="text-sm font-medium text-gray-600">Seguimientos</p>
                <p className="text-2xl font-bold text-purple-600">{stats.follow_ups_due}</p>
              </div>
              <AlertCircleIcon className="h-8 w-8 text-purple-600 ml-auto" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <FiltersBar
        filters={filters}
        onFiltersChange={setFilters}
        children={children}
        totalCount={logs.length}
        filteredCount={filteredLogs.length}
      />

      {/* Results */}
      {filteredLogs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            {logs.length === 0 ? (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay registros todavía
                </h3>
                <p className="text-gray-600 mb-6">
                  Comienza documentando el primer evento o actividad importante
                </p>
                <Button asChild>
                  <Link href="/dashboard/logs/new">
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Crear Primer Registro
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron registros
                </h3>
                <p className="text-gray-600 mb-6">
                  No hay registros que coincidan con los filtros seleccionados
                </p>
                <Button 
                  variant="outline"
                  onClick={() => setFilters({})}
                >
                  Limpiar Filtros
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Logs List */}
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <LogCard
                key={log.id}
                log={log}
                onEdit={handleEdit}
                onViewDetails={handleViewDetails}
                onTogglePrivacy={handleTogglePrivacy}
                onAddFeedback={handleAddFeedback}
              />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="text-center">
              <Button 
                variant="outline" 
                onClick={loadMore}
                className="min-w-[200px]"
              >
                Cargar Más Registros
              </Button>
            </div>
          )}

          {/* Summary */}
          {filteredLogs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Resumen de Filtros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                  <div>
                    <div className="text-xl font-bold text-blue-600">
                      {filteredLogs.length}
                    </div>
                    <div className="text-sm text-gray-600">Registros</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-green-600">
                      {filteredLogs.filter(l => l.reviewed_by).length}
                    </div>
                    <div className="text-sm text-gray-600">Revisados</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-purple-600">
                      {filteredLogs.filter(l => l.is_private).length}
                    </div>
                    <div className="text-sm text-gray-600">Privados</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-orange-600">
                      {filteredLogs.filter(l => l.follow_up_required).length}
                    </div>
                    <div className="text-sm text-gray-600">C/ Seguimiento</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-red-600">
                      {filteredLogs.filter(l => l.intensity_level === 'high').length}
                    </div>
                    <div className="text-sm text-gray-600">Alta Intensidad</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}