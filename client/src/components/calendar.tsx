"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { Temporal } from "@js-temporal/polyfill";
import { useCalendar, CalendarEvent, Task } from '../context/calendarcontext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Helper to get week start (Monday)
function getWeekStart(date: Temporal.PlainDate): Temporal.PlainDate {
  const dayOfWeek = date.dayOfWeek;
  return date.subtract({ days: dayOfWeek - 1 });
}

interface PositionedEvent extends CalendarEvent {
  top: number;
  height: number;
  left: number;
  width: number;
  column: number;
}

function getEventPositions(events: CalendarEvent[], date: Temporal.PlainDate, hourHeight: number = 60): PositionedEvent[] {
  const dateStr = date.toString();
  const dayEvents = events.filter(event => {
    const startDate = event.startDate.slice(0, 10);
    const endDate = event.endDate.slice(0, 10);
    return startDate <= dateStr && endDate >= dateStr;
  });

  if (dayEvents.length === 0) return [];

  const positioned: PositionedEvent[] = dayEvents.map(event => {
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);
    const dayStart = new Date(`${dateStr}T00:00:00`);
    const dayEnd = new Date(`${dateStr}T23:59:59`);
    const displayStart = eventStart < dayStart ? dayStart : eventStart;
    const displayEnd = eventEnd > dayEnd ? dayEnd : eventEnd;
    const startHour = displayStart.getHours() + displayStart.getMinutes() / 60;
    const endHour = displayEnd.getHours() + displayEnd.getMinutes() / 60;
    const effectiveEndHour = eventEnd > dayEnd ? 24 : endHour;
    const top = startHour * hourHeight;
    const height = Math.max((effectiveEndHour - startHour) * hourHeight, hourHeight / 2);
    return { ...event, top, height, left: 0, width: 100, column: 0 };
  });

  positioned.sort((a, b) => a.top !== b.top ? a.top - b.top : b.height - a.height);
  const columns: PositionedEvent[][] = [];
  
  positioned.forEach(event => {
    let placed = false;
    for (let i = 0; i < columns.length; i++) {
      const overlaps = columns[i].some(other => {
        const otherEnd = other.top + other.height;
        const eventEnd = event.top + event.height;
        return !(event.top >= otherEnd || eventEnd <= other.top);
      });
      if (!overlaps) {
        columns[i].push(event);
        event.column = i;
        placed = true;
        break;
      }
    }
    if (!placed) {
      columns.push([event]);
      event.column = columns.length - 1;
    }
  });

  const totalColumns = columns.length;
  positioned.forEach(event => {
    event.width = 100 / totalColumns;
    event.left = event.column * event.width;
  });
  return positioned;
}

// Reusable popup component
function CreatePopup({ isOpen, position, onClose, onCreateEvent, onCreateTask }: {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onCreateEvent: () => void;
  onCreateTask: () => void;
}) {
  if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="dropdown-retro fixed z-50 min-w-[160px] py-2"
        style={{ left: position.x, top: position.y }}
      >
        <button onClick={onCreateEvent} className="dropdown-item w-full text-left text-sm">
          <div className="status-light status-blue status-light-on" />
          <span className="font-body">New Event</span>
        </button>
        <div className="dropdown-divider" />
        <button onClick={onCreateTask} className="dropdown-item w-full text-left text-sm">
          <div className="status-light status-green status-light-on" />
          <span className="font-body">New Task</span>
        </button>
      </div>
    </>
  );
}

// Day View
function DayView() {
  const { displayedDate, events, tasks, setIsEventModalOpen, setIsTaskModalOpen, setEditingEvent, setEditingTask, setSelectedDate } = useCalendar();
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const hourHeight = 60;
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [popupDate, setPopupDate] = useState('');

  const formatHour = (hour: number) => hour.toString().padStart(2, '0') + ':00';
  const isToday = displayedDate.equals(Temporal.Now.plainDateISO());
  const positionedEvents = useMemo(() => getEventPositions(events, displayedDate, hourHeight), [events, displayedDate]);
  const dayTasks = tasks.filter(task => task.dueDate.slice(0, 10) === displayedDate.toString());
  const getEventHour = (dateStr: string) => new Date(dateStr).getHours();

  const handleHourClick = (hour: number, e: React.MouseEvent) => {
    setPopupDate(`${displayedDate.toString()}T${hour.toString().padStart(2, '0')}:00`);
    setPopupPosition({ x: e.clientX, y: e.clientY });
    setPopupOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-theme-secondary">
      <CreatePopup isOpen={popupOpen} position={popupPosition} onClose={() => setPopupOpen(false)}
        onCreateEvent={() => { setSelectedDate(popupDate); setEditingEvent(null); setIsEventModalOpen(true); setPopupOpen(false); }}
        onCreateTask={() => { setSelectedDate(popupDate); setEditingTask(null); setIsTaskModalOpen(true); setPopupOpen(false); }}
      />
      <div className="view-header flex items-center border-b-4 border-gray-700 sticky top-0 z-10">
        <div className="w-20 flex-shrink-0" />
        <div className="flex-1 py-4 text-center">
          <div className="view-header-day text-sm">{displayedDate.toLocaleString('en', { weekday: 'long' })}</div>
          <div className={`inline-flex items-center justify-center mt-1 ${isToday ? 'day-badge day-badge-today text-2xl' : 'text-2xl font-display font-bold text-gray-300'}`}>
            {displayedDate.day}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="flex">
          <div className="time-gutter w-20 flex-shrink-0">
            {hours.map((hour) => (
              <div key={hour} className="relative h-[60px] pr-4">
                <span className="time-label block pt-1">{formatHour(hour)}</span>
                <span className="time-tick time-tick-major absolute right-0 top-0" />
                <span className="time-tick time-tick-minor absolute right-0 top-[15px]" />
                <span className="time-tick time-tick-minor absolute right-0 top-[30px]" />
                <span className="time-tick time-tick-minor absolute right-0 top-[45px]" />
              </div>
            ))}
          </div>
          <div className="flex-1 relative border-l-4 border-gray-400">
            {hours.map((hour) => {
              const hourTasks = dayTasks.filter(t => getEventHour(t.dueDate) === hour);
              return (
                <div key={hour} onClick={(e) => handleHourClick(hour, e)} className="h-[60px] border-b-2 border-gray-300 bg-theme-secondary hover:bg-theme-tertiary transition-colors cursor-pointer">
                  {hourTasks.map(task => (
                    <div key={task.id} onClick={(e) => { e.stopPropagation(); setEditingTask(task); setIsTaskModalOpen(true); }}
                      className="task-item mx-2 my-1 cursor-pointer" style={{ borderLeftColor: task.priority === 'high' ? 'var(--accent-red)' : task.priority === 'medium' ? 'var(--accent-yellow)' : 'var(--accent-green)' }}>
                      <span className={task.completed ? 'line-through opacity-50' : ''}>{task.title}</span>
                    </div>
                  ))}
                </div>
              );
            })}
            {positionedEvents.map(event => (
              <div key={event.id} onClick={(e) => { e.stopPropagation(); setEditingEvent(event); setIsEventModalOpen(true); }}
                className="event-block absolute text-white cursor-pointer" style={{ backgroundColor: event.color, top: `${event.top}px`, height: `${event.height}px`, left: `${event.left}%`, width: `calc(${event.width}% - 8px)`, marginLeft: '4px', padding: '6px 10px' }}>
                <div className="font-medium truncate text-xs">{event.title}</div>
                {event.height > 40 && <div className="text-[10px] opacity-80 truncate mt-1">{new Date(event.startDate).toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })} → {new Date(event.endDate).toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Week View
function WeekView() {
  const { displayedDate, events, tasks, setIsEventModalOpen, setIsTaskModalOpen, setEditingEvent, setEditingTask, setSelectedDate } = useCalendar();
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const weekStart = getWeekStart(displayedDate);
  const days = Array.from({ length: 7 }, (_, i) => weekStart.add({ days: i }));
  const today = Temporal.Now.plainDateISO();
  const hourHeight = 50;
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [popupDate, setPopupDate] = useState('');

  const formatHour = (hour: number) => hour.toString().padStart(2, '0') + ':00';
  const positionedEventsByDay = useMemo(() => {
    const result: { [key: string]: PositionedEvent[] } = {};
    days.forEach(day => { result[day.toString()] = getEventPositions(events, day, hourHeight); });
    return result;
  }, [events, weekStart.toString()]);

  const getTasksForDate = (date: Temporal.PlainDate) => tasks.filter(task => task.dueDate.slice(0, 10) === date.toString());
  const getEventHour = (dateStr: string) => new Date(dateStr).getHours();

  return (
    <div className="flex flex-col h-full bg-theme-secondary">
      <CreatePopup isOpen={popupOpen} position={popupPosition} onClose={() => setPopupOpen(false)}
        onCreateEvent={() => { setSelectedDate(popupDate); setEditingEvent(null); setIsEventModalOpen(true); setPopupOpen(false); }}
        onCreateTask={() => { setSelectedDate(popupDate); setEditingTask(null); setIsTaskModalOpen(true); setPopupOpen(false); }}
      />
      <div className="view-header flex border-b-4 border-gray-700 sticky top-0 z-10">
        <div className="w-16 flex-shrink-0" />
        {days.map((day, index) => {
          const isDayToday = day.equals(today);
          return (
            <div key={index} className="flex-1 py-3 text-center border-l-2 border-gray-600">
              <div className="view-header-day text-xs">{day.toLocaleString('en', { weekday: 'short' }).toUpperCase()}</div>
              <div className={`inline-flex items-center justify-center mt-1 ${isDayToday ? 'day-badge day-badge-today w-8 h-8 text-base' : 'text-lg font-display font-bold text-gray-300'}`}>{day.day}</div>
            </div>
          );
        })}
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="flex">
          <div className="time-gutter w-16 flex-shrink-0">
            {hours.map((hour) => (
              <div key={hour} className="relative h-[50px] pr-3">
                <span className="time-label block pt-1 text-[10px]">{formatHour(hour)}</span>
                <span className="time-tick time-tick-major absolute right-0 top-0" />
                <span className="time-tick time-tick-minor absolute right-0 top-[25px]" />
              </div>
            ))}
          </div>
          {days.map((day, dayIndex) => {
            const dayTasks = getTasksForDate(day);
            const positionedEvents = positionedEventsByDay[day.toString()] || [];
            return (
              <div key={dayIndex} className="flex-1 relative border-l-2 border-gray-400">
                {hours.map((hour) => {
                  const hourTasks = dayTasks.filter(t => getEventHour(t.dueDate) === hour);
                  return (
                    <div key={hour} onClick={(e) => { setPopupDate(`${day.toString()}T${hour.toString().padStart(2, '0')}:00`); setPopupPosition({ x: e.clientX, y: e.clientY }); setPopupOpen(true); }}
                      className="h-[50px] border-b border-gray-300 bg-theme-secondary hover:bg-theme-tertiary transition-colors cursor-pointer">
                      {hourTasks.map(task => (
                        <div key={task.id} onClick={(e) => { e.stopPropagation(); setEditingTask(task); setIsTaskModalOpen(true); }}
                          className="task-compact mx-1 my-0.5 cursor-pointer" style={{ borderLeftColor: task.priority === 'high' ? 'var(--accent-red)' : task.priority === 'medium' ? 'var(--accent-yellow)' : 'var(--accent-green)' }}>
                          <span className={task.completed ? 'line-through opacity-50' : ''}>{task.title}</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
                {positionedEvents.map(event => (
                  <div key={event.id} onClick={(e) => { e.stopPropagation(); setEditingEvent(event); setIsEventModalOpen(true); }}
                    className="event-block absolute text-white cursor-pointer text-[10px]" style={{ backgroundColor: event.color, top: `${event.top}px`, height: `${event.height}px`, left: `${event.left}%`, width: `calc(${event.width}% - 4px)`, marginLeft: '2px', padding: '4px 6px' }}>
                    <div className="font-medium truncate">{event.title}</div>
                    {event.height > 30 && <div className="text-[9px] opacity-80 truncate">{new Date(event.startDate).toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })}</div>}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Month View
function MonthView() {
  const { displayedDate, events, tasks, setIsEventModalOpen, setIsTaskModalOpen, setEditingEvent, setEditingTask, setSelectedDate } = useCalendar();
  const [monthCalendar, setMonthCalendar] = useState<{ date: Temporal.PlainDate; isInMonth: boolean }[]>([]);
  const today = Temporal.Now.plainDateISO();
  const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [popupDate, setPopupDate] = useState('');

  useEffect(() => {
    const startOfMonth = Temporal.PlainDate.from({ year: displayedDate.year, month: displayedDate.month, day: 1 });
    const monthLength = startOfMonth.daysInMonth;
    const dayOfWeekMonthStartedOn = startOfMonth.dayOfWeek - 1;
    const length = dayOfWeekMonthStartedOn + monthLength > 35 ? 42 : 35;
    const calendar = new Array(length).fill({}).map((_, index) => {
      const date = startOfMonth.add({ days: index - dayOfWeekMonthStartedOn });
      return { isInMonth: !(index < dayOfWeekMonthStartedOn || index - dayOfWeekMonthStartedOn >= monthLength), date };
    });
    setMonthCalendar(calendar);
  }, [displayedDate]);

  const getEventsForDate = (date: Temporal.PlainDate) => events.filter(event => event.startDate.slice(0, 10) === date.toString());
  const getTasksForDate = (date: Temporal.PlainDate) => tasks.filter(task => task.dueDate.slice(0, 10) === date.toString());

  return (
    <div className="flex flex-col h-full">
      <CreatePopup isOpen={popupOpen} position={popupPosition} onClose={() => setPopupOpen(false)}
        onCreateEvent={() => { setSelectedDate(popupDate); setEditingEvent(null); setIsEventModalOpen(true); setPopupOpen(false); }}
        onCreateTask={() => { setSelectedDate(popupDate); setEditingTask(null); setIsTaskModalOpen(true); setPopupOpen(false); }}
      />
      <div className="view-header grid grid-cols-7 border-b-4 border-gray-700">
        {weekDays.map((day) => <div key={day} className="py-3 text-center"><span className="view-header-day text-xs tracking-widest">{day}</span></div>)}
      </div>
      <div className="grid grid-cols-7 flex-1 gap-1 p-2 bg-gray-400">
        {monthCalendar.map((day, index) => {
          const isToday = day.date.equals(today);
          const dayEvents = getEventsForDate(day.date);
          const dayTasks = getTasksForDate(day.date);
          return (
            <div key={index} onClick={(e) => { setPopupDate(day.date.toString()); setPopupPosition({ x: e.clientX, y: e.clientY }); setPopupOpen(true); }}
              className={`calendar-cell p-2 min-h-[90px] cursor-pointer ${!day.isInMonth ? 'calendar-cell-inactive' : ''} ${isToday ? 'calendar-today' : ''}`}>
              <span className={`day-badge text-sm ${isToday ? 'day-badge-today' : ''} ${!day.isInMonth ? 'opacity-40' : ''}`}>{day.date.day}</span>
              <div className="mt-2 space-y-1">
                {dayEvents.slice(0, 2).map(event => (
                  <div key={event.id} onClick={(e) => { e.stopPropagation(); setEditingEvent(event); setIsEventModalOpen(true); }}
                    className="event-chip text-white truncate cursor-pointer hover:opacity-90" style={{ backgroundColor: event.color }}>{event.title}</div>
                ))}
                {dayTasks.slice(0, 2).map(task => (
                  <div key={task.id} onClick={(e) => { e.stopPropagation(); setEditingTask(task); setIsTaskModalOpen(true); }}
                    className="task-chip cursor-pointer hover:bg-theme-secondary" style={{ borderLeftColor: task.priority === 'high' ? 'var(--accent-red)' : task.priority === 'medium' ? 'var(--accent-yellow)' : 'var(--accent-green)' }}>
                    <span className={task.completed ? 'line-through opacity-50' : ''}>{task.title}</span>
                  </div>
                ))}
                {(dayEvents.length + dayTasks.length) > 4 && <div className="text-[9px] text-theme-muted font-mono">+{dayEvents.length + dayTasks.length - 4} more</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Year View
function YearView() {
  const { displayedDate, setDisplayedDate, setView } = useCalendar();
  const today = Temporal.Now.plainDateISO();
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  const getMiniCalendar = (month: number) => {
    const startOfMonth = Temporal.PlainDate.from({ year: displayedDate.year, month, day: 1 });
    const monthLength = startOfMonth.daysInMonth;
    const dayOfWeekMonthStartedOn = startOfMonth.dayOfWeek - 1;
    const calendar: (number | null)[] = [];
    for (let i = 0; i < dayOfWeekMonthStartedOn; i++) calendar.push(null);
    for (let day = 1; day <= monthLength; day++) calendar.push(day);
    return calendar;
  };

  return (
    <div className="grid grid-cols-3 md:grid-cols-4 gap-4 p-4 overflow-y-auto h-full bg-theme-secondary">
      {monthNames.map((monthName, index) => {
        const month = index + 1;
        const miniCalendar = getMiniCalendar(month);
        const isCurrentMonth = today.year === displayedDate.year && today.month === month;
        return (
          <div key={monthName} onClick={() => { setDisplayedDate(Temporal.PlainDate.from({ year: displayedDate.year, month, day: 1 })); setView('month'); }}
            className={`panel-retro cursor-pointer hover:scale-[1.02] transition-transform ${isCurrentMonth ? 'ring-2 ring-amber-500' : ''}`}
            style={isCurrentMonth ? { boxShadow: '0 0 20px rgba(255, 176, 0, 0.3)' } : {}}>
            <h3 className={`text-sm font-display font-bold mb-3 tracking-widest ${isCurrentMonth ? 'text-amber-600' : 'text-theme-primary'}`}>{monthName}</h3>
            <div className="grid grid-cols-7 gap-px text-[10px]">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <div key={i} className="text-center text-theme-muted font-mono">{d}</div>)}
              {miniCalendar.map((day, i) => {
                const isToday = day !== null && today.year === displayedDate.year && today.month === month && today.day === day;
                return <div key={i} className={`text-center py-0.5 font-mono ${day === null ? '' : 'text-theme-secondary'} ${isToday ? 'day-badge-today rounded-full' : ''}`}>{day}</div>;
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Main Calendar
function Calendar() {
  const { view } = useCalendar();
  const renderView = () => {
    switch (view) {
      case 'day': return <DayView />;
      case 'week': return <WeekView />;
      case 'month': return <MonthView />;
      case 'year': return <YearView />;
      default: return <MonthView />;
    }
  };
  return <div className="flex flex-col h-full">{renderView()}</div>;
}

// Recall Button
function RecallButton() {
  const { displayedDate, view, goToToday } = useCalendar();
  const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const getDisplayValue = () => {
    switch (view) {
      case 'year': return 'TODAY';
      case 'month': return `${monthNames[displayedDate.month]} ${displayedDate.year}`;
      case 'week': return `${monthNames[displayedDate.month]} ${displayedDate.year}`;
      case 'day': return `${monthNames[displayedDate.month]} ${displayedDate.day}, ${displayedDate.year}`;
      default: return `${monthNames[displayedDate.month]} ${displayedDate.year}`;
    }
  };
  return <button className="display-readout text-sm  tracking-wider hover:bg-gray" onClick={goToToday}>{getDisplayValue()}</button>;
}

// View Toggle
function ViewToggle() {
  const { view, setView } = useCalendar();
  const views: Array<{ key: 'day' | 'week' | 'month' | 'year'; label: string }> = [
    { key: 'day', label: 'DAY' }, { key: 'week', label: 'WEEK' }, { key: 'month', label: 'MONTH' }, { key: 'year', label: 'YEAR' }
  ];
  return (
    <div className="toggle-group">
      {views.map(({ key, label }) => (
        <button key={key} className={`toggle-option ${view === key ? 'active' : ''}`} onClick={() => setView(key)}>{label}</button>
      ))}
    </div>
  );
}

// Navigation Buttons
function NavigationButtons() {
  const { next, previous } = useCalendar();
  return (
    <div className="flex gap-2">
      <button className="btn-capsule w-10 h-10 flex items-center text-3xl justify-center" onClick={previous}><ChevronLeft size={20} /> &lt;</button>
      <button className="btn-capsule w-10 h-10 flex items-center text-3xl justify-center" onClick={next}><ChevronRight size={20} />&gt;</button>
    </div>
  );
}

export { Calendar, RecallButton, ViewToggle, NavigationButtons };