// ================================================================
// src/components/reports/TimePatterns.tsx
// Refactor SonarQube: keys, ??, readonly props
// ================================================================

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Clock, Calendar, TrendingUp, TrendingDown, Minus,
  Brain, Target, AlertTriangle, CheckCircle
} from 'lucide-react';

interface TimePatternsProps {
  logs: any[];
}

interface CorrelationAnalysisProps {
  logs: any[];
}

interface AdvancedInsightsProps {
  logs: any[];
}

const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function getHourlyPattern(logs: any[]) {
  return logs.reduce((acc, log) => {
    const hour = new Date(log.created_at).getHours();
    acc[hour] = (acc[hour] ?? 0) + 1; // Usar nullish coalescing
    return acc;
  }, {} as Record<number, number>);
}

function getWeeklyPattern(logs: any[]) {
  return logs.reduce((acc, log) => {
    const day = new Date(log.created_at).getDay();
    acc[day] = (acc[day] ?? 0) + 1; // Usar nullish coalescing
    return acc;
  }, {} as Record<number, number>);
}

function getMostActive(pattern: Record<number, number>, labels?: string[]) {
  const values = Object.values(pattern);
  if (values.length === 0) return 'N/A';
  const max = Math.max(...values);
  let key: string | undefined;
  for (const k of Object.keys(pattern)) {
    if (pattern[parseInt(k)] === max) {
      key = k;
      break;
    }
  }
  if (key === undefined) return 'N/A';
  if (labels) {
    const idx = parseInt(key, 10);
    return labels[idx] || 'N/A';
  }
  return `${key}:00`;
}

function calculateCorrelation(data: any[], field1: string, field2Func: (item: any) => number): number {
  if (data.length < 2) return 0;
  const x = data.map(item => item[field1]);
  const y = data.map(field2Func);
  const meanX = x.reduce((a, b) => a + b, 0) / x.length;
  const meanY = y.reduce((a, b) => a + b, 0) / y.length;
  let numerator = 0;
  let denomX = 0;
  let denomY = 0;
  for (let i = 0; i < x.length; i++) {
    numerator += (x[i] - meanX) * (y[i] - meanY);
    denomX += Math.pow(x[i] - meanX, 2);
    denomY += Math.pow(y[i] - meanY, 2);
  }
  const denominator = Math.sqrt(denomX) * Math.sqrt(denomY);
  return denominator === 0 ? 0 : numerator / denominator;
}

function getCorrelationIcon(correlation: number) {
  if (correlation > 0.3) return TrendingUp;
  if (correlation < -0.3) return TrendingDown;
  return Minus;
}

function getCorrelationColor(correlation: number) {
  if (correlation > 0.3) return 'text-green-600';
  if (correlation < -0.3) return 'text-red-600';
  return 'text-gray-600';
}

function getCorrelationText(correlation: number) {
  if (correlation > 0.5) return 'Fuerte positiva';
  if (correlation > 0.3) return 'Moderada positiva';
  if (correlation < -0.5) return 'Fuerte negativa';
  if (correlation < -0.3) return 'Moderada negativa';
  return 'Débil o nula';
}

function DayBars({ weeklyPattern }: { weeklyPattern: Record<number, number> }) {
  const values = Object.values(weeklyPattern);
  const maxCount = values.length > 0 ? Math.max(...values) : 0;

  return (
    <div className="flex space-x-1">
      {dayNames.map((day, index) => {
        const count = weeklyPattern[index] ?? 0; // Usar nullish coalescing
        const intensity = maxCount > 0 ? (count / maxCount) * 100 : 0;
        const bgColor = `rgba(59,130,246,${intensity / 100})`;
        const showCount = count > 0 ? count : '';
        return (
          <div key={day} className="flex-1 text-center">
            <div
              className="w-full h-8 bg-blue-100 rounded mb-1 flex items-end justify-center"
              style={{ backgroundColor: bgColor }}
            >
              <span className="text-xs text-white font-medium">{showCount}</span>
            </div>
            <span className="text-xs text-gray-600">{day}</span>
          </div>
        );
      })}
    </div>
  );
}

// ================================================================
// TIMEPATTERNS COMPONENT
// ================================================================

export function TimePatterns({ logs }: Readonly<TimePatternsProps>) {
  const hourlyPattern = React.useMemo(() => getHourlyPattern(logs), [logs]);
  const weeklyPattern = React.useMemo(() => getWeeklyPattern(logs), [logs]);

  const mostActiveHour = React.useMemo(() => {
    return getMostActive(hourlyPattern);
  }, [hourlyPattern]);
  const mostActiveDay = React.useMemo(() => {
    return getMostActive(weeklyPattern, dayNames);
  }, [weeklyPattern]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Hora más activa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{mostActiveHour}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Día más activo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{mostActiveDay}</p>
          </CardContent>
        </Card>
      </div>
      <div>
        <h4 className="text-sm font-medium mb-2">Distribución por días de la semana</h4>
        <DayBars weeklyPattern={weeklyPattern} />
      </div>
    </div>
  );
}

// ================================================================
// CORRELATION ANALYSIS COMPONENT
// ================================================================

export function CorrelationAnalysis({ logs }: Readonly<CorrelationAnalysisProps>) {
  const moodLogs = React.useMemo(() => logs.filter(l => l.mood_score && l.intensity_level), [logs]);
  const getIntensityLevel = (log: any) => {
    if (log.intensity_level === 'low') return 1;
    if (log.intensity_level === 'medium') return 2;
    return 3;
  };
  const moodIntensityCorr = React.useMemo(() => {
    return calculateCorrelation(moodLogs, 'mood_score', getIntensityLevel);
  }, [moodLogs]);

  const categoryMoodCorr = React.useMemo(() => {
    return logs.reduce((acc, log) => {
      if (!log.mood_score || !log.category_name) return acc;
      if (!acc[log.category_name]) acc[log.category_name] = { total: 0, count: 0 };
      acc[log.category_name].total += log.mood_score;
      acc[log.category_name].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);
  }, [logs]);

  const categoryAverages = React.useMemo(() => {
    const entries = Object.entries(categoryMoodCorr);
    const mapped = entries.map(([category, data]) => ({
      category,
      avgMood: data.total / data.count,
      count: data.count
    }));
    const sorted = [...mapped].sort((a, b) => b.avgMood - a.avgMood);
    return sorted;
  }, [categoryMoodCorr]);

  return (
    <div className="space-y-4">
      {/* Correlación Estado de Ánimo vs Intensidad */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Estado de Ánimo vs Intensidad</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {React.createElement(getCorrelationIcon(moodIntensityCorr), {
                className: `h-5 w-5 ${getCorrelationColor(moodIntensityCorr)}`
              })}
              <span className="text-sm font-medium">
                {getCorrelationText(moodIntensityCorr)}
              </span>
            </div>
            <Badge variant="outline">
              r = {moodIntensityCorr.toFixed(2)}
            </Badge>
          </div>
        </CardContent>
      </Card>
      {/* Promedios por categoría */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Promedio de Estado de Ánimo por Categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {categoryAverages.slice(0, 5).map(({ category, avgMood, count }) => {
              const widthPercent = (avgMood / 5) * 100;
              return (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{category}</span>
                      <span className="text-sm text-gray-500">({count} registros)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    {avgMood.toFixed(1)}/5
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ================================================================
// ADVANCED INSIGHTS COMPONENT
// ================================================================

function getFrequencyInsight(logs: any[]) {
  if (!logs.length) return null;
  const daysWithLogs = new Set(logs.map(log =>
    new Date(log.created_at).toDateString()
  )).size;
  const totalDays = 30;
  const frequency = (daysWithLogs / totalDays) * 100;

  let type = 'info';
  let icon = Target;
  let recommendation = 'Buen ritmo de registro, mantén la consistencia';
  if (frequency > 80) {
    type = 'success';
    icon = CheckCircle;
    recommendation = 'Excelente consistencia en los registros';
  } else if (frequency > 50) {
    type = 'warning';
    icon = Target;
    recommendation = 'Buen ritmo de registro, mantén la consistencia';
  } else {
    type = 'info';
    icon = AlertTriangle;
    recommendation = 'Intenta mantener registros más regulares para obtener mejores insights';
  }

  return {
    type,
    icon,
    title: 'Consistencia en el registro',
    description: `Registros en ${daysWithLogs} de ${totalDays} días (${frequency.toFixed(0)}%)`,
    recommendation
  };
}

function getMoodInsight(logs: any[]) {
  const moodLogs = logs.filter(log => log.mood_score);
  if (moodLogs.length <= 5) return null;
  const avgMood = moodLogs.reduce((sum, log) => sum + log.mood_score, 0) / moodLogs.length;
  const recent = moodLogs.slice(0, 7);
  const recentAvg = recent.reduce((sum, log) => sum + log.mood_score, 0) / recent.length;
  const trend = recentAvg - avgMood;

  let type = 'info';
  let recommendation = 'Estado de ánimo estable';
  if (trend > 0.5) {
    type = 'success';
    recommendation = 'Tendencia positiva en el estado de ánimo reciente';
  } else if (trend < -0.5) {
    type = 'warning';
    recommendation = 'Considera revisar factores que puedan estar afectando el bienestar';
  }

  return {
    type,
    icon: Brain,
    title: 'Tendencia del estado de ánimo',
    description: `Promedio general: ${avgMood.toFixed(1)}/5, últimos 7 días: ${recentAvg.toFixed(1)}/5`,
    recommendation
  };
}

function getCategoryInsight(logs: any[]) {
  const categoryCount = logs.reduce((acc, log) => {
    if (log.category_name) {
      acc[log.category_name] = (acc[log.category_name] ?? 0) + 1; // Usar nullish coalescing
    }
    return acc;
  }, {} as Record<string, number>);
  const categories = Object.entries(categoryCount);
  if (!categories.length) return null;
  const sortedCategories = [...categories].sort((a, b) => b[1] - a[1]);
  const mostUsedCategory = sortedCategories[0];
  return {
    type: 'info',
    icon: Target,
    title: 'Área de mayor atención',
    description: `"${mostUsedCategory[0]}" representa ${((mostUsedCategory[1] / logs.length) * 100).toFixed(0)}% de los registros`,
    recommendation: 'Esta categoría requiere mayor atención y seguimiento'
  };
}

export function AdvancedInsights({ logs }: Readonly<AdvancedInsightsProps>) {
  const insights = [
    getFrequencyInsight(logs),
    getMoodInsight(logs),
    getCategoryInsight(logs)
  ].filter(Boolean) as Array<ReturnType<typeof getFrequencyInsight>>;

  if (insights.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Brain className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <p className="text-lg font-medium">Generando insights...</p>
        <p className="text-sm">Necesitas más datos para análisis avanzado</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {insights.map((insight) => {
        let badgeVariant = 'secondary';
        let badgeText = 'Info';
        if (insight.type === 'success') {
          badgeVariant = 'default';
          badgeText = 'Positivo';
        } else if (insight.type === 'warning') {
          badgeVariant = 'destructive';
          badgeText = 'Atención';
        }
        let bgColor = 'bg-blue-100';
        let iconColor = 'text-blue-600';
        if (insight.type === 'success') {
          bgColor = 'bg-green-100';
          iconColor = 'text-green-600';
        } else if (insight.type === 'warning') {
          bgColor = 'bg-yellow-100';
          iconColor = 'text-yellow-600';
        }
        // USAR insight.title como key (garantiza unicidad y evita index)
        return (
          <Card key={insight.title} className="border-l-4 border-l-blue-500">
            <CardContent className="pt-4">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${bgColor}`}>
                  {React.createElement(insight.icon, { className: `h-5 w-5 ${iconColor}` })}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{insight.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                  <p className="text-sm text-gray-500 mt-2 italic">{insight.recommendation}</p>
                </div>
                <Badge variant={badgeVariant}>
                  {badgeText}
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
