import React, { useState, useEffect } from 'react';
import { X, Target, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { useCalendar } from '../context/calendarcontext';

const TaskModal = () => {
  const {
    isTaskModalOpen,
    setIsTaskModalOpen,
    editingTask,
    setEditingTask,
    addTask,
    updateTask,
    deleteTask,
    selectedDate,
  } = useCalendar();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description);
      setDueDate(editingTask.dueDate.slice(0, 16));
      setPriority(editingTask.priority);
    } else if (selectedDate) {
      setDueDate(`${selectedDate}T17:00`);
      resetOtherFields();
    } else {
      resetForm();
    }
  }, [editingTask, selectedDate, isTaskModalOpen]);

  const resetOtherFields = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setPriority('medium');
  };

  const handleClose = () => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const taskData = {
      title,
      description,
      dueDate: new Date(dueDate).toISOString(),
      priority,
    };

    if (editingTask) {
      await updateTask(editingTask.id, taskData);
    } else {
      await addTask(taskData);
    }
    
    handleClose();
  };

  const handleDelete = async () => {
    if (editingTask && window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(editingTask.id);
      handleClose();
    }
  };

  const priorities = [
    { 
      value: 'low' as const, 
      label: 'LOW', 
      icon: CheckCircle,
      color: 'var(--accent-green)',
      bgClass: 'from-green-100 to-green-200',
      borderClass: 'border-green-500',
      textClass: 'text-green-700'
    },
    { 
      value: 'medium' as const, 
      label: 'MED', 
      icon: AlertCircle,
      color: 'var(--accent-yellow)',
      bgClass: 'from-yellow-100 to-yellow-200',
      borderClass: 'border-yellow-500',
      textClass: 'text-yellow-700'
    },
    { 
      value: 'high' as const, 
      label: 'HIGH', 
      icon: AlertTriangle,
      color: 'var(--accent-red)',
      bgClass: 'from-red-100 to-red-200',
      borderClass: 'border-red-500',
      textClass: 'text-red-700'
    },
  ];

  if (!isTaskModalOpen) return null;

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
            <div className="status-light status-green status-light-on" />
            <h2 className="text-lg">
              {editingTask ? 'Edit Task' : 'New Task'}
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
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="input-retro w-full"
              placeholder="ENTER OBJECTIVE..."
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
              placeholder="OBJECTIVE DETAILS..."
              rows={3}
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-display tracking-widest text-theme-secondary mb-2 uppercase">
              Deadline <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
              className="input-retro w-full"
            />
          </div>

          {/* Priority Selection */}
          <div>
            <label className="block text-xs font-display tracking-widest text-theme-secondary mb-3 uppercase">
              Priority Level
            </label>
            <div className="flex gap-3">
              {priorities.map((p) => {
                const Icon = p.icon;
                const isSelected = priority === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriority(p.value)}
                    className={`flex-1 py-4 rounded-2xl border-3 transition-all duration-200 flex flex-col items-center gap-2 ${
                      isSelected
                        ? `bg-gradient-to-b ${p.bgClass} ${p.borderClass} ${p.textClass} shadow-lg scale-105`
                        : 'bg-gray-100 border-gray-300 text-gray-500 hover:bg-gray-200'
                    }`}
                    style={isSelected ? { boxShadow: `0 0 15px ${p.color}40` } : {}}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isSelected ? 'bg-white/50' : 'bg-gray-200'
                    }`}>
                      <Icon size={20} strokeWidth={2.5} />
                    </div>
                    <span className="text-xs font-display tracking-wider">{p.label}</span>
                    {/* Indicator light */}
                    <div 
                      className={`w-3 h-3 rounded-full border-2 ${
                        isSelected 
                          ? `${p.borderClass} animate-pulse` 
                          : 'border-gray-400 bg-gray-300'
                      }`}
                      style={isSelected ? { backgroundColor: p.color, boxShadow: `0 0 8px ${p.color}` } : {}}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t-2 border-gray-300">
            {editingTask && (
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
              <Target size={14} />
              {editingTask ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;