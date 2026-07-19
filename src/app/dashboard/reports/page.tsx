// ================================================================
// src/app/dashboard/reports/page.tsx
// Página principal de reportes y análisis - REFACTORIZADA Y LIMPIA
// ================================================================

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { useChildren } from '@/hooks/use-children';
import { useLogs } from '@/hooks/use-logs';
import { ProgressChart } from '@/components/reports/ProgressChart';
import { CategoryDistribution } from '@/components/reports/CategoryDistribution';
import { MoodTrendChart } from '@/components/reports/MoodTrendChart';
import { ExportReportDialog } from '@/components/reports/ExportReportDialog';
import { TimePatterns, CorrelationAnalysis, AdvancedInsights } from '@/components/reports/TimePatterns';
import type { DateRange } from 'react-day-picker';
import { 
  TrendingUp,
  Calendar,
  Download,
  FileText,
  PieChart,
  Heart,
  Target,
  AlertTriangle
} from 'lucide-react';
import { subMonths } from 'date-fns';

// ================================================================
// HELPERS
// ================================================================
function calculateImprovementTrend(logs: any[]): number {
  if (logs.length < 2) return 0;
  const moodLogs = logs.filter(log => log.mood_score).sort((a, b) =>
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  if (moodLogs.length < 2) return 0;
  const midpoint = Math.floor(moodLogs.length / 2);
  const firstHalf = moodLogs.slice(0, midpoint);
  const secondHalf = moodLogs.slice(midpoint);
  const firstAvg = firstHalf.reduce((sum, log) => sum + log.mood_score, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, log) => sum + log.mood_score, 0) / secondHalf.length;
  return secondAvg - firstAvg;
}

function filterLogs(logs: any[], selectedChild: string, dateRange: DateRange | undefined) {
  return logs.filter(log => {
    if (selectedChild !== 'all' && log.child_id !== selectedChild) return false;
    if (dateRange?.from && new Date(log.created_at) < dateRange.from) return false;
    if (dateRange?.to && new Date(log.created_at) > dateRange.to) return false;
    return true;
  });
}

function calculateMetrics(filteredLogs: any[]) {
  const averageMoodLogs = filteredLogs.filter(l => l.mood_score);
  const averageMood = averageMoodLogs.length
    ? (averageMoodLogs.reduce((sum, l) => sum + l.mood_score, 0) / averageMoodLogs.length)
    : 0;
  return {
    totalLogs: filteredLogs.length,
    averageMood,
    improvementTrend: calculateImprovementTrend(filteredLogs),
    activeCategories: new Set(filteredLogs.map(l => l.category_name).filter(Boolean)).size,
    followUpsRequired: filteredLogs.filter(l => l.follow_up_required).length,
    activeDays: new Set(filteredLogs.map(l => new Date(l.created_at).toDateString())).size
  };
}

// ================================================================
// COMPONENTE PRINCIPAL
// ================================================================
export default function ReportsPage() {
  const { children, loading: childrenLoading } = useChildren();
  const { logs, loading: logsLoading } = useLogs();

  const [selectedChild, setSelectedChild] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 3),
    to: new Date()
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  // Helpers refactorizados
  const filteredLogs = filterLogs(logs, selectedChild, dateRange);
  const metrics = calculateMetrics(filteredLogs);

  // --- Tendencia (Evita ternarios anidados) ---
  // Icono
  let trendIcon;
  if (metrics.improvementTrend > 0) {
    trendIcon = TrendingUp;
  } else if (metrics.improvementTrend < 0) {
    trendIcon = TrendingUp; // Puedes cambiarlo a otro icono si prefieres diferenciar "baja"
  } else {
    trendIcon = Target;
  }

  // Color
  let trendColor: 'green' | 'red' | 'gray';
  if (metrics.improvementTrend > 0) {
    trendColor = 'green';
  } else if (metrics.improvementTrend < 0) {
    trendColor = 'red';
  } else {
    trendColor = 'gray';
  }

  // Subtítulo
  let trendSubtitle: string;
  if (metrics.improvementTrend > 0) {
    trendSubtitle = 'Mejorando';
  } else if (metrics.improvementTrend < 0) {
    trendSubtitle = 'Necesita atención';
  } else {
    trendSubtitle = 'Estable';
  }

  if (childrenLoading || logsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes y Análisis</h1>
          <p className="mt-2 text-gray-600">
            Análisis detallado del progreso y patrones de comportamiento
          </p>
        </div>
        <Button onClick={() => setIsExportDialogOpen(true)}>
          <Download className="h-4 w-4 mr-2" />
          Exportar Reporte
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="child-select" className="text-sm font-medium mb-2 block">
                Niño
              </label>
              <Select value={selectedChild} onValueChange={setSelectedChild}>
                <SelectTrigger id="child-select">
                  <SelectValue placeholder="Seleccionar niño" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los niños</SelectItem>
                  {children.map(child => (
                    <SelectItem key={child.id} value={child.id}>
                      {child.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="period-picker" className="text-sm font-medium mb-2 block">
                Período
              </label>
              {/* El DatePickerWithRange NO acepta id directamente, pero mantenemos accesibilidad con el label */}
              <DatePickerWithRange
                date={dateRange}
                setDate={setDateRange}
                // id="period-picker" // No soportado, pero el label es solo visual
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedChild('all');
                  setDateRange({
                    from: subMonths(new Date(), 3),
                    to: new Date()
                  });
                }}
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          title="Total Registros"
          value={metrics.totalLogs}
          icon={FileText}
          color="blue"
          subtitle="En el período seleccionado"
        />

        {/*
          Extraemos la lógica del color a una variable para evitar ternarios anidados
        */}
        {(() => {
          let moodColor: 'green' | 'orange' | 'red';
          if (metrics.averageMood >= 4) {
            moodColor = 'green';
          } else if (metrics.averageMood >= 3) {
            moodColor = 'orange';
          } else {
            moodColor = 'red';
          }
          return (
            <MetricCard
              title="Estado de Ánimo"
              value={metrics.averageMood.toFixed(1)}
              suffix="/5"
              icon={Heart}
              color={moodColor}
              subtitle="Promedio del período"
            />
          );
        })()}

        <MetricCard
          title="Tendencia"
          value={metrics.improvementTrend > 0 ? `+${metrics.improvementTrend.toFixed(2)}` : metrics.improvementTrend.toFixed(2)}
          icon={trendIcon}
          color={trendColor}
          subtitle={trendSubtitle}
        />

        <MetricCard
          title="Categorías"
          value={metrics.activeCategories}
          icon={PieChart}
          color="purple"
          subtitle="Diferentes áreas"
        />

        <MetricCard
          title="Seguimientos"
          value={metrics.followUpsRequired}
          icon={AlertTriangle}
          color={metrics.followUpsRequired > 0 ? 'orange' : 'green'}
          subtitle="Pendientes"
        />

        <MetricCard
          title="Días Activos"
          value={metrics.activeDays}
          icon={Calendar}
          color="blue"
          subtitle="Con registros"
        />
      </div>

      {/* Tabs de análisis */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="trends">Tendencias</TabsTrigger>
          <TabsTrigger value="patterns">Patrones</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Tab: Resumen */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Progreso General</CardTitle>
                <CardDescription>
                  Evolución del estado de ánimo en el tiempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProgressChart data={filteredLogs} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución por Categorías</CardTitle>
                <CardDescription>
                  Frecuencia de registros por área
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CategoryDistribution data={filteredLogs} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Tendencias */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tendencias del Estado de Ánimo</CardTitle>
              <CardDescription>
                Análisis temporal del bienestar emocional
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MoodTrendChart data={filteredLogs} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Patrones */}
        <TabsContent value="patterns" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Patrones Temporales</CardTitle>
                <CardDescription>
                  Identificación de comportamientos recurrentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TimePatterns logs={filteredLogs} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Correlaciones</CardTitle>
                <CardDescription>
                  Relaciones entre diferentes variables
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CorrelationAnalysis logs={filteredLogs} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Insights */}
        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análisis Avanzado</CardTitle>
              <CardDescription>
                Insights generados por inteligencia artificial
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdvancedInsights logs={filteredLogs} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Export Dialog */}
      <ExportReportDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        data={filteredLogs}
        metrics={metrics}
      />
    </div>
  );
}

// ================================================================
// COMPONENTE AUXILIAR
// ================================================================

interface MetricCardProps {
  readonly title: string;
  readonly value: string | number;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly color: 'blue' | 'red' | 'purple' | 'green' | 'orange' | 'gray';
  readonly subtitle: string;
  readonly suffix?: string;
}

function MetricCard({ title, value, icon: Icon, color, subtitle, suffix }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    gray: 'bg-gray-100 text-gray-600'
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <div className="flex items-center space-x-1">
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {suffix && <span className="text-lg text-gray-500">{suffix}</span>}
            </div>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
