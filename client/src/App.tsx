import { useState } from 'react'
import Sidebar from './components/sidebar';
import MainContent from './components/maincontent'
import Taskbar from './components/taskbar';
import EventModal from './components/eventmodal';
import TaskModal from './components/taskmodal';
import { CalendarProvider } from './context/calendarcontext';
import { ThemeProvider } from './context/themecontext';
import './global.css'

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  return (
    <ThemeProvider>
      <CalendarProvider>
        <div className="h-screen bg-theme-primary flex flex-col overflow-hidden transition-colors duration-300">
          {/* Taskbar at top */}
          <div className="flex-none">
            <Taskbar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
          </div>
          
          {/* Main layout with sidebar and content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar */}
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isSidebarOpen ? 'w-64' : 'w-0'}`}>
              <div className="w-64 h-full">
                <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
              </div>
            </div>
            
            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
              <MainContent />
            </div>
          </div>
        </div>
        
        {/* Modals */}
        <EventModal />
        <TaskModal />
      </CalendarProvider>
    </ThemeProvider>
  ) 
}

export default App