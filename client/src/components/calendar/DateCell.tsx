/**
 * DateCell Component
 * Individual calendar date cell with pricing and availability display
 */

import * as React from 'react';
import { cn, localDateKey } from '@/lib/utils';
import type { AvailabilityPeriod } from '@/../../shared/types/entities';

interface DateCellProps {
  date: Date;
  availability?: AvailabilityPeriod;
  isSelected: boolean;
  isToday: boolean;
  isPast: boolean;
  isCurrentMonth: boolean;
  onSelect: (date: Date) => void;
  onMouseDown: (date: Date) => void;
  onMouseEnter: (date: Date) => void;
  onTouchStart?: (date: Date, e: React.TouchEvent) => void;
}

export function DateCell({
  date,
  availability,
  isSelected,
  isToday,
  isPast,
  isCurrentMonth,
  onSelect,
  onMouseDown,
  onMouseEnter,
  onTouchStart,
}: DateCellProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isPast) {
      onSelect(date);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isPast) {
      onMouseDown(date);
    }
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isPast) {
      onMouseEnter(date);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isPast && onTouchStart) {
      onTouchStart(date, e);
    }
  };

  const getStatusColor = () => {
    if (isPast) return 'bg-gray-100 text-gray-400 cursor-not-allowed';
    if (!availability) return 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100';
    if (!availability.isAvailable) return 'bg-red-50 border-red-200 text-red-700';
    if (availability.availableRooms === 0) return 'bg-orange-50 border-orange-200 text-orange-700';
    return 'bg-green-50 border-green-200 hover:bg-green-100';
  };

  const formatPrice = (price: number) => {
    return `${price.toFixed(0)}€`;
  };

  return (
    <button
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onTouchStart={handleTouchStart}
      data-date={localDateKey(date)}
      disabled={isPast}
      className={cn(
        'relative h-25 w-full border rounded-lg p-2 text-left transition-all select-none',
        getStatusColor(),
        isSelected && 'ring-2 ring-primary ring-offset-2',
        isToday && 'border-2 border-primary',
        !isCurrentMonth && 'opacity-50',
        !isPast && 'cursor-pointer'
      )}
    >
      <div className="flex flex-col h-full justify-between">
        <div className="flex items-start justify-between">
          <span className={cn(
            'text-sm font-medium',
            isToday && 'text-primary'
          )}>
            {date.getDate()}
          </span>
          {availability && availability.availableRooms > 0 && (
            <span className="text-xs bg-white px-1.5 py-0.5 rounded">
              {availability.availableRooms}
            </span>
          )}
        </div>
        
        {availability && (
          <div className="space-y-0.5">
            <div className="text-xs font-semibold">
              {formatPrice(availability.price)}
            </div>
            {availability.discountPercentage > 0 && (
              <div className="text-xs text-gray-600 line-through">
                {formatPrice(availability.originalPrice)}
              </div>
            )}
            {availability.discountPercentage > 0 && (
              <div className="text-xs font-medium text-green-700">
                -{availability.discountPercentage}%
              </div>
            )}
          </div>
        )}
        
        {!availability && !isPast && (
          <div className="text-xs text-gray-500">
            Sans prix
          </div>
        )}
      </div>
    </button>
  );
}

