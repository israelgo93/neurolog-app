'use client';

import { useState, useMemo } from 'react';
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
// CONSTANTES CENTRALIZADAS
// ================================================================

const RELATIONSHIP_COLORS: Record<RelationshipType, string> = {
  parent: 'bg-blue-100 text-blue-800',
  teacher: 'bg-green-100 text-green-800',
  specialist: 'bg-purple-100 text-purple-800',
  observer: 'bg-gray-100 text-gray-800',
  family: 'bg-orange-100 text-orange-800'
};

const RELATIONSHIP_LABELS: Record<RelationshipType, string> = {
  parent: 'Padre/Madre',
  teacher: 'Docente',
  specialist: 'Especialista',
  observer: 'Observador',
  family: 'Familia'
};

// ================================================================
// FUNCIONES AUXILIARES
// ================================================================

const calculateAge = (birthDate: string): number => {
  const birth = new Date(birthDate);
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return age - 1;
  }
  return age;
};

const getRelationshipColor = (type: RelationshipType): string => {
  return RELATIONSHIP_COLORS[type] ?? RELATIONSHIP_COLORS.observer;
};

const getRelationshipLabel = (type: RelationshipType): string => {
  return RELATIONSHIP_LABELS[type] ?? type;
};

// ================================================================
// INTERFACES
// ================================================================

interface ChildCardProps {
  child: ChildWithRelation;
  onEdit: (child: ChildWithRelation) => void;
  onViewDetails: (child: ChildWithRelation) => void;
  onManageUsers: (child: ChildWithRelation) => void;
}

interface FiltersCardProps {
  filters: ChildFilters;
  onFiltersChange: (filters: ChildFilters) => void;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description?: string;
  iconColor?: string;
}

// ================================================================
// COMPONENTES
// ================================================================

function ChildCard({ child, onEdit, onViewDetails, onManageUsers }: ChildCardProps): JSX.Element {
  return (
    <article 
      className="group hover:shadow-md transition-all duration-200"
      aria-labelledby={`child-card-title-${child.id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage 
                src={child.avatar_url || undefined} 
                alt={`Foto de perfil de ${child.name}`}
              />
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {child.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 
                id={`child-card-title-${child.id}`}
                className="font-semibold text-lg"
              >
                {child.name}
              </h3>
              <div className="flex items-center space-x-2">
                <Badge 
                  variant="secondary" 
                  className={getRelationshipColor(child.relationship_type)}
                >
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
              <Button 
                variant="ghost" 
                size="sm"
                aria-label={`Acciones para ${child.name}`}
              >
                <MoreVerticalIcon className="h-4 w-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones disponibles</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onViewDetails(child)}>
                <EyeIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                Ver detalles
              </DropdownMenuItem>
              {child.can_edit && (
                <DropdownMenuItem onClick={() => onEdit(child)}>
                  <EditIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                  Editar
                </DropdownMenuItem>
              )}
              {child.can_invite_others && (
                <DropdownMenuItem onClick={() => onManageUsers(child)}>
                  <UserPlusIcon className="mr-2 h-4 w-4" aria-hidden="true" />
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
              <CalendarIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
              <span className="text-gray-600">
                {calculateAge(child.birth_date)} años
              </span>
            </div>
          )}
          
          {child.diagnosis && (
            <div className="flex items-center space-x-2">
              <HeartIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
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
    </article>
  );
}

function FiltersCard({ filters, onFiltersChange }: FiltersCardProps): JSX.Element {
  return (
    <section aria-labelledby="filters-title">
      <Card>
        <CardHeader>
          <CardTitle id="filters-title" className="flex items-center text-base">
            <FilterIcon className="h-4 w-4 mr-2" aria-hidden="true" />
            Filtros de búsqueda
          </CardTitle>
          <CardDescription>
            Utiliza estos filtros para encontrar niños específicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label 
                htmlFor="search-name-input" 
                className="text-sm font-medium block"
              >
                Buscar por nombre
              </label>
              <div className="relative">
                <SearchIcon 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" 
                  aria-hidden="true"
                />
                <Input
                  id="search-name-input"
                  type="text"
                  placeholder="Nombre del niño..."
                  value={filters.search || ''}
                  onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
                  className="pl-10"
                  aria-label="Buscar niños por nombre"
                  aria-describedby="search-help"
                />
              </div>
              <p id="search-help" className="text-xs text-gray-500">
                Busca por nombre completo o parcial
              </p>
            </div>

            <div className="space-y-2">
              <label 
                htmlFor="relationship-type-select" 
                className="text-sm font-medium block"
              >
                Tipo de relación
              </label>
              <Select 
                value={filters.relationship_type || 'all'} 
                onValueChange={(value) => onFiltersChange({ 
                  ...filters, 
                  relationship_type: value === 'all' ? undefined : value as RelationshipType 
                })}
              >
                <SelectTrigger 
                  id="relationship-type-select"
                  aria-label="Seleccionar tipo de relación"
                  aria-describedby="relationship-help"
                >
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
              <p id="relationship-help" className="text-xs text-gray-500">
                Filtra según tu relación con el niño
              </p>
            </div>

            <div className="space-y-2">
              <label 
                htmlFor="max-age-input" 
                className="text-sm font-medium block"
              >
                Edad máxima
              </label>
              <Input
                id="max-age-input"
                type="number"
                placeholder="Años"
                min="0"
                max="25"
                value={filters.max_age || ''}
                onChange={(e) => onFiltersChange({ 
                  ...filters, 
                  max_age: e.target.value ? parseInt(e.target.value) : undefined 
                })}
                aria-label="Filtrar por edad máxima en años"
                aria-describedby="age-help"
              />
              <p id="age-help" className="text-xs text-gray-500">
                Muestra niños de esta edad o menores
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function StatCard(props: Readonly<StatCardProps>): JSX.Element {
  const { title, value, icon, description, iconColor = 'text-blue-600' } = props;
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className={`h-8 w-8 ${iconColor}`} aria-hidden="true">
            {icon}
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold" aria-label={`${title}: ${value}`}>
              {value}
            </p>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ================================================================
// COMPONENTE PRINCIPAL
// ================================================================

export default function ChildrenPage(): JSX.Element {
  const { user } = useAuth();
  const { children, loading, error, filterChildren } = useChildren({ 
    includeInactive: false,
    realtime: true 
  });
  
  const [filters, setFilters] = useState<ChildFilters>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredChildren = useMemo(() => {
    return filterChildren(filters);
  }, [children, filters, filterChildren]);

  const statistics = useMemo(() => {
    return {
      total: children.length,
      active: children.filter(child => child.is_active).length,
      editable: children.filter(child => child.can_edit).length,
      withDiagnosis: children.filter(child => child.diagnosis).length
    };
  }, [children]);

  const handleEdit = (child: ChildWithRelation): void => {
    window.location.href = `/dashboard/children/${child.id}/edit`;
  };

  const handleViewDetails = (child: ChildWithRelation): void => {
    window.location.href = `/dashboard/children/${child.id}`;
  };

  const handleManageUsers = (child: ChildWithRelation): void => {
    window.location.href = `/dashboard/children/${child.id}/users`;
  };

  const handleRefresh = (): void => {
    window.location.reload();
  };

  const clearFilters = (): void => {
    setFilters({});
  };

  if (!user) {
    return (
      <output
        className="flex items-center justify-center min-h-[400px]"
        aria-label="Cargando información del usuario"
      >
        <div className="text-center">
          <UsersIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" aria-hidden="true" />
          <p className="text-gray-500">Cargando...</p>
        </div>
      </output>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Niños</h1>
          <p className="text-gray-600">
            Gestiona y visualiza el progreso de los niños bajo tu cuidado
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            aria-label="Actualizar lista de niños"
          >
            <RefreshCwIcon className="h-4 w-4 mr-2" aria-hidden="true" />
            Actualizar
          </Button>
          
          <Button asChild>
            <Link href="/dashboard/children/new">
              <PlusIcon className="h-4 w-4 mr-2" aria-hidden="true" />
              Crear Niño
            </Link>
          </Button>
        </div>
      </header>

      <section aria-labelledby="statistics-section">
        <h2 id="statistics-section" className="sr-only">Estadísticas generales</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Niños"
            value={statistics.total}
            icon={<UsersIcon className="h-8 w-8" />}
            iconColor="text-blue-600"
            description="Niños registrados"
          />
          
          <StatCard
            title="Activos"
            value={statistics.active}
            icon={<BookOpenIcon className="h-8 w-8" />}
            iconColor="text-green-600"
            description="Perfiles activos"
          />

          <StatCard
            title="Editables"
            value={statistics.editable}
            icon={<EditIcon className="h-8 w-8" />}
            iconColor="text-purple-600"
            description="Con permisos de edición"
          />

          <StatCard
            title="Con Diagnóstico"
            value={statistics.withDiagnosis}
            icon={<TrendingUpIcon className="h-8 w-8" />}
            iconColor="text-orange-600"
            description="Información médica disponible"
          />
        </div>
      </section>

      <FiltersCard filters={filters} onFiltersChange={setFilters} />

      <main>
        {loading ? (
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            aria-label="Cargando lista de niños"
          >
            {Array.from({ length: 6 }, (_, index) => (
              <Card key={index} className="animate-pulse">
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
          <Card className="border-red-200 bg-red-50" role="alert">
            <CardContent className="text-center py-12">
              <p className="text-red-600 mb-4">Error al cargar los niños: {error}</p>
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                aria-label="Reintentar carga de datos"
              >
                <RefreshCwIcon className="h-4 w-4 mr-2" aria-hidden="true" />
                Reintentar
              </Button>
            </CardContent>
          </Card>
        ) : filteredChildren.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <UsersIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" aria-hidden="true" />
              {children.length === 0 ? (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hay niños registrados
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Comienza agregando el primer niño para empezar el seguimiento
                  </p>
                  <Button asChild>
                    <Link href="/dashboard/children/new">
                      <PlusIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                      Agregar Primer Niño
                    </Link>
                  </Button>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No se encontraron niños
                  </h3>
                  <p className="text-gray-600 mb-6">
                    No hay niños que coincidan con los filtros seleccionados
                  </p>
                  <Button 
                    variant="outline"
                    onClick={clearFilters}
                    aria-label="Limpiar todos los filtros aplicados"
                  >
                    Limpiar Filtros
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-gray-600" aria-live="polite">
                Mostrando {filteredChildren.length} de {children.length} niños
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Vista:</span>
                <fieldset className="inline-flex space-x-2">
                  <legend className="sr-only">Opciones de vista</legend>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    aria-label="Cambiar a vista de tarjetas"
                    aria-pressed={viewMode === 'grid'}
                  >
                    Tarjetas
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    aria-label="Cambiar a vista de lista"
                    aria-pressed={viewMode === 'list'}
                  >
                    Lista
                  </Button>
                </fieldset>
              </div>
            </div>

            <section aria-labelledby="children-grid">
              <h2 id="children-grid" className="sr-only">Lista de niños</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            </section>
          </div>
        )}
      </main>
    </div>
  );
}