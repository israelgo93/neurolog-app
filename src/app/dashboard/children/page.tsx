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

  return (
    <Card className="group hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={child.avatar_url ?? undefined} />
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {child.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{child.name}</h3>
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
        {/* Información básica */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {child.birth_date && (
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">
                {calculateAge(child.birth_date)} años
              </span>
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

        {/* Estadísticas rápidas */}
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
            <label htmlFor='search-input' className="text-sm font-medium">Buscar por nombre</label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search-input"
                type='text'
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
            <label htmlFor="max-age-input" className="text-sm font-medium">Edad máxima</label>
            <Input
              id="max-age-input"
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

  const handleManageUsers = (child: ChildWithRelation) => {
    window.location.href = `/dashboard/children/${child.id}/users`;
  };

  if (!user) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <HeaderSection />
      <StatsSection children={children} />
      <FiltersCard filters={filters} onFiltersChange={setFilters} />
      <ChildrenContent
        loading={loading}
        error={error}
        children={children}
        filteredChildren={filteredChildren}
        filters={filters}
        setFilters={setFilters}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onEdit={handleEdit}
        onViewDetails={handleViewDetails}
        onManageUsers={handleManageUsers}
      />
    </div>
  );
}

// ===================== Subcomponents =====================

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <UsersIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <p className="text-gray-500">Cargando...</p>
      </div>
    </div>
  );
}

function HeaderSection() {
  return (
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
  );
}

function StatsSection({ children }: { readonly children: ChildWithRelation[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        icon={<UsersIcon className="h-8 w-8 text-blue-600" />}
        label="Total Niños"
        value={children.length}
      />
      <StatCard
        icon={<BookOpenIcon className="h-8 w-8 text-green-600" />}
        label="Activos"
        value={children.filter((c) => c.is_active).length}
      />
      <StatCard
        icon={<EditIcon className="h-8 w-8 text-purple-600" />}
        label="Editables"
        value={children.filter((c) => c.can_edit).length}
      />
      <StatCard
        icon={<TrendingUpIcon className="h-8 w-8 text-orange-600" />}
        label="Con Diagnóstico"
        value={children.filter((c) => c.diagnosis).length}
      />
    </div>
  );
}

function StatCard({ icon, label, value }: Readonly<{ icon: React.ReactNode; label: string; value: number }>) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center">
          {icon}
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ChildrenContentProps {
  readonly loading: boolean;
  readonly error: string | null;
  readonly children: ChildWithRelation[];
  readonly filteredChildren: ChildWithRelation[];
  readonly filters: ChildFilters;
  readonly setFilters: React.Dispatch<React.SetStateAction<ChildFilters>>;
  readonly viewMode: 'grid' | 'list';
  readonly setViewMode: React.Dispatch<React.SetStateAction<'grid' | 'list'>>;
  readonly onEdit: (child: ChildWithRelation) => void;
  readonly onViewDetails: (child: ChildWithRelation) => void;
  readonly onManageUsers: (child: ChildWithRelation) => void;
}

function ChildrenContent({
  loading,
  error,
  children,
  filteredChildren,
  filters,
  setFilters,
  viewMode,
  setViewMode,
  onEdit,
  onViewDetails,
  onManageUsers,
}: ChildrenContentProps) {
  if (loading) return <ChildrenLoadingSkeleton />;
  if (error) return <ChildrenError error={error} />;
  if (filteredChildren.length === 0)
    return (
      <ChildrenEmpty
        hasChildren={children.length > 0}
        setFilters={setFilters}
      />
    );

  return (
    <>
      <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChildren.map((child) => (
          <ChildCard
            key={child.id}
            child={child}
            onEdit={onEdit}
            onViewDetails={onViewDetails}
            onManageUsers={onManageUsers}
          />
        ))}
      </div>
    </>
  );
}

const skeletonKeys = ['sk1', 'sk2', 'sk3', 'sk4', 'sk5', 'sk6'];

export function ChildrenLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {skeletonKeys.map(key => (
        <Card key={key} className="animate-pulse">
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


function ChildrenError({ error }: { readonly error: string }) {
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

function ChildrenEmpty({
  hasChildren,
  setFilters,
}: {
  readonly hasChildren: boolean;
  readonly setFilters: React.Dispatch<React.SetStateAction<ChildFilters>>;
}) {
  return (
    <Card>
      <CardContent className="text-center py-12">
        <UsersIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        {hasChildren ? (
          <>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron niños
            </h3>
            <p className="text-gray-600 mb-6">
              No hay niños que coincidan con los filtros seleccionados
            </p>
            <Button variant="outline" onClick={() => setFilters({})}>
              Limpiar Filtros
            </Button>
          </>
        ) : (
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
        )}
      </CardContent>
    </Card>
  );
}

function ViewModeToggle({
  viewMode,
  setViewMode,
}: {
  readonly viewMode: 'grid' | 'list';
  readonly setViewMode: React.Dispatch<React.SetStateAction<'grid' | 'list'>>;
}) {
  return (
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
  );
}