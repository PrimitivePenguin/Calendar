"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { Temporal } from "@js-temporal/polyfill";
import { useCalendar, CalendarEvent, Task } from '../context/calendarcontext';

// Helper to get week start (Monday)
function getWeekStart(date: Temporal.PlainDate): Temporal.PlainDate {
  const dayOfWeek = date.dayOfWeek; // 1 = Monday, 7 = Sunday
  return date.subtract({ days: dayOfWeek - 1 });
}

// Helper to calculate event position and dimensions
interface PositionedEvent extends CalendarEvent {
  top: number;      // pixels from top of day
  height: number;   // height in pixels
  left: number;     // percentage from left (0-100)
  width: number;    // percentage width
  column: number;   // which column this event is in
}

function getEventPositions(events: CalendarEvent[], date: Temporal.PlainDate, hourHeight: number = 60): PositionedEvent[] {
  const dateStr = date.toString();
  
  // Filter events that occur on this date
  const dayEvents = events.filter(event => {
    const startDate = event.startDate.slice(0, 10);
    const endDate = event.endDate.slice(0, 10);
    return startDate <= dateStr && endDate >= dateStr;
  });

  if (dayEvents.length === 0) return [];

  // Calculate position for each event
  const positioned: PositionedEvent[] = dayEvents.map(event => {
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);
    const dayStart = new Date(`${dateStr}T00:00:00`);
    const dayEnd = new Date(`${dateStr}T23:59:59`);

    // Clamp to current day
    const displayStart = eventStart < dayStart ? dayStart : eventStart;
    const displayEnd = eventEnd > dayEnd ? dayEnd : eventEnd;

    const startHour = displayStart.getHours() + displayStart.getMinutes() / 60;
    const endHour = displayEnd.getHours() + displayEnd.getMinutes() / 60 + (displayEnd > dayEnd ? 0 : 0);
    
    // If event ends at midnight or spans to next day, show until end of day
    const effectiveEndHour = eventEnd > dayEnd ? 24 : endHour;

    const top = startHour * hourHeight;
    const height = Math.max((effectiveEndHour - startHour) * hourHeight, hourHeight / 2); // minimum height

    return {
      ...event,
      top,
      height,
      left: 0,
      width: 100,
      column: 0,
    };
  });

  // Sort by start time, then by duration (longer first)
  positioned.sort((a, b) => {
    if (a.top !== b.top) return a.top - b.top;
    return b.height - a.height;
  });

  // Find overlapping events and assign columns
  const columns: PositionedEvent[][] = [];

  positioned.forEach(event => {
    // Find a column where this event doesn't overlap
    let placed = false;
    for (let i = 0; i < columns.length; i++) {
      const column = columns[i];
      const overlaps = column.some(other => {
        const otherEnd = other.top + other.height;
        const eventEnd = event.top + event.height;
        return !(event.top >= otherEnd || eventEnd <= other.top);
      });

      if (!overlaps) {
        column.push(event);
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

  // Calculate width and left position based on columns
  const totalColumns = columns.length;
  positioned.forEach(event => {
    event.width = 100 / totalColumns;
    event.left = event.column * event.width;
  });

  return positioned;
}


// Day View Component
function DayView() {
  const {
    displayedDate,
    events,
    tasks,
    setIsEventModalOpen,
    setIsTaskModalOpen,
    setEditingEvent,
    setEditingTask,
    setSelectedDate,
  } = useCalendar();
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const hourHeight = 60; // pixels per hour

  // Popup state
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [popupDate, setPopupDate] = useState('');

  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
  };

  const isToday = displayedDate.equals(Temporal.Now.plainDateISO());

  // Get positioned events for this day
  const positionedEvents = useMemo(() => {
    return getEventPositions(events, displayedDate, hourHeight);
  }, [events, displayedDate]);

  // Get tasks for the displayed date
  const dayTasks = tasks.filter(task => {
    const taskDate = task.dueDate.slice(0, 10);
    return taskDate === displayedDate.toString();
  });

  // Get hour from ISO date string
  const getEventHour = (dateStr: string) => {
    return new Date(dateStr).getHours();
  };

  // Click on hour slot to show popup
  const handleHourClick = (hour: number, e: React.MouseEvent) => {
    const hourStr = hour.toString().padStart(2, '0');
    setPopupDate(`${displayedDate.toString()}T${hourStr}:00`);
    setPopupPosition({ x: e.clientX, y: e.clientY });
    setPopupOpen(true);
  };

  const handleCreateEvent = () => {
    setSelectedDate(popupDate);
    setEditingEvent(null);
    setIsEventModalOpen(true);
    setPopupOpen(false);
  };

  const handleCreateTask = () => {
    setSelectedDate(popupDate);
    setEditingTask(null);
    setIsTaskModalOpen(true);
    setPopupOpen(false);
  };

  // Click on event to edit
  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingEvent(event);
    setIsEventModalOpen(true);
  };

  // Click on task to edit
  const handleTaskClick = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Popup for choosing event or task */}
      {popupOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setPopupOpen(false)} />
          <div
            className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[140px]"
            style={{ left: popupPosition.x, top: popupPosition.y }}
          >
            <button
              onClick={handleCreateEvent}
              className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 flex items-center gap-2"
            >
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              New Event
            </button>
            <button
              onClick={handleCreateTask}
              className="w-full px-4 py-2 text-left text-sm hover:bg-green-50 flex items-center gap-2"
            >
              <span className="w-3 h-3 rounded-full bg-green-500" />
              New Task
            </button>
          </div>
        </>
      )}

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
        <div className="flex">
          {/* Time gutter */}
          <div className="w-20 flex-shrink-0">
            {hours.map((hour) => (
              <div key={hour} className="h-[60px] text-right pr-3 py-2 text-sm text-gray-500 bg-gray-50 border-b border-gray-100">
                {formatHour(hour)}
              </div>
            ))}
          </div>
          
          {/* Events column */}
          <div className="flex-1 relative border-l border-gray-200">
            {/* Hour grid lines */}
            {hours.map((hour) => {
              const hourTasks = dayTasks.filter(t => getEventHour(t.dueDate) === hour);
              return (
                <div 
                  key={hour} 
                  onClick={(e) => handleHourClick(hour, e)}
                  className="h-[60px] border-b border-gray-100 hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  {/* Tasks at this hour (not positioned like events) */}
                  {hourTasks.map(task => (
                    <div
                      key={task.id}
                      onClick={(e) => handleTaskClick(task, e)}
                      className={`text-xs px-2 py-1 mx-1 rounded mb-1 truncate border-l-2 bg-gray-100 cursor-pointer hover:bg-gray-200 ${
                        task.completed ? 'line-through text-gray-400' : 'text-gray-700'
                      } ${
                        task.priority === 'high' ? 'border-red-500' :
                        task.priority === 'medium' ? 'border-yellow-500' : 'border-green-500'
                      }`}
                    >
                      {task.title}
                    </div>
                  ))}
                </div>
              );
            })}
            
            {/* Positioned events overlay */}
            {positionedEvents.map(event => (
              <div
                key={event.id}
                onClick={(e) => handleEventClick(event, e)}
                className="absolute text-xs px-2 py-1 rounded text-white cursor-pointer hover:opacity-90 overflow-hidden border-l-2 border-white/30"
                style={{
                  backgroundColor: event.color,
                  top: `${event.top}px`,
                  height: `${event.height}px`,
                  left: `${event.left}%`,
                  width: `calc(${event.width}% - 4px)`,
                  marginLeft: '2px',
                }}
              >
                <div className="font-medium truncate">{event.title}</div>
                {event.height > 40 && (
                  <div className="text-xs opacity-80 truncate">
                    {new Date(event.startDate).toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })}
                    {' - '}
                    {new Date(event.endDate).toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Week View Component
function WeekView() {
  const {
    displayedDate,
    events,
    tasks,
    setIsEventModalOpen,
    setIsTaskModalOpen,
    setEditingEvent,
    setEditingTask,
    setSelectedDate,
  } = useCalendar();
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const weekStart = getWeekStart(displayedDate);
  const days = Array.from({ length: 7 }, (_, i) => weekStart.add({ days: i }));
  const today = Temporal.Now.plainDateISO();
  const hourHeight = 50; // pixels per hour

  // Popup state
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [popupDate, setPopupDate] = useState('');

  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
  };

  // Get positioned events for each day
  const positionedEventsByDay = useMemo(() => {
    const result: { [key: string]: PositionedEvent[] } = {};
    days.forEach(day => {
      result[day.toString()] = getEventPositions(events, day, hourHeight);
    });
    return result;
  }, [events, days.map(d => d.toString()).join(',')]);

  // Get tasks for a specific date
  const getTasksForDate = (date: Temporal.PlainDate) => {
    return tasks.filter(task => {
      const taskDate = task.dueDate.slice(0, 10);
      return taskDate === date.toString();
    });
  };

  // Get hour from ISO date string
  const getEventHour = (dateStr: string) => {
    return new Date(dateStr).getHours();
  };

  // Click on time slot to show popup
  const handleSlotClick = (date: Temporal.PlainDate, hour: number, e: React.MouseEvent) => {
    const hourStr = hour.toString().padStart(2, '0');
    setPopupDate(`${date.toString()}T${hourStr}:00`);
    setPopupPosition({ x: e.clientX, y: e.clientY });
    setPopupOpen(true);
  };

  const handleCreateEvent = () => {
    setSelectedDate(popupDate);
    setEditingEvent(null);
    setIsEventModalOpen(true);
    setPopupOpen(false);
  };

  const handleCreateTask = () => {
    setSelectedDate(popupDate);
    setEditingTask(null);
    setIsTaskModalOpen(true);
    setPopupOpen(false);
  };

  // Click on event to edit
  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingEvent(event);
    setIsEventModalOpen(true);
  };

  // Click on task to edit
  const handleTaskClick = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Popup for choosing event or task */}
      {popupOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setPopupOpen(false)} />
          <div
            className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[140px]"
            style={{ left: popupPosition.x, top: popupPosition.y }}
          >
            <button
              onClick={handleCreateEvent}
              className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 flex items-center gap-2"
            >
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              New Event
            </button>
            <button
              onClick={handleCreateTask}
              className="w-full px-4 py-2 text-left text-sm hover:bg-green-50 flex items-center gap-2"
            >
              <span className="w-3 h-3 rounded-full bg-green-500" />
              New Task
            </button>
          </div>
        </>
      )}

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
        <div className="flex">
          {/* Time gutter */}
          <div className="w-20 flex-shrink-0">
            {hours.map((hour) => (
              <div key={hour} className="h-[50px] text-right pr-3 py-1 text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                {formatHour(hour)}
              </div>
            ))}
          </div>
          
          {/* Day columns */}
          {days.map((day, dayIndex) => {
            const dayTasks = getTasksForDate(day);
            const positionedEvents = positionedEventsByDay[day.toString()] || [];
            
            return (
              <div key={dayIndex} className="flex-1 relative border-l border-gray-200">
                {/* Hour grid lines */}
                {hours.map((hour) => {
                  const hourTasks = dayTasks.filter(t => getEventHour(t.dueDate) === hour);
                  return (
                    <div 
                      key={hour} 
                      onClick={(e) => handleSlotClick(day, hour, e)}
                      className="h-[50px] border-b border-gray-100 hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      {/* Tasks at this hour */}
                      {hourTasks.map(task => (
                        <div
                          key={task.id}
                          onClick={(e) => handleTaskClick(task, e)}
                          className={`text-xs px-1 py-0.5 mx-0.5 rounded truncate border-l-2 bg-gray-100 cursor-pointer hover:bg-gray-200 ${
                            task.completed ? 'line-through text-gray-400' : 'text-gray-700'
                          } ${
                            task.priority === 'high' ? 'border-red-500' :
                            task.priority === 'medium' ? 'border-yellow-500' : 'border-green-500'
                          }`}
                        >
                          {task.title}
                        </div>
                      ))}
                    </div>
                  );
                })}
                
                {/* Positioned events overlay */}
                {positionedEvents.map(event => (
                  <div
                    key={event.id}
                    onClick={(e) => handleEventClick(event, e)}
                    className="absolute text-xs px-1 py-0.5 rounded text-white cursor-pointer hover:opacity-90 overflow-hidden"
                    style={{
                      backgroundColor: event.color,
                      top: `${event.top}px`,
                      height: `${event.height}px`,
                      left: `${event.left}%`,
                      width: `calc(${event.width}% - 2px)`,
                      marginLeft: '1px',
                    }}
                  >
                    <div className="font-medium truncate text-[10px]">{event.title}</div>
                    {event.height > 30 && (
                      <div className="text-[9px] opacity-80 truncate">
                        {new Date(event.startDate).toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })}
                      </div>
                    )}
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


// Month View Component
function MonthView() {
  const {
    displayedDate,
    events,
    tasks,
    setIsEventModalOpen,
    setIsTaskModalOpen,
    setEditingEvent,
    setEditingTask,
    setSelectedDate,
  } = useCalendar();
  const [monthCalendar, setMonthCalendar] = useState<{ date: Temporal.PlainDate; isInMonth: boolean }[]>([]);
  const today = Temporal.Now.plainDateISO();
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [popupDate, setPopupDate] = useState('');

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

  const getEventsForDate = (date: Temporal.PlainDate) => {
    return events.filter(event => event.startDate.slice(0, 10) === date.toString());
  };

  const getTasksForDate = (date: Temporal.PlainDate) => {
    return tasks.filter(task => task.dueDate.slice(0, 10) === date.toString());
  };

  const handleDayClick = (date: Temporal.PlainDate, e: React.MouseEvent) => {
    setPopupDate(date.toString());
    setPopupPosition({ x: e.clientX, y: e.clientY });
    setPopupOpen(true);
  };

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingEvent(event);
    setIsEventModalOpen(true);
  };

  const handleTaskClick = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleCreateEvent = () => {
    setSelectedDate(popupDate);
    setEditingEvent(null);
    setIsEventModalOpen(true);
    setPopupOpen(false);
  };

  const handleCreateTask = () => {
    setSelectedDate(popupDate);
    setEditingTask(null);
    setIsTaskModalOpen(true);
    setPopupOpen(false);
  };
  return (
    
    <div className="flex flex-col h-full">
      {popupOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setPopupOpen(false)} />
          <div
            className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[140px]"
            style={{ left: popupPosition.x, top: popupPosition.y }}
          >
            <button
              onClick={handleCreateEvent}
              className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 flex items-center gap-2"
            >
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              New Event
            </button>
            <button
              onClick={handleCreateTask}
              className="w-full px-4 py-2 text-left text-sm hover:bg-green-50 flex items-center gap-2"
            >
              <span className="w-3 h-3 rounded-full bg-green-500" />
              New Task
            </button>
          </div>
        </>
      )}

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
          const dayEvents = getEventsForDate(day.date);
          const dayTasks = getTasksForDate(day.date);
          
          return (
            <div
              key={index}
              onClick={(e) => handleDayClick(day.date, e)}
              className={`border-b border-r border-gray-100 p-2 min-h-[80px] hover:bg-blue-50 transition-colors cursor-pointer
                ${day.isInMonth ? 'bg-white' : 'bg-gray-50'}`}
            >
              <span className={`inline-flex items-center justify-center w-7 h-7 text-sm
                ${isToday ? 'bg-blue-500 text-white rounded-full' : ''}
                ${!day.isInMonth ? 'text-gray-400' : 'text-gray-700'}`}
              >
                {day.date.day}
              </span>
              
              {/* Events and Tasks */}
              <div className="mt-1 space-y-1">
                {dayEvents.slice(0, 2).map(event => (
                  <div
                    key={event.id}
                    onClick={(e) => handleEventClick(event, e)}
                    className="text-xs px-1 py-0.5 rounded truncate text-white cursor-pointer hover:opacity-80"
                    style={{ backgroundColor: event.color }}
                  >
                    {event.title}
                  </div>
                ))}
                {dayTasks.slice(0, 2).map(task => (
                  <div
                    key={task.id}
                    onClick={(e) => handleTaskClick(task, e)}
                    className={`text-xs px-1 py-0.5 rounded truncate border-l-2 bg-gray-100 cursor-pointer hover:bg-gray-200 ${
                      task.completed ? 'line-through text-gray-400' : 'text-gray-700'
                    } ${
                      task.priority === 'high' ? 'border-red-500' :
                      task.priority === 'medium' ? 'border-yellow-500' : 'border-green-500'
                    }`}
                  >
                    {task.title}
                  </div>
                ))}
                {(dayEvents.length + dayTasks.length) > 4 && (
                  <div className="text-xs text-gray-500">
                    +{dayEvents.length + dayTasks.length - 4} more
                  </div>
                )}
              </div>
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