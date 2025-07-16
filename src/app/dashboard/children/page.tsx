'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import type { ChildWithRelation, ChildFilters, RelationshipType } from '@/types';
import { 
  PlusIcon, 
  SearchIcon, 
  FilterIcon,
  MoreVerticalIcon,
  EditIcon,
  EyeIcon,
  UserPlusIcon,
  CalendarIcon,
  HeartIcon,
  TrendingUpIcon,
  UsersIcon,
  BookOpenIcon,
  RefreshCwIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// ================================================================
// COMPONENTES AUXILIARES
// ================================================================

interface ChildCardProps {
  readonly child: ChildWithRelation;
  readonly onEdit: (child: ChildWithRelation) => void;
  readonly onViewDetails: (child: ChildWithRelation) => void;
  readonly onManageUsers: (child: ChildWithRelation) => void;
}

function ChildCard({ child, onEdit, onViewDetails, onManageUsers }: ChildCardProps) {
  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  const getRelationshipColor = (type: RelationshipType) => {
    switch (type) {
      case 'parent': return 'bg-blue-100 text-blue-800';
      case 'teacher': return 'bg-green-100 text-green-800';
      case 'specialist': return 'bg-purple-100 text-purple-800';
      case 'observer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRelationshipLabel = (type: RelationshipType) => {
    switch (type) {
      case 'parent': return 'Padre/Madre';
      case 'teacher': return 'Docente';
      case 'specialist': return 'Especialista';
      case 'observer': return 'Observador';
      case 'family': return 'Familia';
      default: return type;
    }
  };

  const getPermissionLabel = (canEdit: boolean) => {
    return canEdit ? 'Editor' : 'Solo lectura';
  };

  const getPermissionIcon = (canEdit: boolean) => {
    return canEdit ? <EditIcon className="h-3 w-3" /> : <EyeIcon className="h-3 w-3" />;
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <Avatar className="h-14 w-14 border-2 border-white shadow-md">
              <AvatarImage src={child.avatar_url ?? undefined} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg font-semibold">
                {child.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-lg text-gray-900 truncate" title={child.name}>
                {child.name}
              </h3>
              <div className="flex flex-wrap items-center gap-2 mt-1">
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
                  <span className="mr-1">{getPermissionIcon(child.can_edit)}</span>
                  {getPermissionLabel(child.can_edit)}
                </Badge>
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVerticalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onViewDetails(child)}>
                <EyeIcon className="mr-2 h-4 w-4" />
                Ver detalles
              </DropdownMenuItem>
              {child.can_edit && (
                <DropdownMenuItem onClick={() => onEdit(child)}>
                  <EditIcon className="mr-2 h-4 w-4" />
                  Editar información
                </DropdownMenuItem>
              )}
              {child.can_invite_others && (
                <DropdownMenuItem onClick={() => onManageUsers(child)}>
                  <UserPlusIcon className="mr-2 h-4 w-4" />
                  Gestionar usuarios
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Información principal */}
          <div className="grid grid-cols-1 gap-3">
            {child.birth_date && (
              <div className="flex items-center space-x-2 text-sm">
                <CalendarIcon className="h-4 w-4 text-blue-500" />
                <span className="text-gray-700 font-medium">
                  {calculateAge(child.birth_date)} años
                </span>
                <span className="text-gray-500">
                  • {format(new Date(child.birth_date), 'dd/MM/yyyy')}
                </span>
              </div>
            )}
            
            {child.diagnosis && (
              <div className="flex items-center space-x-2 text-sm">
                <HeartIcon className="h-4 w-4 text-red-500" />
                <span className="text-gray-700 font-medium">Diagnóstico:</span>
                <span className="text-gray-600 truncate flex-1" title={child.diagnosis}>
                  {child.diagnosis}
                </span>
              </div>
            )}

            {!child.birth_date && !child.diagnosis && (
              <div className="text-sm text-gray-500 italic">
                Sin información adicional registrada
              </div>
            )}
          </div>

          {/* Estadísticas y actividad */}
          <div className="pt-3 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <BookOpenIcon className="h-4 w-4 text-gray-400" />
                  <p className="text-sm font-medium text-gray-900">Registros</p>
                </div>
                <p className="text-xs text-gray-500">Este mes</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <TrendingUpIcon className="h-4 w-4 text-gray-400" />
                  <p className="text-sm font-medium text-gray-900">Actividad</p>
                </div>
                <p className="text-xs text-gray-500">
                  {child.updated_at 
                    ? format(new Date(child.updated_at), 'dd MMM', { locale: es }) 
                    : 'Sin actividad'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface FiltersCardProps {
  readonly filters: ChildFilters;
  readonly onFiltersChange: (filters: ChildFilters) => void;
}

function FiltersCard({ filters, onFiltersChange }: FiltersCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-base">
          <FilterIcon className="h-4 w-4 mr-2" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Búsqueda por nombre */}
          <div className="space-y-2">
            <label htmlFor="search-child" className="text-sm font-medium">Buscar por nombre</label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search-child"
                placeholder="Nombre del niño..."
                value={filters.search ?? ''}
                onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>

          {/* Relación */}
          <Select 
            value={filters.relationship_type ?? 'all'} 
            onValueChange={(value) => onFiltersChange({ 
              ...filters, 
              relationship_type: value === 'all' ? undefined : value as RelationshipType 
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tipo de relación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las relaciones</SelectItem>
              <SelectItem value="parent">Padre/Madre</SelectItem>
              <SelectItem value="teacher">Docente</SelectItem>
              <SelectItem value="specialist">Especialista</SelectItem>
              <SelectItem value="observer">Observador</SelectItem>
              <SelectItem value="family">Familia</SelectItem>
            </SelectContent>
          </Select>

          {/* Rango de edad */}
          <div className="space-y-2">
            <label htmlFor="max-age-child" className="text-sm font-medium">Edad máxima</label>
            <Input
              id="max-age-child"
              type="number"
              placeholder="Años"
              min="0"
              max="25"
              value={filters.max_age ?? ''}
              onChange={(e) => onFiltersChange({ 
                ...filters, 
                max_age: e.target.value ? parseInt(e.target.value) : undefined 
              })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ================= FUNCIONES AUXILIARES DE RENDER =================

function renderLoadingCards() {
  // Usar un id único para cada Card
  const loadingIds = ['a','b','c','d','e','f'];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {loadingIds.map((id) => (
        <Card key={id} className="animate-pulse">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-gray-200 h-12 w-12"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

function renderError(error: string) {
  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="text-center py-12">
        <p className="text-red-600 mb-4">Error al cargar los niños: {error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCwIcon className="h-4 w-4 mr-2" />
          Reintentar
        </Button>
      </CardContent>
    </Card>
  );
}

function renderEmpty(childrenLength: number, setFilters: (f: ChildFilters) => void) {
  return (
    <Card>
      <CardContent className="text-center py-12">
        <UsersIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        {childrenLength === 0 ? (
          <>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay niños registrados
            </h3>
            <p className="text-gray-600 mb-6">
              Comienza agregando el primer niño para empezar el seguimiento
            </p>
            <Button asChild>
              <Link href="/dashboard/children/new">
                <PlusIcon className="mr-2 h-4 w-4" />
                Agregar Primer Niño
              </Link>
            </Button>
          </>
        ) : (
          <>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron niños
            </h3>
            <p className="text-gray-600 mb-6">
              No hay niños que coincidan con los filtros seleccionados
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
  );
}

function renderStats(children: ChildWithRelation[]) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <UsersIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Niños</p>
              <p className="text-2xl font-bold">{children.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <BookOpenIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Activos</p>
              <p className="text-2xl font-bold">
                {children.filter(c => c.is_active).length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <EditIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Editables</p>
              <p className="text-2xl font-bold">
                {children.filter(c => c.can_edit).length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <TrendingUpIcon className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Con Diagnóstico</p>
              <p className="text-2xl font-bold">
                {children.filter(c => c.diagnosis).length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ================================================================
// COMPONENTE PRINCIPAL
// ================================================================

export default function ChildrenPage() {
  const { user } = useAuth();
  const { children, loading, error, filterChildren } = useChildren({ 
    includeInactive: false,
    realtime: true 
  });
  
  const [filters, setFilters] = useState<ChildFilters>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Aplicar filtros
  const filteredChildren = useMemo(() => {
    return filterChildren(filters);
  }, [filters, filterChildren]);

  // Handlers
  const handleEdit = (child: ChildWithRelation) => {
    window.location.href = `/dashboard/children/${child.id}/edit`;
  };

  const handleViewDetails = (child: ChildWithRelation) => {
    window.location.href = `/dashboard/children/${child.id}`;
  };

  const handleManageUsers = (child: ChildWithRelation) => {
    window.location.href = `/dashboard/children/${child.id}/users`;
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <UsersIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  // Renderizado principal simplificado
  let mainContent: JSX.Element;
  if (loading) {
    mainContent = renderLoadingCards();
  } else if (error) {
    mainContent = renderError(error);
  } else if (filteredChildren.length === 0) {
    mainContent = renderEmpty(children.length, setFilters);
  } else {
    mainContent = (
      <>
        {/* View Mode Toggle */}
        <div className="flex justify-end">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Vista:</span>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              Tarjetas
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              Lista
            </Button>
          </div>
        </div>

        {/* Children Grid - Responsive adaptado al número de niños */}
        <div className={`grid gap-6 ${
          filteredChildren.length === 1 
            ? 'grid-cols-1 max-w-md mx-auto' 
            : filteredChildren.length === 2
            ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto'
            : filteredChildren.length === 3
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        }`}>
          {filteredChildren.map((child) => (
            <ChildCard
              key={child.id}
              child={child}
              onEdit={handleEdit}
              onViewDetails={handleViewDetails}
              onManageUsers={handleManageUsers}
            />
          ))}
        </div>
      </>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con botón de crear niño */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Niños</h1>
          <p className="text-gray-600">
            Gestiona y visualiza el progreso de los niños bajo tu cuidado
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          
          <Button asChild>
            <Link href="/dashboard/children/new">
              <PlusIcon className="h-4 w-4 mr-2" />
              Crear Niño
            </Link>
          </Button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      {renderStats(children)}

      {/* Filtros */}
      <FiltersCard filters={filters} onFiltersChange={setFilters} />

      {/* Lista/Grid de niños */}
      {mainContent}
    </div>
  );
}