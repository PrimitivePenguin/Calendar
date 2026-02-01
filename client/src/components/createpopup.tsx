import React from 'react';
import { Calendar, CheckSquare } from 'lucide-react';
import { useCalendar } from '../context/calendarcontext';

interface CreatePopupProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  selectedDate: string;
}

const CreatePopup = ({ isOpen, onClose, position, selectedDate }: CreatePopupProps) => {
  const {
    setIsEventModalOpen,
    setIsTaskModalOpen,
    setEditingEvent,
    setEditingTask,
    setSelectedDate,
  } = useCalendar();

  if (!isOpen) return null;

  const handleCreateEvent = () => {
    setSelectedDate(selectedDate);
    setEditingEvent(null);
    setIsEventModalOpen(true);
    onClose();
  };

  const handleCreateTask = () => {
    setSelectedDate(selectedDate);
    setEditingTask(null);
    setIsTaskModalOpen(true);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
      
      {/* Popup */}
      <div
        className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[140px]"
        style={{ left: position.x, top: position.y }}
      >
        <button
          onClick={handleCreateEvent}
          className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 flex items-center gap-2"
        >
          <Calendar size={16} className="text-blue-500" />
          New Event
        </button>
        <button
          onClick={handleCreateTask}
          className="w-full px-4 py-2 text-left text-sm hover:bg-green-50 flex items-center gap-2"
        >
          <CheckSquare size={16} className="text-green-500" />
          New Task
        </button>
      </div>
    </>
  );
};

export default CreatePopup;