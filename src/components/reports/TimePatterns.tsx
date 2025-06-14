// ================================================================
// src/components/reports/TimePatterns.tsx
// ARREGLADO: Importar React y corregir todos los exports
// ================================================================

'use client';

import React from 'react'; 
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, TrendingUp, TrendingDown, Minus, Brain, Target, AlertTriangle, CheckCircle } from 'lucide-react';

interface TimePatternsProps {
  logs: any[];
}

interface CorrelationAnalysisProps {
  logs: any[];
}

interface AdvancedInsightsProps {
  logs: any[];
}

// ================================================================
// TIMEPATTERNS COMPONENT
// ================================================================

export function TimePatterns({ logs }: TimePatternsProps) {
  // Analizar patrones por hora del día
  const hourlyPattern = logs.reduce((acc, log) => {
    const hour = new Date(log.created_at).getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  // Analizar patrones por día de la semana
  const weeklyPattern = logs.reduce((acc, log) => {
    const day = new Date(log.created_at).getDay();
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const getMostActiveHour = () => {
    const values = Object.values(hourlyPattern);
    if (values.length === 0) return 'N/A';
    
    const max = Math.max(...values);
    const hour = Object.keys(hourlyPattern).find(h => hourlyPattern[parseInt(h)] === max);
    return hour ? `${hour}:00` : 'N/A';
  };

  const getMostActiveDay = () => {
    const values = Object.values(weeklyPattern);
    if (values.length === 0) return 'N/A';
    
    const max = Math.max(...values);
    const day = Object.keys(weeklyPattern).find(d => weeklyPattern[parseInt(d)] === max);
    return day ? dayNames[parseInt(day)] : 'N/A';
  };

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
          {dayNames.map((day, index) => {
            const count = weeklyPattern[index] || 0;
            const values = Object.values(weeklyPattern);
            const maxCount = values.length > 0 ? Math.max(...values) : 0;
            const intensity = maxCount > 0 ? (count / maxCount) * 100 : 0;
            
            return (
              <div key={day} className="flex-1 text-center">
                <div 
                  className="w-full h-8 bg-blue-100 rounded mb-1 flex items-end justify-center"
                  style={{ backgroundColor: `rgba(59, 130, 246, ${intensity / 100})` }}
                >
                  <span className="text-xs text-white font-medium">
                    {count > 0 ? count : ''}
                  </span>
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

// ================================================================
// CORRELATION ANALYSIS COMPONENT
// ================================================================

export function CorrelationAnalysis({ logs }: CorrelationAnalysisProps) {
  // Función helper para calcular correlación
  function calculateCorrelation(data: any[], field1: string, field2Func: (item: any) => number): number {
    if (data.length < 2) return 0;
    
    const x = data.map(item => item[field1]);
    const y = data.map(field2Func);
    
    const meanX = x.reduce((a, b) => a + b, 0) / x.length;
    const meanY = y.reduce((a, b) => a + b, 0) / y.length;
    
    const numerator = x.reduce((sum, xi, i) => sum + (xi - meanX) * (y[i] - meanY), 0);
    const denomX = Math.sqrt(x.reduce((sum, xi) => sum + Math.pow(xi - meanX, 2), 0));
    const denomY = Math.sqrt(y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0));
    
    return denomX * denomY === 0 ? 0 : numerator / (denomX * denomY);
  }

  // Calcular correlación entre estado de ánimo e intensidad
  const moodIntensityCorr = calculateCorrelation(
    logs.filter(l => l.mood_score && l.intensity_level),
    'mood_score',
    log => log.intensity_level === 'low' ? 1 : log.intensity_level === 'medium' ? 2 : 3
  );

  // Calcular correlación entre categorías y estado de ánimo
  const categoryMoodCorr = logs.reduce((acc, log) => {
    if (!log.mood_score || !log.category_name) return acc;
    
    if (!acc[log.category_name]) {
      acc[log.category_name] = { total: 0, count: 0 };
    }
    
    acc[log.category_name].total += log.mood_score;
    acc[log.category_name].count += 1;
    
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  const categoryAverages = Object.entries(categoryMoodCorr).map(([category, data]) => ({
    category,
    avgMood: data.total / data.count,
    count: data.count
  })).sort((a, b) => b.avgMood - a.avgMood);

  const getCorrelationIcon = (correlation: number) => {
    if (correlation > 0.3) return TrendingUp;
    if (correlation < -0.3) return TrendingDown;
    return Minus;
  };

  const getCorrelationColor = (correlation: number) => {
    if (correlation > 0.3) return 'text-green-600';
    if (correlation < -0.3) return 'text-red-600';
    return 'text-gray-600';
  };

  const getCorrelationText = (correlation: number) => {
    if (correlation > 0.5) return 'Fuerte positiva';
    if (correlation > 0.3) return 'Moderada positiva';
    if (correlation < -0.5) return 'Fuerte negativa';
    if (correlation < -0.3) return 'Moderada negativa';
    return 'Débil o nula';
  };

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
            {categoryAverages.slice(0, 5).map(({ category, avgMood, count }) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{category}</span>
                    <span className="text-sm text-gray-500">({count} registros)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(avgMood / 5) * 100}%` }}
                    />
                  </div>
                </div>
                <Badge variant="secondary" className="ml-2">
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

// ================================================================
// ADVANCED INSIGHTS COMPONENT
// ================================================================

// ================================================================
// CONSTANTES PARA ADVANCED INSIGHTS
// ================================================================

const ANALYSIS_PERIOD_DAYS = 30;
const MIN_MOOD_LOGS_FOR_ANALYSIS = 5;
const RECENT_PERIOD_DAYS = 7;
const HIGH_FREQUENCY_THRESHOLD = 80;
const MEDIUM_FREQUENCY_THRESHOLD = 50;
const POSITIVE_TREND_THRESHOLD = 0.5;
const NEGATIVE_TREND_THRESHOLD = -0.5;

// ================================================================
// FUNCIONES AUXILIARES PARA REDUCIR COMPLEJIDAD
// ================================================================

function getFrequencyInsightType(frequency: number): 'success' | 'warning' | 'info' {
  if (frequency > HIGH_FREQUENCY_THRESHOLD) return 'success';
  if (frequency > MEDIUM_FREQUENCY_THRESHOLD) return 'warning';
  return 'info';
}

function getFrequencyIcon(frequency: number) {
  if (frequency > HIGH_FREQUENCY_THRESHOLD) return CheckCircle;
  if (frequency > MEDIUM_FREQUENCY_THRESHOLD) return Target;
  return AlertTriangle;
}

function getFrequencyRecommendation(frequency: number): string {
  if (frequency < MEDIUM_FREQUENCY_THRESHOLD) {
    return 'Intenta mantener registros más regulares para obtener mejores insights';
  }
  if (frequency < HIGH_FREQUENCY_THRESHOLD) {
    return 'Buen ritmo de registro, mantén la consistencia';
  }
  return 'Excelente consistencia en los registros';
}

function getMoodTrendType(trend: number): 'success' | 'warning' | 'info' {
  if (trend > POSITIVE_TREND_THRESHOLD) return 'success';
  if (trend < NEGATIVE_TREND_THRESHOLD) return 'warning';
  return 'info';
}

function getMoodTrendRecommendation(trend: number): string {
  if (trend > POSITIVE_TREND_THRESHOLD) {
    return 'Tendencia positiva en el estado de ánimo reciente';
  }
  if (trend < NEGATIVE_TREND_THRESHOLD) {
    return 'Considera revisar factores que puedan estar afectando el bienestar';
  }
  return 'Estado de ánimo estable';
}

function getInsightIconClassName(type: string): string {
  const baseClasses = 'h-5 w-5';
  switch (type) {
    case 'success': return `${baseClasses} text-green-600`;
    case 'warning': return `${baseClasses} text-yellow-600`;
    default: return `${baseClasses} text-blue-600`;
  }
}

function getInsightBackgroundClassName(type: string): string {
  switch (type) {
    case 'success': return 'p-2 rounded-lg bg-green-100';
    case 'warning': return 'p-2 rounded-lg bg-yellow-100';
    default: return 'p-2 rounded-lg bg-blue-100';
  }
}

function getBadgeVariant(type: string): 'default' | 'destructive' | 'secondary' {
  switch (type) {
    case 'success': return 'default';
    case 'warning': return 'destructive';
    default: return 'secondary';
  }
}

function getBadgeText(type: string): string {
  switch (type) {
    case 'success': return 'Positivo';
    case 'warning': return 'Atención';
    default: return 'Info';
  }
}

// ================================================================
// FUNCIONES DE ANÁLISIS ESPECÍFICAS
// ================================================================

function analyzeFrequency(logs: any[]): any | null {
  if (logs.length === 0) return null;

  const daysWithLogs = new Set(logs.map(log => 
    new Date(log.created_at).toDateString()
  )).size;
  
  const frequency = (daysWithLogs / ANALYSIS_PERIOD_DAYS) * 100;
  const type = getFrequencyInsightType(frequency);
  
  return {
    type,
    icon: getFrequencyIcon(frequency),
    title: 'Consistencia en el registro',
    description: `Registros en ${daysWithLogs} de ${ANALYSIS_PERIOD_DAYS} días (${frequency.toFixed(0)}%)`,
    recommendation: getFrequencyRecommendation(frequency)
  };
}

function analyzeMoodTrend(logs: any[]): any | null {
  const moodLogs = logs.filter(log => log.mood_score);
  if (moodLogs.length <= MIN_MOOD_LOGS_FOR_ANALYSIS) return null;

  const avgMood = moodLogs.reduce((sum, log) => sum + log.mood_score, 0) / moodLogs.length;
  const recent = moodLogs.slice(0, RECENT_PERIOD_DAYS);
  const recentAvg = recent.reduce((sum, log) => sum + log.mood_score, 0) / recent.length;
  
  const trend = recentAvg - avgMood;
  const type = getMoodTrendType(trend);
  
  return {
    type,
    icon: Brain,
    title: 'Tendencia del estado de ánimo',
    description: `Promedio general: ${avgMood.toFixed(1)}/5, últimos 7 días: ${recentAvg.toFixed(1)}/5`,
    recommendation: getMoodTrendRecommendation(trend)
  };
}

function analyzeCategories(logs: any[]): any | null {
  const categoryCount = logs.reduce((acc, log) => {
    if (log.category_name) {
      acc[log.category_name] = (acc[log.category_name] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const categories = Object.entries(categoryCount);
  if (categories.length === 0) return null;

  const sortedCategories = categories.toSorted(([,a], [,b]) => (b as number) - (a as number));
  const mostUsedCategory = sortedCategories[0];
  const categoryName = mostUsedCategory[0];
  const categoryCountValue = mostUsedCategory[1] as number;
  const percentage = ((categoryCountValue / logs.length) * 100).toFixed(0);
  
  return {
    type: 'info',
    icon: Target,
    title: 'Área de mayor atención',
    description: `"${categoryName}" representa ${percentage}% de los registros`,
    recommendation: 'Esta categoría requiere mayor atención y seguimiento'
  };
}

function generateAllInsights(logs: any[]): any[] {
  const insights = [];
  
  const frequencyInsight = analyzeFrequency(logs);
  if (frequencyInsight) insights.push(frequencyInsight);
  
  const moodInsight = analyzeMoodTrend(logs);
  if (moodInsight) insights.push(moodInsight);
  
  const categoryInsight = analyzeCategories(logs);
  if (categoryInsight) insights.push(categoryInsight);
  
  return insights;
}

function renderEmptyState(): JSX.Element {
  return (
    <div className="text-center py-8 text-gray-500">
      <Brain className="mx-auto h-12 w-12 text-gray-300 mb-4" />
      <p className="text-lg font-medium">Generando insights...</p>
      <p className="text-sm">Necesitas más datos para análisis avanzado</p>
    </div>
  );
}

function renderInsightCard(insight: any, index: number): JSX.Element {
  return (
    <Card key={index} className="border-l-4 border-l-blue-500">
      <CardContent className="pt-4">
        <div className="flex items-start space-x-3">
          <div className={getInsightBackgroundClassName(insight.type)}>
            {React.createElement(insight.icon, {
              className: getInsightIconClassName(insight.type)
            })}
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">{insight.title}</h4>
            <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
            <p className="text-sm text-gray-500 mt-2 italic">{insight.recommendation}</p>
          </div>
          <Badge variant={getBadgeVariant(insight.type)}>
            {getBadgeText(insight.type)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

// ================================================================
// COMPONENTE PRINCIPAL REFACTORIZADO
// ================================================================

export function AdvancedInsights({ logs }: Readonly<AdvancedInsightsProps>) {
  const insights = generateAllInsights(logs);

  if (insights.length === 0) {
    return renderEmptyState();
  }

  return (
    <div className="space-y-4">
      {insights.map((insight, index) => renderInsightCard(insight, index))}
    </div>
  );
}