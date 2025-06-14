// src/app/dashboard/calendar/page.tsx
// Página de calendario corregida - Error de variable no utilizada solucionado

'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Plus, Clock, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { es } from 'date-fns/locale';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Ahora usamos currentDate y setCurrentDate
  const currentMonth = useMemo(() => {
    return format(currentDate, 'MMMM yyyy', { locale: es });
  }, [currentDate]);

  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Responsivo */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Calendario</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Programa y gestiona eventos y seguimientos
          </p>
        </div>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Button variant="outline" size="sm" onClick={handleToday} className="w-full sm:w-auto">
            <Clock className="h-4 w-4 mr-2" />
            Hoy
          </Button>
          <Button size="sm" className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Evento
          </Button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevMonth}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg sm:text-xl font-semibold capitalize">
                {currentMonth}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextMonth}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Badge variant="secondary" className="text-xs sm:text-sm">
              {calendarDays.length} días
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {/* Days of week header */}
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
              <div
                key={day}
                className="p-2 text-center text-xs sm:text-sm font-medium text-gray-500"
              >
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {calendarDays.map((day) => (
                <div
                key={day.toISOString()}
                className={`
                  relative p-2 sm:p-3 text-center text-xs sm:text-sm cursor-pointer 
                  rounded-md transition-colors hover:bg-gray-100
                  ${isSameMonth(day, currentDate) ? 'text-gray-900' : 'text-gray-400'}
                  ${isToday(day) ? 'bg-blue-100 text-blue-900 font-semibold' : ''}
                `}
                >
                {format(day, 'd')}
                {/* Placeholder for events */}
                {
                  (() => {
                    // Use crypto.getRandomValues for secure random
                    if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
                      const array = new Uint32Array(1);
                      window.crypto.getRandomValues(array);
                      return array[0] % 10 > 8 ? (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
                      ) : null;
                    }
                    // Fallback for environments without crypto
                    const randomValue = Math.floor(Math.random() * 10);
                    return randomValue > 8 ? (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
                    ) : null;
                  })()
                }
                </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon Card - Mejorada */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-base sm:text-lg">
            <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Funcionalidades del Calendario
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Próximamente disponibles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 sm:py-12">
            <CalendarIcon className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
              En Desarrollo
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto">
              El módulo de calendario está siendo desarrollado. Próximamente podrás:
            </p>
            
            {/* Feature list - Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-w-4xl mx-auto">
              <div className="flex items-center justify-center sm:justify-start p-3 bg-gray-50 rounded-lg">
                <Clock className="h-4 w-4 mr-2 text-blue-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-700">Programar citas y evaluaciones</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start p-3 bg-gray-50 rounded-lg">
                <Users className="h-4 w-4 mr-2 text-blue-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-700">Coordinar con especialistas</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start p-3 bg-gray-50 rounded-lg">
                <CalendarIcon className="h-4 w-4 mr-2 text-blue-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-700">Ver recordatorios automáticos</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}