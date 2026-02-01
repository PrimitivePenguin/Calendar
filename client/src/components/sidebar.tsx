import { Box, ChevronDown, Calendar, MessageSquare, User, Wrench, Check, Radio } from 'lucide-react';
import { useState } from 'react';
import { useCalendar } from '../context/calendarcontext';
import { useTheme } from '../context/themecontext';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const [activeDropdown, setActiveDropdown] = useState('');
  const { setView, goToToday } = useCalendar();
  const { theme, setTheme } = useTheme();

  const handleCalendarViewChange = (viewType: string) => {
    const view = viewType.toLowerCase() as 'day' | 'week' | 'month' | 'year';
    setView(view);
    goToToday();
  };

  const handleThemeChange = (themeName: string) => {
    if (themeName === 'Classic') {
      setTheme('classic');
    } else if (themeName === 'Into the Future') {
      setTheme('future');
    }
  };

  const navItems = [
    { 
      title: 'Calendar', 
      icon: Calendar, 
      hasDropdown: true, 
      dropdownItems: ['Day', 'Week', 'Month', 'Year'],
      onDropdownClick: handleCalendarViewChange
    },
    { 
      title: 'Weekly Goal', 
      icon: User,
      hasDropdown: false
    },
    { 
      title: 'To-Do List', 
      icon: MessageSquare,
      hasDropdown: true,
      dropdownItems: ['Inbox', 'Sent', 'Drafts', 'Archived']
    },
    { title: 'Analytics', icon: Box, hasDropdown: false },
    {
      title: 'Settings',
      icon: Wrench,
      hasDropdown: true,
      dropdownItems: ['Classic', 'Into the Future'],
      onDropdownClick: handleThemeChange,
      isThemeSelector: true
    }
  ];

  const getThemeLabel = (item: string) => {
    if (item === 'Classic') return theme === 'classic';
    if (item === 'Into the Future') return theme === 'future';
    return false;
  };

  return (
    <div 
      className={`sidebar-retro h-full overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* Decorative screws/rivets */}
      <div className="relative">
        <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 border border-gray-700" />
        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 border border-gray-700" />
      </div>

      {/* Header Section */}
      <div className="p-6 pt-8">
        <div className="display-readout text-center mb-4">
          <span className="text-xs tracking-[0.2em] uppercase">Navigation</span>
        </div>
        {/* Status indicator row */}
        <div className="flex justify-center gap-3 mt-3">
          <div className="flex items-center gap-2">
            <div className="status-light status-green status-light-on" />
            <span className="text-xs font-mono text-theme-secondary">SYS</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="status-light status-blue status-light-on" />
            <span className="text-xs font-mono text-theme-secondary">NET</span>
          </div>
        </div>
      </div>

      <nav className="px-3">
        {navItems.map((item) => (
          <div key={item.title} className="mb-2">
            <button 
              className="sidebar-item w-full flex items-center justify-between group"
              onClick={() => {
                if (item.hasDropdown) {
                  setActiveDropdown(activeDropdown === item.title ? '' : item.title);
                }
              }}
            >
              <div className="flex items-center gap-3">
                {/* Icon container with instrument bezel */}
                <div className="w-8 h-8 rounded-lg border-2 border-gray-400 bg-gradient-to-b from-gray-200 to-gray-300 flex items-center justify-center shadow-sm">
                  <item.icon size={16} strokeWidth={2} className="text-gray-700" />
                </div>
                <span className="font-display text-sm font-medium tracking-wide uppercase">
                  {item.title}
                </span>
              </div>
              {item.hasDropdown && (
                <div className={`w-6 h-6 rounded-full border-2 border-gray-400 bg-gray-200 flex items-center justify-center transition-transform duration-200 ${activeDropdown === item.title ? 'rotate-180' : ''}`}>
                  <ChevronDown size={12} strokeWidth={2.5} className="text-gray-600" />
                </div>
              )}
            </button>
            
            {item.hasDropdown && activeDropdown === item.title && (
              <div className="ml-4 mt-2 overflow-hidden border-l-4 border-gray-400 pl-4">
                {item.dropdownItems?.map((dropdownItem, idx) => (
                  <button
                    key={dropdownItem}
                    className="w-full py-2 px-3 rounded-xl text-sm text-left font-body tracking-wide 
                             hover:bg-gray-200 transition-colors flex items-center justify-between
                             text-theme-secondary hover:text-theme-primary"
                    onClick={() => {
                      if (item.onDropdownClick) {
                        item.onDropdownClick(dropdownItem);
                      }
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <Radio size={10} className="text-gray-400" />
                      {dropdownItem}
                    </span>
                    {item.isThemeSelector && getThemeLabel(dropdownItem) && (
                      <div className="w-5 h-5 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 flex items-center justify-center shadow-md"
                           style={{ boxShadow: '0 0 8px rgba(255, 176, 0, 0.5)' }}>
                        <Check size={12} className="text-black" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>


    </div>
  );
};

export default Sidebar;