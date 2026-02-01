

import { Box, ChevronDown, Home, Menu, MessageSquare, User, Wrench, X , Calendar} from 'lucide-react';
import { useState } from 'react';

const Sidebar = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (value: boolean) => void }) =>  {
  const [activeDropdown, setActiveDropdown] = useState('');

  const navItems = [
    { title: 'Calendar', icon: Calendar, hasDropdown: true },
    { 
      title: 'Weekly Goal', 
      icon: User,
      hasDropdown: false
    },
    { 
      title: 'To-Do List', 
      icon: MessageSquare,
      hasDropdown: true, // access categories
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
      className={`bg-white text-black transition-all duration-300 ease-in-out text-sm border-2 rounded-md border-[rgba(0,0,0,0.08)]
        ${isOpen ? 'w-64' : 'w-16'}`}
    >
      <div className="p-4 flex justify-between items-center">
        <h1 className={`font-bold overflow-hidden transition-all duration-300 text-lg text-nowrap text-[#3B40E8]
          ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
          Dashboard
        </h1>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="hover:bg-[#F3F5F7] p-2 rounded-lg"
        >
          {isOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
        </button>
      </div>

      <nav className="mt-6">
        {navItems.map((item) => (
          <div key={item.title}>
            <div 
              className="px-4 py-3 hover:bg-[#F3F5F7] cursor-pointer flex items-center justify-between"
              onClick={() => item.hasDropdown && isOpen && setActiveDropdown(activeDropdown === item.title ? '' : item.title)}
            >
              <div className="flex items-center">
                <item.icon size={20} strokeWidth={1.5} color='#000' />
                <span className={`ml-4 whitespace-nowrap overflow-hidden transition-all duration-300
                  ${isOpen ? 'w-32 opacity-100' : 'w-0 opacity-0'}`}>
                  {item.title}
                </span>
              </div>
              {item.hasDropdown && isOpen && (
                <ChevronDown 
                  size={16} 
                  strokeWidth={1.5}
                  className={`transition-transform duration-200 
                    ${activeDropdown === item.title ? 'rotate-180' : ''}`}
                />
              )}
            </div>
            
            {item.hasDropdown && isOpen && activeDropdown === item.title && (
            <div className="bg-[#f5f5f5] overflow-hidden transition-all duration-200">
                {item.dropdownItems?.map((dropdownItem) => (
                    <div
                        key={dropdownItem}
                        className="px-11 py-2 hover:bg-[#f1f1f1] cursor-pointer text-sm"
                    >
                        {dropdownItem}
                    </div>
                ))}
            </div>  )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;