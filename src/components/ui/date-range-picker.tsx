// src/components/ui/date-range-picker.tsx
// Componente de selector de rango de fechas

'use client';

import * as React from 'react';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DatePickerWithRangeProps {
  className?: string;
  date?: DateRange;
  setDate: (date: DateRange | undefined) => void;
}

export function DatePickerWithRange({
  className,
  date,
  setDate,
}: Readonly<DatePickerWithRangeProps>) {
  // Extract the label for the button from the nested ternary
  let buttonLabel: React.ReactNode;
  if (date?.from) {
    if (date.to) {
      buttonLabel = (
        <>
          {format(date.from, 'dd LLL y', { locale: es })} -{' '}
          {format(date.to, 'dd LLL y', { locale: es })}
        </>
      );
    } else {
      buttonLabel = format(date.from, 'dd LLL y', { locale: es });
    }
  } else {
    buttonLabel = <span>Seleccionar fechas</span>;
  }

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'w-full justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {buttonLabel}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
            locale={es}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}