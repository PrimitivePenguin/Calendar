"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Temporal } from "@js-temporal/polyfill";

type ViewType = 'day' | 'week' | 'month' | 'year';

interface CalendarContextType {
  // Current displayed date
  displayedDate: Temporal.PlainDate;
  setDisplayedDate: React.Dispatch<React.SetStateAction<Temporal.PlainDate>>;
  
  // View mode
  view: ViewType;
  setView: React.Dispatch<React.SetStateAction<ViewType>>;
  
  // Navigation functions
  next: () => void;
  previous: () => void;
  goToToday: () => void;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export function CalendarProvider({ children }: { children: ReactNode }) {
  const today = Temporal.Now.plainDateISO();
  const [displayedDate, setDisplayedDate] = useState<Temporal.PlainDate>(today);
  const [view, setView] = useState<ViewType>('month');

  const next = () => {
    setDisplayedDate(prev => {
      switch (view) {
        case 'day':
          return prev.add({ days: 1 });
        case 'week':
          return prev.add({ weeks: 1 });
        case 'month':
          return prev.add({ months: 1 });
        case 'year':
          return prev.add({ years: 1 });
        default:
          return prev;
      }
    });
  };

  const previous = () => {
    setDisplayedDate(prev => {
      switch (view) {
        case 'day':
          return prev.subtract({ days: 1 });
        case 'week':
          return prev.subtract({ weeks: 1 });
        case 'month':
          return prev.subtract({ months: 1 });
        case 'year':
          return prev.subtract({ years: 1 });
        default:
          return prev;
      }
    });
  };

  const goToToday = () => {
    setDisplayedDate(Temporal.Now.plainDateISO());
  };

  return (
    <CalendarContext.Provider value={{
      displayedDate,
      setDisplayedDate,
      view,
      setView,
      next,
      previous,
      goToToday
    }}>
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
}