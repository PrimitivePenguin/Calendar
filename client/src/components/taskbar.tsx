import { Box, Calendar, MessageSquare, User, Wrench, Menu } from 'lucide-react';
import Sidebar from './sidebar';
interface TaskbarProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

const Taskbar = ({ isOpen, setIsOpen }: TaskbarProps) => {
  const navItems = [
    { title: 'Today', icon: Calendar },
    { title: '<' },
    { title: '>' },
    { title: 'This month', icon: Box },
    { title: 'Search', icon: Wrench },
  ];

  return (
    <div className="bg-white text-black text-sm border-b-2 border-[rgba(0,0,0,0.08)] px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left section: Menu and Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-[#F3F5F7] rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} strokeWidth={1.5} />
          </button>
          
          <h1 className="font-bold text-lg text-[#3B40E8]">
            Dashboard
          </h1>
        </div>

        {/* Right section: Navigation */}
        <nav className="flex gap-2">
          {navItems.map((item) => (
            <button
              key={item.title}
              className="px-4 py-2 hover:bg-[#F3F5F7] cursor-pointer flex items-center gap-2 rounded-lg transition-colors"
            >
              {item.icon && <item.icon size={20} strokeWidth={1.5} color="#000" />}
              <span className="whitespace-nowrap hidden md:inline">{item.title}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Taskbar;
