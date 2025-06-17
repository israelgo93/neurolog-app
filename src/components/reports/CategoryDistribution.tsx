// ================================================================
// src/components/reports/CategoryDistribution.tsx
// Componente de distribución por categorías
// ================================================================

'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface CategoryDistributionProps {
  data: any[];
}

export function CategoryDistribution({ data }: Readonly<CategoryDistributionProps>) {
  // Procesar datos para el gráfico
  const categoryCount = data.reduce((acc, log) => {
    const category = log.category_name ?? 'Sin categoría';
    acc[category] = (acc[category] ?? 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(categoryCount).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
    '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
  ];

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}