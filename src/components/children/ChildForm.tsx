// src/components/reports/TimePatterns.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Brain,
  Target,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

// Tipos e interfaces
interface Log {
  created_at: string;
  mood_score?: number;
  intensity_level?: 'low' | 'medium' | 'high';
  category_name?: string;
}

interface TimePatternsProps {
  logs: Log[];
}

interface CorrelationAnalysisProps {
  logs: Log[];
}

interface AdvancedInsightsProps {
  logs: Log[];
}

interface Insight {
  type: 'success' | 'warning' | 'info';
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  recommendation: string;
}

// Constantes
const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const TOTAL_DAYS_ANALYSIS = 30;
const STRONG_CORRELATION_THRESHOLD = 0.5;
const MODERATE_CORRELATION_THRESHOLD = 0.3;
const MOOD_TREND_THRESHOLD = 0.5;

// Componente TimePatterns
export function TimePatterns({ logs }: TimePatternsProps) {
  const hourlyPattern = React.useMemo(() =>
    logs.reduce((acc, log) => {
      const hour = new Date(log.created_at).getHours();
      acc[hour] = (acc[hour] ?? 0) + 1;
      return acc;
    }, {} as Record<number, number>),
    [logs]
  );

  const weeklyPattern = React.useMemo(() =>
    logs.reduce((acc, log) => {
      const day = new Date(log.created_at).getDay();
      acc[day] = (acc[day] ?? 0) + 1;
      return acc;
    }, {} as Record<number, number>),
    [logs]
  );

  const getMostActiveHour = React.useCallback(() => {
    const values = Object.values(hourlyPattern);
    if (values.length === 0) return 'N/A';

    const max = Math.max(...values);
    const hour = Object.keys(hourlyPattern).find(h => hourlyPattern[parseInt(h)] === max);
    return hour ? `${hour}:00` : 'N/A';
  }, [hourlyPattern]);

  const getMostActiveDay = React.useCallback(() => {
    const values = Object.values(weeklyPattern);
    if (values.length === 0) return 'N/A';

    const max = Math.max(...values);
    const day = Object.keys(weeklyPattern).find(d => weeklyPattern[parseInt(d)] === max);
    return day ? DAY_NAMES[parseInt(day)] : 'N/A';
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
            <p className="text-2xl font-bold">{getMostActiveHour()}</p>
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
            <p className="text-2xl font-bold">{getMostActiveDay()}</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-2">Distribución por días de la semana</h4>
        <div className="flex space-x-1">
          {DAY_NAMES.map((day, index) => {
            const count = weeklyPattern[index] ?? 0;
            const values = Object.values(weeklyPattern);
            const maxCount = values.length > 0 ? Math.max(...values) : 0;
            const intensity = maxCount > 0 ? (count / maxCount) * 100 : 0;

            return (
              <div key={`day-${day}`} className="flex-1 text-center">
                <div
                  className="w-full h-8 bg-blue-100 rounded mb-1 flex items-end justify-center"
                  style={{ backgroundColor: `rgba(59, 130, 246, ${intensity / 100})` }}
                  aria-label={`${count} registros el ${day}`}
                >
                  {count > 0 && (
                    <span className="text-xs text-white font-medium">
                      {count}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-600">{day}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Componente CorrelationAnalysis
export function CorrelationAnalysis({ logs }: CorrelationAnalysisProps) {
  const calculateCorrelation = React.useCallback(
    (data: Log[], field1: keyof Log, field2Func: (item: Log) => number): number => {
      if (data.length < 2) return 0;

      const x = data.map(item => Number(item[field1]));
      const y = data.map(field2Func);

      const meanX = x.reduce((a, b) => a + b, 0) / x.length;
      const meanY = y.reduce((a, b) => a + b, 0) / y.length;

      const numerator = x.reduce((sum, xi, i) => sum + (xi - meanX) * (y[i] - meanY), 0);
      const denomX = Math.sqrt(x.reduce((sum, xi) => sum + Math.pow(xi - meanX, 2), 0));
      const denomY = Math.sqrt(y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0));

      return denomX * denomY === 0 ? 0 : numerator / (denomX * denomY);
    },
    []
  );

  const moodIntensityCorr = React.useMemo(
    () => calculateCorrelation(
      logs.filter(l => l.mood_score !== undefined && l.intensity_level),
      'mood_score',
      log => log.intensity_level === 'low' ? 1 : log.intensity_level === 'medium' ? 2 : 3
    ),
    [logs, calculateCorrelation]
  );

  const categoryMoodCorr = React.useMemo(
    () => logs.reduce((acc, log) => {
      if (log.mood_score === undefined || !log.category_name) return acc;

      if (!acc[log.category_name]) {
        acc[log.category_name] = { total: 0, count: 0 };
      }

      acc[log.category_name].total += log.mood_score;
      acc[log.category_name].count += 1;

      return acc;
    }, {} as Record<string, { total: number; count: number }>),
    [logs]
  );

  const categoryAverages = React.useMemo(
    () => Object.entries(categoryMoodCorr)
      .map(([category, data]) => ({
        category,
        avgMood: data.total / data.count,
        count: data.count
      }))
      .sort((a, b) => b.avgMood - a.avgMood),
    [categoryMoodCorr]
  );

  const getCorrelationIcon = React.useCallback((correlation: number) => {
    if (correlation > MODERATE_CORRELATION_THRESHOLD) return TrendingUp;
    if (correlation < -MODERATE_CORRELATION_THRESHOLD) return TrendingDown;
    return Minus;
  }, []);

  const getCorrelationColor = React.useCallback((correlation: number) => {
    if (correlation > MODERATE_CORRELATION_THRESHOLD) return 'text-green-600';
    if (correlation < -MODERATE_CORRELATION_THRESHOLD) return 'text-red-600';
    return 'text-gray-600';
  }, []);

  const getCorrelationText = React.useCallback((correlation: number) => {
    if (correlation > STRONG_CORRELATION_THRESHOLD) return 'Fuerte positiva';
    if (correlation > MODERATE_CORRELATION_THRESHOLD) return 'Moderada positiva';
    if (correlation < -STRONG_CORRELATION_THRESHOLD) return 'Fuerte negativa';
    if (correlation < -MODERATE_CORRELATION_THRESHOLD) return 'Moderada negativa';
    return 'Débil o nula';
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Estado de Ánimo vs Intensidad</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {React.createElement(getCorrelationIcon(moodIntensityCorr), {
                className: `h-5 w-5 ${getCorrelationColor(moodIntensityCorr)}`,
                'aria-label': getCorrelationText(moodIntensityCorr)
              })}
              <span className="text-sm font-medium">
                {getCorrelationText(moodIntensityCorr)}
              </span>
            </div>
            <Badge variant="outline" aria-label={`Coeficiente de correlación: ${moodIntensityCorr.toFixed(2)}`}>
              r = {moodIntensityCorr.toFixed(2)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Promedio de Estado de Ánimo por Categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {categoryAverages.slice(0, 5).map(({ category, avgMood, count }) => (
              <div key={`category-${category}`} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{category}</span>
                    <span className="text-sm text-gray-500">({count} registros)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(avgMood / 5) * 100}%` }}
                      aria-hidden="true"
                    />
                  </div>
                </div>
                <Badge variant="secondary" className="ml-2" aria-label={`Promedio: ${avgMood.toFixed(1)} de 5`}>
                  {avgMood.toFixed(1)}/5
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente AdvancedInsights
export function AdvancedInsights({ logs }: AdvancedInsightsProps) {
  const insights = React.useMemo(() => {
    const generatedInsights: Insight[] = [];

    // Análisis de frecuencia
    if (logs.length > 0) {
      const daysWithLogs = new Set(logs.map(log =>
        new Date(log.created_at).toDateString()
      )).size;

      const frequency = (daysWithLogs / TOTAL_DAYS_ANALYSIS) * 100;

      generatedInsights.push({
        type: frequency > 80 ? 'success' : frequency > 50 ? 'warning' : 'info',
        icon: frequency > 80 ? CheckCircle : frequency > 50 ? Target : AlertTriangle,
        title: 'Consistencia en el registro',
        description: `Registros en ${daysWithLogs} de ${TOTAL_DAYS_ANALYSIS} días (${frequency.toFixed(0)}%)`,
        recommendation: frequency < 50
          ? 'Intenta mantener registros más regulares para obtener mejores insights'
          : frequency < 80
            ? 'Buen ritmo de registro, mantén la consistencia'
            : 'Excelente consistencia en los registros'
      });
    }

    // Análisis de estado de ánimo
    const moodLogs = logs.filter(log => log.mood_score !== undefined);
    if (moodLogs.length > 5) {
      const avgMood = moodLogs.reduce((sum, log) => sum + log.mood_score!, 0) / moodLogs.length;
      const recent = moodLogs.slice(0, 7);
      const recentAvg = recent.reduce((sum, log) => sum + log.mood_score!, 0) / recent.length;

      const trend = recentAvg - avgMood;

      generatedInsights.push({
        type: trend > MOOD_TREND_THRESHOLD ? 'success' : trend < -MOOD_TREND_THRESHOLD ? 'warning' : 'info',
        icon: Brain,
        title: 'Tendencia del estado de ánimo',
        description: `Promedio general: ${avgMood.toFixed(1)}/5, últimos 7 días: ${recentAvg.toFixed(1)}/5`,
        recommendation: trend > MOOD_TREND_THRESHOLD
          ? 'Tendencia positiva en el estado de ánimo reciente'
          : trend < -MOOD_TREND_THRESHOLD
            ? 'Considera revisar factores que puedan estar afectando el bienestar'
            : 'Estado de ánimo estable'
      });
    }

    // Análisis de categorías
    const categoryCount = logs.reduce((acc, log) => {
      if (log.category_name) {
        acc[log.category_name] = (acc[log.category_name] ?? 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const categories = Object.entries(categoryCount);
    if (categories.length > 0) {
      const mostUsedCategory = categories.sort(([, a], [, b]) => b - a)[0];

      generatedInsights.push({
        type: 'info',
        icon: Target,
        title: 'Área de mayor atención',
        description: `"${mostUsedCategory[0]}" representa ${((mostUsedCategory[1] / logs.length) * 100).toFixed(0)}% de los registros`,
        recommendation: 'Esta categoría requiere mayor atención y seguimiento'
      });
    }

    return generatedInsights;
  }, [logs]);

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
      {insights.map((insight, index) => {
        const badgeText = insight.type === 'success' ? 'Positivo' :
          insight.type === 'warning' ? 'Atención' : 'Info';

        return (
          <Card
            key={`insight-${index}`}
            className="border-l-4 border-l-blue-500"
            aria-label={`Insight: ${insight.title}`}
          >
            <CardContent className="pt-4">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${insight.type === 'success' ? 'bg-green-100' :
                    insight.type === 'warning' ? 'bg-yellow-100' :
                      'bg-blue-100'
                  }`}>
                  {React.createElement(insight.icon, {
                    className: `h-5 w-5 ${insight.type === 'success' ? 'text-green-600' :
                        insight.type === 'warning' ? 'text-yellow-600' :
                          'text-blue-600'
                      }`,
                    'aria-hidden': true
                  })}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{insight.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                  <p className="text-sm text-gray-500 mt-2 italic">{insight.recommendation}</p>
                </div>
                <Badge
                  variant={
                    insight.type === 'success' ? 'default' :
                      insight.type === 'warning' ? 'destructive' :
                        'secondary'
                  }
                  aria-label={`Estado: ${badgeText}`}
                >
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