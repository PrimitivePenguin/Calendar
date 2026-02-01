import React, { useState, useEffect } from 'react';
import { X, Zap } from 'lucide-react';
import { useCalendar } from '../context/calendarcontext';
import { toLocalDateTimeString, toISOString } from '../config/timezone';

const EventModal = () => {
  const {
    isEventModalOpen,
    setIsEventModalOpen,
    editingEvent,
    setEditingEvent,
    addEvent,
    updateEvent,
    deleteEvent,
    selectedDate,
  } = useCalendar();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [color, setColor] = useState('#3788d8');

  const colors = [
    { name: 'blue', value: 'var(--accent-blue)', label: 'BLUE' },
    { name: 'green', value: 'var(--accent-green)', label: 'GRN' },
    { name: 'red', value: 'var(--accent-red)', label: 'RED' },
    { name: 'yellow', value: 'var(--accent-yellow)', label: 'YLW' },
    { name: 'purple', value: 'var(--accent-purple)', label: 'PRP' },
  ];

  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title);
      setDescription(editingEvent.description);
      setStartDate(toLocalDateTimeString(editingEvent.startDate));
      setEndDate(toLocalDateTimeString(editingEvent.endDate));
      setAllDay(editingEvent.allDay);
      setColor(editingEvent.color);
    } else if (selectedDate) {
      setStartDate(`${selectedDate}T09:00`);
      setEndDate(`${selectedDate}T10:00`);
      resetOtherFields();
    } else {
      resetForm();
    }
  }, [editingEvent, selectedDate, isEventModalOpen]);

  const resetOtherFields = () => {
    setTitle('');
    setDescription('');
    setAllDay(false);
    setColor('var(--accent-blue)');
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    setAllDay(false);
    setColor('var(--accent-blue)');
  };

  const handleClose = () => {
    setIsEventModalOpen(false);
    setEditingEvent(null);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const eventData = {
      title,
      description,
      startDate: toISOString(startDate),
      endDate: toISOString(endDate),
      allDay,
      color,
    };

    if (editingEvent) {
      await updateEvent(editingEvent.id, eventData);
    } else {
      await addEvent(eventData);
    }
    
    handleClose();
  };

  const handleDelete = async () => {
    if (editingEvent && window.confirm('Are you sure you want to delete this event?')) {
      await deleteEvent(editingEvent.id);
      handleClose();
    }
  };

  if (!isEventModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="modal-retro w-full max-w-md mx-4 relative">
        {/* Decorative corner rivets */}
        <div className="absolute top-4 left-4 w-3 h-3 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 border-2 border-gray-700 z-10" />
        <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 border-2 border-gray-700 z-10" />
        <div className="absolute bottom-4 left-4 w-3 h-3 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 border-2 border-gray-700 z-10" />
        <div className="absolute bottom-4 right-4 w-3 h-3 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 border-2 border-gray-700 z-10" />

        {/* Header */}
        <div className="modal-retro-header flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="status-light status-blue status-light-on" />
            <h2 className="text-lg">
              {editingEvent ? 'Edit Event' : 'New Event'}
            </h2>
          </div>
          <button 
            onClick={handleClose} 
            className="w-8 h-8 rounded-lg bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors border-2 border-gray-500"
          >
            <X size={16} className="text-gray-300" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title Input */}
          <div>
            <label className="block text-xs font-display tracking-widest text-theme-secondary mb-2 uppercase">
              Event Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="input-retro w-full"
              placeholder="ENTER MISSION NAME..."
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-display tracking-widest text-theme-secondary mb-2 uppercase">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-retro w-full resize-none"
              placeholder="MISSION DETAILS..."
              rows={3}
            />
          </div>

          {/* Date/Time Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-display tracking-widest text-theme-secondary mb-2 uppercase">
                Launch <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="input-retro w-full text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-display tracking-widest text-theme-secondary mb-2 uppercase">
                End <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="input-retro w-full text-sm"
              />
            </div>
          </div>

          {/* All Day Toggle */}
          <div className="flex items-center gap-3 p-3 border-inset rounded-xl bg-gray-100">
            <button
              type="button"
              onClick={() => setAllDay(!allDay)}
              className={`w-12 h-7 rounded-full transition-all duration-200 relative ${
                allDay 
                  ? 'bg-gradient-to-b from-amber-400 to-amber-600' 
                  : 'bg-gray-400'
              }`}
              style={allDay ? { boxShadow: '0 0 12px rgba(255, 176, 0, 0.5)' } : {}}
            >
              <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-200 ${
                allDay ? 'left-6' : 'left-1'
              }`} />
            </button>
            <label className="text-sm font-body text-theme-primary">
              All Day Event
            </label>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-xs font-display tracking-widest text-theme-secondary mb-3 uppercase">
              Color Code
            </label>
            <div className="flex gap-2">
              {colors.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`flex-1 py-3 rounded-xl border-3 transition-all duration-150 flex flex-col items-center gap-1 ${
                    color === c.value 
                      ? 'border-white shadow-lg scale-105' 
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                  style={{ 
                    backgroundColor: c.value,
                    boxShadow: color === c.value ? `0 0 15px ${c.value}40` : 'none'
                  }}
                >
                  <div className={`w-4 h-4 rounded-full border-2 border-white/50 ${
                    color === c.value ? 'bg-white' : 'bg-transparent'
                  }`} />
                  <span className="text-[10px] font-mono text-white/80">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t-2 border-gray-300">
            {editingEvent && (
              <button
                type="button"
                onClick={handleDelete}
                className="btn-retro text-sm bg-gradient-to-b from-red-100 to-red-200 text-red-700 border-red-400 hover:from-red-200 hover:to-red-300"
              >
                Delete
              </button>
            )}
            <div className="flex-1" />
            <button
              type="button"
              onClick={handleClose}
              className="btn-capsule"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-retro btn-retro-active flex items-center gap-2"
            >
              <Zap size={14} />
              {editingEvent ? 'Update' : 'Launch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;