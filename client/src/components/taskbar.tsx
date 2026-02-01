import { Menu, Search } from 'lucide-react';
import { RecallButton, ViewToggle, NavigationButtons } from './calendar';

interface TaskbarProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

const Taskbar = ({ isOpen, setIsOpen }: TaskbarProps) => {
  return (
    <div className="bg-white text-black text-sm border-b-2 border-[rgba(0,0,0,0.08)] px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left section: Menu, Title, Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-[#F3F5F7] rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} strokeWidth={1.5} />
          </button>
          
          <h1 className="font-bold text-lg text-[#3B40E8]">
            Calendar
          </h1>
          
          {/* Navigation buttons (prev/next) */}
          <NavigationButtons />
          
          {/* Recall button - shows current date and resets to today */}
          <RecallButton />
        </div>

        {/* Center section: View Toggle */}
        <div className="flex items-center">
          <ViewToggle />
        </div>

        {/* Right section: Search */}
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 hover:bg-[#F3F5F7] cursor-pointer flex items-center gap-2 rounded-lg transition-colors">
            <Search size={20} strokeWidth={1.5} color="#000" />
            <span className="whitespace-nowrap hidden md:inline">Search</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Taskbar;

