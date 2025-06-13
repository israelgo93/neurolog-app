// ================================================================
// src/components/reports/ProgressChart.tsx
// Componente de gráfico de progreso
// ================================================================

'use client';

import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface ProgressChartProps {
  readonly data: readonly any[];
}

export function ProgressChart({ data }: ProgressChartProps) {
  // Procesar datos para el gráfico
  const chartData = data
    .filter(log => log.mood_score)
    .map(log => ({
      date: format(new Date(log.created_at), 'dd/MM'),
      mood: log.mood_score,
      category: log.category_name
    }))
    .slice(0, 30); // Últimos 30 registros

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[1, 5]} />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="mood" 
            stroke="#3B82F6" 
            strokeWidth={2}
            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}