"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { Temporal } from "@js-temporal/polyfill";
import { useCalendar } from '../context/calendarcontext';

// Helper to get week start (Monday)
function getWeekStart(date: Temporal.PlainDate): Temporal.PlainDate {
  const dayOfWeek = date.dayOfWeek; // 1 = Monday, 7 = Sunday
  return date.subtract({ days: dayOfWeek - 1 });
}

// Day View Component
function DayView() {
  const { displayedDate } = useCalendar();
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
  };

  const isToday = displayedDate.equals(Temporal.Now.plainDateISO());

  return (
    <div className="flex flex-col h-full">
      {/* Day header */}
      <div className="flex border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
        <div className="w-20 flex-shrink-0" /> {/* Time gutter */}
        <div className="flex-1 py-3 text-center">
          <div className="text-sm text-gray-500">
            {displayedDate.toLocaleString('en', { weekday: 'long' })}
          </div>
          <div className={`text-2xl font-semibold ${isToday ? 'bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center mx-auto' : ''}`}>
            {displayedDate.day}
          </div>
        </div>
      </div>
      
      {/* Hour grid */}
      <div className="flex-1 overflow-y-auto">
        {hours.map((hour) => (
          <div key={hour} className="flex border-b border-gray-100 min-h-[60px]">
            <div className="w-20 flex-shrink-0 text-right pr-3 py-2 text-sm text-gray-500 bg-gray-50">
              {formatHour(hour)}
            </div>
            <div className="flex-1 border-l border-gray-200 hover:bg-blue-50 transition-colors cursor-pointer" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Week View Component
function WeekView() {
  const { displayedDate } = useCalendar();
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const weekStart = getWeekStart(displayedDate);
  const days = Array.from({ length: 7 }, (_, i) => weekStart.add({ days: i }));
  const today = Temporal.Now.plainDateISO();

  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Week header */}
      <div className="flex border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
        <div className="w-20 flex-shrink-0" /> {/* Time gutter */}
        {days.map((day, index) => {
          const isToday = day.equals(today);
          return (
            <div key={index} className="flex-1 py-2 text-center border-l border-gray-200">
              <div className="text-xs text-gray-500">
                {day.toLocaleString('en', { weekday: 'short' })}
              </div>
              <div className={`text-lg font-semibold ${isToday ? 'bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto' : ''}`}>
                {day.day}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Hour grid */}
      <div className="flex-1 overflow-y-auto">
        {hours.map((hour) => (
          <div key={hour} className="flex border-b border-gray-100 min-h-[50px]">
            <div className="w-20 flex-shrink-0 text-right pr-3 py-1 text-xs text-gray-500 bg-gray-50">
              {formatHour(hour)}
            </div>
            {days.map((day, dayIndex) => (
              <div 
                key={dayIndex} 
                className="flex-1 border-l border-gray-200 hover:bg-blue-50 transition-colors cursor-pointer"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Month View Component
function MonthView() {
  const { displayedDate } = useCalendar();
  const [monthCalendar, setMonthCalendar] = useState<{ date: Temporal.PlainDate; isInMonth: boolean }[]>([]);
  const today = Temporal.Now.plainDateISO();
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  useEffect(() => {
    const fiveWeeks = 5 * 7;
    const sixWeeks = 6 * 7;
    const startOfMonth = Temporal.PlainDate.from({ 
      year: displayedDate.year, 
      month: displayedDate.month, 
      day: 1 
    });
    const monthLength = startOfMonth.daysInMonth;
    const dayOfWeekMonthStartedOn = startOfMonth.dayOfWeek - 1;
    
    const length = dayOfWeekMonthStartedOn + monthLength > fiveWeeks ? sixWeeks : fiveWeeks;

    const calendar = new Array(length)
      .fill({})
      .map((_, index) => {
        const date = startOfMonth.add({ days: index - dayOfWeekMonthStartedOn });
        return {
          isInMonth: !(index < dayOfWeekMonthStartedOn || index - dayOfWeekMonthStartedOn >= monthLength),
          date,
        };
      });

    setMonthCalendar(calendar);
  }, [displayedDate]);

  return (
    <div className="flex flex-col h-full">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
        {weekDays.map((day) => (
          <div key={day} className="py-3 text-center text-sm font-medium text-gray-600">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 flex-1">
        {monthCalendar.map((day, index) => {
          const isToday = day.date.equals(today);
          return (
            <div
              key={index}
              className={`border-b border-r border-gray-100 p-2 min-h-[80px] hover:bg-blue-50 transition-colors cursor-pointer
                ${day.isInMonth ? 'bg-white' : 'bg-gray-50'}`}
            >
              <span className={`inline-flex items-center justify-center w-7 h-7 text-sm
                ${isToday ? 'bg-blue-500 text-white rounded-full' : ''}
                ${!day.isInMonth ? 'text-gray-400' : 'text-gray-700'}`}
              >
                {day.date.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Year View Component
function YearView() {
  const { displayedDate, setDisplayedDate, setView } = useCalendar();
  const today = Temporal.Now.plainDateISO();
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getMiniCalendar = (month: number) => {
    const startOfMonth = Temporal.PlainDate.from({ 
      year: displayedDate.year, 
      month, 
      day: 1 
    });
    const monthLength = startOfMonth.daysInMonth;
    const dayOfWeekMonthStartedOn = startOfMonth.dayOfWeek - 1;
    
    const calendar: (number | null)[] = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < dayOfWeekMonthStartedOn; i++) {
      calendar.push(null);
    }
    
    // Add days of month
    for (let day = 1; day <= monthLength; day++) {
      calendar.push(day);
    }
    
    return calendar;
  };

  const handleMonthClick = (month: number) => {
    setDisplayedDate(Temporal.PlainDate.from({ 
      year: displayedDate.year, 
      month, 
      day: 1 
    }));
    setView('month');
  };

  return (
    <div className="grid grid-cols-3 md:grid-cols-4 gap-4 p-4 overflow-y-auto h-full">
      {monthNames.map((monthName, index) => {
        const month = index + 1;
        const miniCalendar = getMiniCalendar(month);
        const isCurrentMonth = today.year === displayedDate.year && today.month === month;
        
        return (
          <div 
            key={monthName} 
            className={`bg-white border rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow
              ${isCurrentMonth ? 'border-blue-500 border-2' : 'border-gray-200'}`}
            onClick={() => handleMonthClick(month)}
          >
            <h3 className={`text-sm font-semibold mb-2 ${isCurrentMonth ? 'text-blue-600' : 'text-gray-700'}`}>
              {monthName}
            </h3>
            <div className="grid grid-cols-7 gap-px text-xs h-full">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <div key={i} className="text-center text-gray-400 font-medium">
                  {d}
                </div>
              ))}
              {miniCalendar.map((day, i) => {
                const isToday = day !== null && 
                  today.year === displayedDate.year && 
                  today.month === month && 
                  today.day === day;
                return (
                  <div 
                    key={i} 
                    className={`text-center py-0.5
                      ${day === null ? '' : 'text-gray-600'}
                      ${isToday ? 'bg-blue-500 text-white rounded-full' : ''}`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Main Calendar Component
function Calendar() {
  const { view } = useCalendar();

  const renderView = () => {
    switch (view) {
      case 'day':
        return <DayView />;
      case 'week':
        return <WeekView />;
      case 'month':
        return <MonthView />;
      case 'year':
        return <YearView />;
      default:
        return <MonthView />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {renderView()}
    </div>
  );
}

// Recall Button Component
function RecallButton() {
  const { displayedDate, view, goToToday } = useCalendar();
  
  const monthNames = [
    '', 'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDisplayValue = () => {
    switch (view) {
      case 'year':
        return 'Today';
      case 'month':
        return `${monthNames[displayedDate.month]} ${displayedDate.year}`;
      case 'week':
        return `${monthNames[displayedDate.month]} ${displayedDate.year}`;
      case 'day':
        return `${monthNames[displayedDate.month]} ${displayedDate.day}, ${displayedDate.year}`;
      default:
        return `${monthNames[displayedDate.month]} ${displayedDate.year}`;
    }
  };

  return (
    <button 
      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
      onClick={goToToday}
    >
      {getDisplayValue()}
    </button>
  );
}

// View Toggle Component
function ViewToggle() {
  const { view, setView } = useCalendar();
  const views: Array<{ key: 'day' | 'week' | 'month' | 'year'; label: string }> = [
    { key: 'day', label: 'Day' },
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'year', label: 'Year' },
  ];

  return (
    <div className="flex bg-gray-100 rounded-lg p-1">
      {views.map(({ key, label }) => (
        <button
          key={key}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors
            ${view === key 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'}`}
          onClick={() => setView(key)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// Navigation Buttons Component
function NavigationButtons() {
  const { next, previous } = useCalendar();

  return (
    <div className="flex gap-1">
      <button 
        className="px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
        onClick={previous}
      >
        ‹
      </button>
      <button 
        className="px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
        onClick={next}
      >
        ›
      </button>
    </div>
  );
}

function dayClickHandler(date: Temporal.PlainDate) {
    console.log("Clicked date:", date.toString());
    // When month or year, if clicked, displays popup to show event of that date (empty, update)
}

export { Calendar, RecallButton, ViewToggle, NavigationButtons };