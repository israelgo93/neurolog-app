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
  readonly logs: any[];
}

interface CorrelationAnalysisProps {
  readonly logs: any[];
}

interface AdvancedInsightsProps {
  readonly logs: any[];
}

// ================================================================
// HELPER FUNCTIONS - EXTRAÍDAS PARA REDUCIR COMPLEJIDAD
// ================================================================

/**
 * Procesa logs para obtener patrones por hora
 */
function buildHourlyPattern(logs: any[]): Record<number, number> {
  return logs.reduce((acc, log) => {
    const hour = new Date(log.created_at).getHours();
    acc[hour] = (acc[hour] ?? 0) + 1;
    return acc;
  }, {} as Record<number, number>);
}

/**
 * Procesa logs para obtener patrones por día de la semana
 */
function buildWeeklyPattern(logs: any[]): Record<number, number> {
  return logs.reduce((acc, log) => {
    const day = new Date(log.created_at).getDay();
    acc[day] = (acc[day] ?? 0) + 1;
    return acc;
  }, {} as Record<number, number>);
}

/**
 * Encuentra la hora más activa
 */
function findMostActiveHour(hourlyPattern: Record<number, number>): string {
  const values = Object.values(hourlyPattern).filter((v): v is number => typeof v === 'number');
  if (values.length === 0) return 'N/A';
  
  const max = Math.max(...values);
  const hour = Object.keys(hourlyPattern).find(h => hourlyPattern[parseInt(h)] === max);
  return hour ? `${hour}:00` : 'N/A';
}

/**
 * Encuentra el día más activo
 */
function findMostActiveDay(weeklyPattern: Record<number, number>): string {
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const values = Object.values(weeklyPattern).filter((v): v is number => typeof v === 'number');
  if (values.length === 0) return 'N/A';
  
  const max = Math.max(...values);
  const day = Object.keys(weeklyPattern).find(d => weeklyPattern[parseInt(d)] === max);
  return day ? dayNames[parseInt(day)] : 'N/A';
}

/**
 * Calcula la intensidad de un día basado en el conteo
 */
function calculateDayIntensity(count: number, maxCount: number): number {
  return maxCount > 0 ? (count / maxCount) * 100 : 0;
}

// ================================================================
// TIMEPATTERNS COMPONENT - REFACTORIZADO
// ================================================================

export function TimePatterns({ logs }: TimePatternsProps) {
  const hourlyPattern = buildHourlyPattern(logs);
  const weeklyPattern = buildWeeklyPattern(logs);
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const mostActiveHour = findMostActiveHour(hourlyPattern);
  const mostActiveDay = findMostActiveDay(weeklyPattern);

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
        <div className="flex space-x-1">
          {dayNames.map((day, index) => {
            const count = weeklyPattern[index] ?? 0;
            const values = Object.values(weeklyPattern).filter((v): v is number => typeof v === 'number');
            const maxCount = values.length > 0 ? Math.max(...values) : 0;
            const intensity = calculateDayIntensity(count, maxCount);
            
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
// CORRELATION ANALYSIS HELPERS - EXTRAÍDAS PARA REDUCIR COMPLEJIDAD
// ================================================================

/**
 * Convierte el nivel de intensidad a número
 */
function mapIntensityToNumber(intensityLevel: string): number {
  if (intensityLevel === 'low') return 1;
  if (intensityLevel === 'medium') return 2;
  return 3;
}

/**
 * Calcula la correlación entre dos conjuntos de datos
 */
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

/**
 * Construye estadísticas de categorías y mood
 */
function buildCategoryMoodStats(logs: any[]): Record<string, { total: number; count: number }> {
  return logs.reduce((acc, log) => {
    if (!log.mood_score || !log.category_name) return acc;
    
    acc[log.category_name] ??= { total: 0, count: 0 };
    acc[log.category_name].total += log.mood_score;
    acc[log.category_name].count += 1;
    
    return acc;
  }, {} as Record<string, { total: number; count: number }>);
}

/**
 * Procesa las estadísticas de categorías para obtener promedios ordenados
 */
function processCategoryAverages(categoryStats: Record<string, { total: number; count: number }>) {
  return Object.entries(categoryStats)
    .map(([category, data]) => ({
      category,
      avgMood: data.total / data.count,
      count: data.count
    }))
    .sort((a, b) => b.avgMood - a.avgMood);
}

/**
 * Obtiene el ícono de correlación basado en el valor
 */
function getCorrelationIcon(correlation: number) {
  if (correlation > 0.3) return TrendingUp;
  if (correlation < -0.3) return TrendingDown;
  return Minus;
}

/**
 * Obtiene el color de correlación basado en el valor
 */
function getCorrelationColor(correlation: number): string {
  if (correlation > 0.3) return 'text-green-600';
  if (correlation < -0.3) return 'text-red-600';
  return 'text-gray-600';
}

/**
 * Obtiene el texto descriptivo de correlación
 */
function getCorrelationText(correlation: number): string {
  if (correlation > 0.5) return 'Fuerte positiva';
  if (correlation > 0.3) return 'Moderada positiva';
  if (correlation < -0.5) return 'Fuerte negativa';
  if (correlation < -0.3) return 'Moderada negativa';
  return 'Débil o nula';
}

// ================================================================
// CORRELATION ANALYSIS COMPONENT - REFACTORIZADO
// ================================================================

export function CorrelationAnalysis({ logs }: CorrelationAnalysisProps) {
  // Calcular correlación entre estado de ánimo e intensidad
  const moodIntensityCorr = calculateCorrelation(
    logs.filter(l => l.mood_score && l.intensity_level),
    'mood_score',
    log => mapIntensityToNumber(log.intensity_level)
  );

  // Calcular correlación entre categorías y estado de ánimo
  const categoryMoodStats = buildCategoryMoodStats(logs);
  const categoryAverages = processCategoryAverages(categoryMoodStats);

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
// ADVANCED INSIGHTS HELPERS - EXTRAÍDAS PARA REDUCIR COMPLEJIDAD
// ================================================================

type InsightType = 'success' | 'warning' | 'info';

interface Insight {
  type: InsightType;
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  recommendation: string;
}

/**
 * Determina el tipo de insight basado en la frecuencia
 */
function getFrequencyInsightType(frequency: number): InsightType {
  if (frequency > 80) return 'success';
  if (frequency > 50) return 'warning';
  return 'info';
}

/**
 * Obtiene el ícono basado en la frecuencia
 */
function getFrequencyIcon(frequency: number) {
  if (frequency > 80) return CheckCircle;
  if (frequency > 50) return Target;
  return AlertTriangle;
}

/**
 * Obtiene la recomendación basada en la frecuencia
 */
function getFrequencyRecommendation(frequency: number): string {
  if (frequency < 50) {
    return 'Intenta mantener registros más regulares para obtener mejores insights';
  }
  if (frequency < 80) {
    return 'Buen ritmo de registro, mantén la consistencia';
  }
  return 'Excelente consistencia en los registros';
}

/**
 * Genera insight de consistencia de registros
 */
function generateConsistencyInsight(logs: any[]): Insight | null {
  if (logs.length === 0) return null;
  
  const daysWithLogs = new Set(logs.map(log => 
    new Date(log.created_at).toDateString()
  )).size;
  
  const totalDays = 30; // últimos 30 días
  const frequency = (daysWithLogs / totalDays) * 100;
  
  return {
    type: getFrequencyInsightType(frequency),
    icon: getFrequencyIcon(frequency),
    title: 'Consistencia en el registro',
    description: `Registros en ${daysWithLogs} de ${totalDays} días (${frequency.toFixed(0)}%)`,
    recommendation: getFrequencyRecommendation(frequency)
  };
}

/**
 * Determina el tipo de insight basado en la tendencia del mood
 */
function getMoodTrendInsightType(trend: number): InsightType {
  if (trend > 0.5) return 'success';
  if (trend < -0.5) return 'warning';
  return 'info';
}

/**
 * Obtiene la recomendación basada en la tendencia del mood
 */
function getMoodTrendRecommendation(trend: number): string {
  if (trend > 0.5) {
    return 'Tendencia positiva en el estado de ánimo reciente';
  }
  if (trend < -0.5) {
    return 'Considera revisar factores que puedan estar afectando el bienestar';
  }
  return 'Estado de ánimo estable';
}

/**
 * Genera insight de tendencia del estado de ánimo
 */
function generateMoodTrendInsight(logs: any[]): Insight | null {
  const moodLogs = logs.filter(log => log.mood_score);
  if (moodLogs.length <= 5) return null;
  
  const avgMood = moodLogs.reduce((sum, log) => sum + log.mood_score, 0) / moodLogs.length;
  const recent = moodLogs.slice(0, 7);
  const recentAvg = recent.reduce((sum, log) => sum + log.mood_score, 0) / recent.length;
  
  const trend = recentAvg - avgMood;
  
  return {
    type: getMoodTrendInsightType(trend),
    icon: Brain,
    title: 'Tendencia del estado de ánimo',
    description: `Promedio general: ${avgMood.toFixed(1)}/5, últimos 7 días: ${recentAvg.toFixed(1)}/5`,
    recommendation: getMoodTrendRecommendation(trend)
  };
}

/**
 * Procesa las categorías para obtener estadísticas
 */
function processCategoryStats(logs: any[]): Record<string, number> {
  return logs.reduce((acc, log) => {
    if (log.category_name) {
      acc[log.category_name] = (acc[log.category_name] ?? 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Encuentra la categoría más usada
 */
function findMostUsedCategory(categoryCount: Record<string, number>): [string, number] | null {
  const categories = Object.entries(categoryCount);
  if (categories.length === 0) return null;
  
  const sortedCategories = categories.toSorted(([,a], [,b]) => b - a);
  return sortedCategories[0];
}

/**
 * Genera insight de categoría más usada
 */
function generateCategoryInsight(logs: any[]): Insight | null {
  const categoryCount = processCategoryStats(logs);
  const mostUsedCategory = findMostUsedCategory(categoryCount);
  
  if (!mostUsedCategory) return null;
  
  const [categoryName, categoryCount_] = mostUsedCategory;
  const percentage = ((categoryCount_ / logs.length) * 100).toFixed(0);
  
  return {
    type: 'info',
    icon: Target,
    title: 'Área de mayor atención',
    description: `"${categoryName}" representa ${percentage}% de los registros`,
    recommendation: 'Esta categoría requiere mayor atención y seguimiento'
  };
}

/**
 * Genera todos los insights
 */
function generateAllInsights(logs: any[]): Insight[] {
  const insights: Insight[] = [];
  
  const consistencyInsight = generateConsistencyInsight(logs);
  if (consistencyInsight) insights.push(consistencyInsight);
  
  const moodTrendInsight = generateMoodTrendInsight(logs);
  if (moodTrendInsight) insights.push(moodTrendInsight);
  
  const categoryInsight = generateCategoryInsight(logs);
  if (categoryInsight) insights.push(categoryInsight);
  
  return insights;
}

/**
 * Obtiene las clases CSS para el fondo del insight
 */
function getInsightBackgroundClasses(type: InsightType): string {
  if (type === 'success') return 'bg-green-100';
  if (type === 'warning') return 'bg-yellow-100';
  return 'bg-blue-100';
}

/**
 * Obtiene las clases CSS para el ícono del insight
 */
function getInsightIconClasses(type: InsightType): string {
  if (type === 'success') return 'text-green-600';
  if (type === 'warning') return 'text-yellow-600';
  return 'text-blue-600';
}

/**
 * Obtiene la variante del badge basada en el tipo
 */
function getBadgeVariant(type: InsightType): 'default' | 'destructive' | 'secondary' {
  if (type === 'success') return 'default';
  if (type === 'warning') return 'destructive';
  return 'secondary';
}

/**
 * Obtiene el texto del badge basado en el tipo
 */
function getBadgeText(type: InsightType): string {
  if (type === 'success') return 'Positivo';
  if (type === 'warning') return 'Atención';
  return 'Info';
}

// ================================================================
// ADVANCED INSIGHTS COMPONENT - REFACTORIZADO
// ================================================================

export function AdvancedInsights({ logs }: AdvancedInsightsProps) {
  const insights = generateAllInsights(logs);

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
      {insights.map((insight, index) => (
        <Card key={`${insight.title}-${index}`} className="border-l-4 border-l-blue-500">
          <CardContent className="pt-4">
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${getInsightBackgroundClasses(insight.type)}`}>
                {React.createElement(insight.icon, {
                  className: `h-5 w-5 ${getInsightIconClasses(insight.type)}`
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
      ))}
    </div>
  );
}