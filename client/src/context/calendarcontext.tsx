"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Temporal } from "@js-temporal/polyfill";

type ViewType = 'day' | 'week' | 'month' | 'year';

// Types for events and tasks
export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

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

  // Events
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateEvent: (id: string, event: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;

  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed'>) => Promise<void>;
  updateTask: (id: string, task: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;

  // Modal state
  isEventModalOpen: boolean;
  setIsEventModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isTaskModalOpen: boolean;
  setIsTaskModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editingEvent: CalendarEvent | null;
  setEditingEvent: React.Dispatch<React.SetStateAction<CalendarEvent | null>>;
  editingTask: Task | null;
  setEditingTask: React.Dispatch<React.SetStateAction<Task | null>>;
  selectedDate: string | null;
  setSelectedDate: React.Dispatch<React.SetStateAction<string | null>>;
}

const API_BASE = 'http://localhost:3001/api';

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export function CalendarProvider({ children }: { children: ReactNode }) {
  const today = Temporal.Now.plainDateISO();
  const [displayedDate, setDisplayedDate] = useState<Temporal.PlainDate>(today);
  const [view, setView] = useState<ViewType>('month');

  // Events and Tasks state
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  // Modal state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Fetch events and tasks on mount
  useEffect(() => {
    fetchEvents();
    fetchTasks();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_BASE}/events`);
      const data = await res.json();
      setEvents(data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${API_BASE}/tasks`);
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const addEvent = async (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const res = await fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
      const newEvent = await res.json();
      setEvents(prev => [...prev, newEvent]);
    } catch (error) {
      console.error('Failed to add event:', error);
    }
  };

 const updateEvent = async (id: string, event: Partial<CalendarEvent>) => {
  try {
    const res = await fetch(`${API_BASE}/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
    
    if (!res.ok) {
      const error = await res.json();
      console.error('Update failed:', error);
      return;
    }
    
    const updatedEvent = await res.json();
    console.log('Updated event:', updatedEvent); // Debug log
    
    // Make sure we have a valid event with an id
    if (updatedEvent && updatedEvent.id) {
      setEvents(prev => prev.map(e => e.id === id ? updatedEvent : e));
    } else {
      // If server doesn't return the full event, refetch all events
      await fetchEvents();
    }
  } catch (error) {
    console.error('Failed to update event:', error);
  }
};


  const deleteEvent = async (id: string) => {
    try {
      await fetch(`${API_BASE}/events/${id}`, { method: 'DELETE' });
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed'>) => {
    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
      const newTask = await res.json();
      setTasks(prev => [...prev, newTask]);
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  const updateTask = async (id: string, task: Partial<Task>) => {
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
      const updatedTask = await res.json();
      setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const toggleTask = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      const updatedTask = await res.json();
      setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  };

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
      goToToday,
      events,
      addEvent,
      updateEvent,
      deleteEvent,
      tasks,
      addTask,
      updateTask,
      deleteTask,
      toggleTask,
      isEventModalOpen,
      setIsEventModalOpen,
      isTaskModalOpen,
      setIsTaskModalOpen,
      editingEvent,
      setEditingEvent,
      editingTask,
      setEditingTask,
      selectedDate,
      setSelectedDate,
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