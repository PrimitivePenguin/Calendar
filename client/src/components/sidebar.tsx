import { Box, ChevronDown, Calendar, MessageSquare, User, Wrench } from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const [activeDropdown, setActiveDropdown] = useState('');

  const navItems = [
    { title: 'Calendar', icon: Calendar, hasDropdown: true, dropdownItems: ['Day', 'Week', 'Month', 'Year'] },
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
      dropdownItems: ['Preferences', 'Security', 'Notifications']
    }
  ];

  return (
    <div 
      className={`bg-white text-black border-r-2 border-[rgba(0,0,0,0.08)] h-full overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'opacity-50' : 'opacity-0'}`}
    >
      <div className="p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Navigation
        </h2>
      </div>

      <nav className="px-2">
        {navItems.map((item) => (
          <div key={item.title}>
            <button 
              className="w-full px-4 py-3 hover:bg-[#F3F5F7] rounded-lg cursor-pointer flex items-center justify-between transition-colors"
              onClick={() => {
                if (item.hasDropdown) {
                  setActiveDropdown(activeDropdown === item.title ? '' : item.title);
                }
              }}
            >
              <div className="flex items-center gap-3">
                <item.icon size={20} strokeWidth={1.5} color='#000' />
                <span className="whitespace-nowrap text-sm font-medium">
                  {item.title}
                </span>
              </div>
              {item.hasDropdown && (
                <ChevronDown 
                  size={16} 
                  strokeWidth={1.5}
                  className={`transition-transform duration-200 ${activeDropdown === item.title ? 'rotate-180' : ''}`}
                />
              )}
            </button>
            
            {item.hasDropdown && activeDropdown === item.title && (
              <div className="overflow-hidden transition-all duration-200 mb-2">
                {item.dropdownItems?.map((dropdownItem) => (
                  <button
                    key={dropdownItem}
                    className="w-full px-12 py-2 hover:bg-[#F3F5F7] rounded-lg cursor-pointer text-sm text-gray-600 text-left transition-colors"
                  >
                    {dropdownItem}
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
