// ================================================================
// src/components/reports/MoodTrendChart.tsx
// Componente de tendencia del estado de ánimo
// ================================================================

'use client';

import { Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, endOfWeek, eachWeekOfInterval, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';

interface MoodTrendChartProps {
  data: any[];
}

export function MoodTrendChart({ data }: MoodTrendChartProps) {
  // Agrupar datos por semana
  const now = new Date();
  const startDate = subWeeks(now, 12); // Últimas 12 semanas
  const weeks = eachWeekOfInterval({ start: startDate, end: now });
  
  const chartData = weeks.map(weekStart => {
    const weekEnd = endOfWeek(weekStart);
    const weekLogs = data.filter(log => {
      const logDate = new Date(log.created_at);
      return logDate >= weekStart && logDate <= weekEnd && log.mood_score;
    });
    
    const avgMood = weekLogs.length > 0 
      ? weekLogs.reduce((sum, log) => sum + log.mood_score, 0) / weekLogs.length
      : null;
    
    return {
      week: format(weekStart, 'dd MMM', { locale: es }),
      mood: avgMood ? Number(avgMood.toFixed(1)) : null,
      count: weekLogs.length
    };
  }).filter(item => item.mood !== null);

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" />
          <YAxis domain={[1, 5]} />
          <Tooltip 
            formatter={(value, name) => [
              `${value}/5`,
              'Estado de ánimo promedio'
            ]}
          />
          <Area
            type="monotone"
            dataKey="mood"
            stroke="#3B82F6"
            fillOpacity={1}
            fill="url(#moodGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}