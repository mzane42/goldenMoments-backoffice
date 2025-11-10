/**
 * CalendarGrid Component
 * Month/Week view calendar with drag-to-select functionality
 */

import * as React from 'react';
import { DateCell } from './DateCell';
import type { AvailabilityPeriod } from '@/../../shared/types/entities';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, CalendarDays } from 'lucide-react';

interface CalendarGridProps {
  currentMonth: Date;
  availability: AvailabilityPeriod[];
  selectedDates: Date[];
  onDateSelect: (dates: Date[]) => void;
  onMonthChange: (month: Date) => void;
  onDragStateChange?: (isDragging: boolean) => void;
}

export function CalendarGrid({
  currentMonth,
  availability,
  selectedDates,
  onDateSelect,
  onMonthChange,
  onDragStateChange,
}: CalendarGridProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState<Date | null>(null);
  const [hasDragged, setHasDragged] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<'month' | 'list'>('month');

  const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const startDate = new Date(startOfMonth);
  startDate.setDate(startDate.getDate() - startDate.getDay()); // Start from Sunday

  const endDate = new Date(endOfMonth);
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay())); // End on Saturday

  const days: Date[] = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getAvailabilityForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return availability.find(a => a.date === dateStr);
  };

  const isDateSelected = (date: Date) => {
    return selectedDates.some(
      d => d.toISOString().split('T')[0] === date.toISOString().split('T')[0]
    );
  };

  const isPastDate = (date: Date) => {
    return date < today;
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const handleMouseDown = (date: Date) => {
    setIsDragging(true);
    setDragStart(date);
    setHasDragged(false);
    onDragStateChange?.(true);
    // Don't select yet, wait for click or drag
  };

  const handleMouseEnter = (date: Date) => {
    if (isDragging && dragStart) {
      setHasDragged(true);
      const dates = getDatesInRange(dragStart, date);
      onDateSelect(dates);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
    setHasDragged(false);
    onDragStateChange?.(false);
  };

  // Touch event handlers for mobile/tablet
  const handleTouchStart = (date: Date, e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart(date);
    setHasDragged(false);
    onDragStateChange?.(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !dragStart) return;
    
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    const dateStr = element?.getAttribute('data-date');
    
    if (dateStr) {
      setHasDragged(true);
      const date = new Date(dateStr);
      const dates = getDatesInRange(dragStart, date);
      onDateSelect(dates);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setDragStart(null);
    setHasDragged(false);
    onDragStateChange?.(false);
  };

  React.useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      setDragStart(null);
      setHasDragged(false);
      onDragStateChange?.(false);
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [onDragStateChange]);

  const getDatesInRange = (start: Date, end: Date): Date[] => {
    const dates: Date[] = [];
    const current = new Date(Math.min(start.getTime(), end.getTime()));
    const last = new Date(Math.max(start.getTime(), end.getTime()));
    
    while (current <= last) {
      if (!isPastDate(current)) {
        dates.push(new Date(current));
      }
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  };

  const handleDateClick = (date: Date) => {
    // If we dragged, the selection is already handled by handleMouseEnter
    if (hasDragged) {
      return;
    }
    
    // Simple click behavior: 
    // - If clicking on already selected date, keep it selected (don't toggle off)
    // - If clicking on new date, select only that date (clear others)
    if (!isDateSelected(date)) {
      onDateSelect([date]);
    }
    // If already selected, do nothing (keep it selected for editing)
  };

  const previousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    onMonthChange(newMonth);
  };

  const nextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    onMonthChange(newMonth);
  };

  // Get only dates from current month for list view
  const getMonthDates = () => {
    const dates: Date[] = [];
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
      dates.push(date);
    }
    
    return dates;
  };

  // Determine which view to show based on screen size
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) { // md breakpoint
        setViewMode('list');
      } else {
        setViewMode('month');
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const monthDates = getMonthDates();

  return (
    <div className="space-y-4">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-semibold">
          {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {viewMode === 'month' ? (
        <>
          {/* Week Days Header - Desktop Only */}
          <div className="hidden md:grid grid-cols-7 gap-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid - Desktop */}
          <div 
            className="hidden md:grid grid-cols-7 gap-2"
            onMouseUp={handleMouseUp}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {days.map((date, index) => (
              <DateCell
                key={index}
                date={date}
                availability={getAvailabilityForDate(date)}
                isSelected={isDateSelected(date)}
                isToday={date.toISOString().split('T')[0] === today.toISOString().split('T')[0]}
                isPast={isPastDate(date)}
                isCurrentMonth={isCurrentMonth(date)}
                onSelect={handleDateClick}
                onMouseDown={handleMouseDown}
                onMouseEnter={handleMouseEnter}
                onTouchStart={handleTouchStart}
              />
            ))}
          </div>
        </>
      ) : (
        /* Vertical List View - Mobile */
        <div 
          className="md:hidden space-y-3 max-h-[60vh] overflow-y-auto"
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {monthDates.map((date, index) => {
            const dateAvailability = getAvailabilityForDate(date);
            const isSelected = isDateSelected(date);
            const isToday = date.toISOString().split('T')[0] === today.toISOString().split('T')[0];
            const isPast = isPastDate(date);
            
            return (
              <button
                key={index}
                onClick={() => !isPast && handleDateClick(date)}
                onTouchStart={(e) => !isPast && handleTouchStart(date, e)}
                data-date={date.toISOString().split('T')[0]}
                disabled={isPast}
                className={`
                  w-full p-4 rounded-lg border-2 text-left transition-all
                  ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
                  ${isToday ? 'border-primary' : 'border-gray-200'}
                  ${isPast ? 'bg-gray-100 opacity-50 cursor-not-allowed' : 'bg-white hover:bg-gray-50'}
                  ${!dateAvailability && !isPast ? 'bg-yellow-50' : ''}
                  ${dateAvailability?.isAvailable && !isPast ? 'bg-green-50' : ''}
                  ${dateAvailability && !dateAvailability.isAvailable ? 'bg-red-50' : ''}
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-semibold">
                        {date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </span>
                      {isToday && (
                        <span className="text-xs px-2 py-0.5 bg-primary text-white rounded-full">
                          Aujourd'hui
                        </span>
                      )}
                    </div>
                    {dateAvailability ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-green-700">
                            {dateAvailability.price.toFixed(0)}€
                          </span>
                          {dateAvailability.discountPercentage > 0 && (
                            <>
                              <span className="text-sm text-gray-500 line-through">
                                {dateAvailability.originalPrice.toFixed(0)}€
                              </span>
                              <span className="text-sm font-medium text-green-600">
                                -{dateAvailability.discountPercentage}%
                              </span>
                            </>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          {dateAvailability.availableRooms} {dateAvailability.availableRooms > 1 ? 'chambres' : 'chambre'} disponible{dateAvailability.availableRooms > 1 ? 's' : ''}
                        </div>
                      </div>
                    ) : (
                      !isPast && (
                        <span className="text-sm text-gray-500">Sans prix défini</span>
                      )
                    )}
                  </div>
                  {isSelected && (
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Legend - Desktop Only */}
      <div className="hidden md:flex flex-wrap gap-4 pt-4 border-t">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-50 border border-green-200 rounded" />
          <span className="text-sm text-gray-600">Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-50 border border-yellow-200 rounded" />
          <span className="text-sm text-gray-600">Sans prix</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-50 border border-red-200 rounded" />
          <span className="text-sm text-gray-600">Indisponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded" />
          <span className="text-sm text-gray-600">Date passée</span>
        </div>
      </div>
    </div>
  );
}

