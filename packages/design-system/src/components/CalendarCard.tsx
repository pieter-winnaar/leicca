/**
 * CalendarCard Component
 *
 * Interactive calendar card for date selection
 */

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './card';
import { Button } from './button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

export interface CalendarCardProps extends React.ComponentPropsWithoutRef<typeof Card> {
  title?: string;
  selectedDates?: number[];
  onDateSelect?: (date: number) => void;
  month?: number;
  year?: number;
  onMonthChange?: (month: number, year: number) => void;
  daysInMonth?: number;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/**
 * CalendarCard - Interactive calendar for date selection
 *
 * @example
 * ```tsx
 * <CalendarCard
 *   title="Calendar"
 *   selectedDates={[5, 13]}
 *   onDateSelect={(date) => console.log('Selected:', date)}
 *   month={5}
 *   year={2025}
 * />
 * ```
 */
export const CalendarCard = React.forwardRef<HTMLDivElement, CalendarCardProps>(
  (
    {
      title = 'Calendar',
      selectedDates = [],
      onDateSelect,
      month: initialMonth = new Date().getMonth(),
      year: initialYear = new Date().getFullYear(),
      onMonthChange,
      daysInMonth: customDaysInMonth,
      className,
      ...props
    },
    ref
  ) => {
    const [month, setMonth] = React.useState(initialMonth);
    const [year, setYear] = React.useState(initialYear);

    const daysInMonth = customDaysInMonth || new Date(year, month + 1, 0).getDate();
    const monthName = MONTH_NAMES[month];

    const handlePrevMonth = () => {
      let newMonth = month - 1;
      let newYear = year;

      if (newMonth < 0) {
        newMonth = 11;
        newYear -= 1;
      }

      setMonth(newMonth);
      setYear(newYear);
      onMonthChange?.(newMonth, newYear);
    };

    const handleNextMonth = () => {
      let newMonth = month + 1;
      let newYear = year;

      if (newMonth > 11) {
        newMonth = 0;
        newYear += 1;
      }

      setMonth(newMonth);
      setYear(newYear);
      onMonthChange?.(newMonth, newYear);
    };

    const handleDateClick = (date: number) => {
      onDateSelect?.(date);
    };

    return (
      <Card ref={ref} className={cn(className)} {...props}>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{`${monthName} ${year}`}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevMonth}
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm font-medium">{`${monthName} ${year}`}</div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNextMonth}
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-sm">
              {DAY_LABELS.map((day, i) => (
                <div key={i} className="text-muted-foreground font-medium">
                  {day}
                </div>
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const date = i + 1;
                const isSelected = selectedDates.includes(date);

                return (
                  <button
                    key={i}
                    onClick={() => handleDateClick(date)}
                    className={cn(
                      'aspect-square rounded-md text-sm transition-colors',
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent hover:text-accent-foreground'
                    )}
                    aria-label={`Select ${date}`}
                    aria-pressed={isSelected}
                  >
                    {date}
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

CalendarCard.displayName = 'CalendarCard';
