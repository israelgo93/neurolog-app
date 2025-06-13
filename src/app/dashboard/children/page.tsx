'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/components/providers/AuthProvider';
import { useChildren } from '@/hooks/use-children';
import type { ChildWithRelation, ChildFilters, RelationshipType } from '@/types';
import {
  PlusIcon, SearchIcon, FilterIcon, MoreVerticalIcon, EditIcon, EyeIcon, UserPlusIcon, CalendarIcon, MapPinIcon, HeartIcon, TrendingUpIcon, DownloadIcon, UsersIcon, BookOpenIcon, RefreshCwIcon,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// ================================================================
// COMPONENTES AUXILIARES
// ================================================================

interface ChildCardProps {
  child: ChildWithRelation;
  onEdit: (child: ChildWithRelation) => void;
  onViewDetails: (child: ChildWithRelation) => void;
  onManageUsers: (child: ChildWithRelation) => void;
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
      case 'parent':
        return 'bg-blue-100 text-blue-800';
      case 'teacher':
        return 'bg-green-100 text-green-800';
      case 'specialist':
        return 'bg-purple-100 text-purple-800';
      case 'observer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRelationshipLabel = (type: RelationshipType) => {
    switch (type) {
      case 'parent':
        return 'Padre/Madre';
      case 'teacher':
        return 'Docente';
      case 'specialist':
        return 'Especialista';
      case 'observer':
        return 'Observador';
      case 'family':
        return 'Familia';
      default:
        return type;
    }
  };

  return (
    <Card className="group hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={child.avatar_url || undefined} />
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {child.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{child.name}</h3>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className={getRelationshipColor(child.relationship_type)}>
                  {getRelationshipLabel(child.relationship_type)}
                </Badge>
                {child.can_edit && (
                  <Badge variant="outline" className="text-xs">
                    Editor
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVerticalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onViewDetails(child)}>
                <EyeIcon className="mr-2 h-4 w-4" />
                Ver detalles
              </DropdownMenuItem>
              {child.can_edit && (
                <DropdownMenuItem onClick={() => onEdit(child)}>
                  <EditIcon className="mr-2 h-4 w-4" />
                  Editar
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

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          {child.birth_date && (
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">{calculateAge(child.birth_date)} años</span>
            </div>
          )}

          {child.diagnosis && (
            <div className="flex items-center space-x-2">
              <HeartIcon className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 truncate" title={child.diagnosis}>
                {child.diagnosis}
              </span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-2 border-t">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900">Registros</p>
            <p className="text-xs text-gray-500">Este mes</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900">Última actividad</p>
            <p className="text-xs text-gray-500">
              {child.updated_at ? format(new Date(child.updated_at), 'dd MMM', { locale: es }) : 'N/A'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface FiltersCardProps {
  filters: ChildFilters;
  onFiltersChange: (filters: ChildFilters) => void;
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
          <div className="space-y-2">
            <label htmlFor="search-name" className="text-sm font-medium">
              Buscar por nombre
            </label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search-name"
                placeholder="Nombre del niño..."
                value={filters.search || ''}
                onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="relationship-type" className="text-sm font-medium">
              Tipo de relación
            </label>
            <Select
              value={filters.relationship_type || 'all'}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  relationship_type: value === 'all' ? undefined : (value as RelationshipType),
                })
              }
            >
              <SelectTrigger id="relationship-type">
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
          </div>

          <div className="space-y-2">
            <label htmlFor="max-age" className="text-sm font-medium">
              Edad máxima
            </label>
            <Input
              id="max-age"
              type="number"
              placeholder="Años"
              min="0"
              max="25"
              value={filters.max_age || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  max_age: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Renderiza el header y estadísticas
function HeaderStats({ children, stats }: { children: React.ReactNode; stats: any }) {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Niños</h1>
          <p className="text-gray-600">Gestiona y visualiza el progreso de los niños bajo tu cuidado</p>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">{children}</div>
    </>
  );
}

// Renderiza lista/grid
function ChildrenList({ viewMode, filteredChildren, handleEdit, handleViewDetails, handleManageUsers }: any) {
  return (
    <>
      {/* View Mode Toggle */}
      <div className="flex justify-end">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Vista:</span>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleManageUsers('grid')}
          >
            Tarjetas
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleManageUsers('list')}
          >
            Lista
          </Button>
        </div>
      </div>
      {/* Children Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChildren.map((child: ChildWithRelation) => (
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

// ================================================================
// COMPONENTE PRINCIPAL
// ================================================================
export default function ChildrenPage() {
  const { user } = useAuth();
  const { children, loading, error, filterChildren } = useChildren({
    includeInactive: false,
    realtime: true,
  });

  const [filters, setFilters] = useState<ChildFilters>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Aplicar filtros
  const filteredChildren = useMemo(() => filterChildren(filters), [children, filters, filterChildren]);

  // Handlers
  const handleEdit = (child: ChildWithRelation) => {
    window.location.href = `/dashboard/children/${child.id}/edit`;
  };

  const handleViewDetails = (child: ChildWithRelation) => {
    window.location.href = `/dashboard/children/${child.id}`;
  };

  const handleManageUsers = (child: ChildWithRelation | 'grid' | 'list') => {
    if (typeof child === 'string') {
      setViewMode(child);
    } else {
      window.location.href = `/dashboard/children/${child.id}/users`;
    }
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

  // Estadísticas para mostrar
  const stats = [
    {
      icon: <UsersIcon className="h-8 w-8 text-blue-600" />,
      label: 'Total Niños',
      value: children.length,
    },
    {
      icon: <BookOpenIcon className="h-8 w-8 text-green-600" />,
      label: 'Activos',
      value: children.filter((c) => c.is_active).length,
    },
    {
      icon: <EditIcon className="h-8 w-8 text-purple-600" />,
      label: 'Editables',
      value: children.filter((c) => c.can_edit).length,
    },
    {
      icon: <TrendingUpIcon className="h-8 w-8 text-orange-600" />,
      label: 'Con Diagnóstico',
      value: children.filter((c) => c.diagnosis).length,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header y estadísticas */}
      <HeaderStats stats={stats}>
        {stats.map((stat, idx) => (
          <Card key={idx}>
            <CardContent className="p-6">
              <div className="flex items-center">
                {stat.icon}
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </HeaderStats>

      {/* Filtros */}
      <FiltersCard filters={filters} onFiltersChange={setFilters} />

      {/* Render según estado */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Card key={`skeleton-child-${idx}`} className="animate-pulse">
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
      ) : error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="text-center py-12">
            <p className="text-red-600 mb-4">Error al cargar los niños: {error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCwIcon className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      ) : filteredChildren.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <UsersIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            {children.length === 0 ? (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay niños registrados</h3>
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron niños</h3>
                <p className="text-gray-600 mb-6">
                  No hay niños que coincidan con los filtros seleccionados
                </p>
                <Button variant="outline" onClick={() => setFilters({})}>
                  Limpiar Filtros
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <ChildrenList
          viewMode={viewMode}
          filteredChildren={filteredChildren}
          handleEdit={handleEdit}
          handleViewDetails={handleViewDetails}
          handleManageUsers={handleManageUsers}
        />
      )}
    </div>
  );
}
