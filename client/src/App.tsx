


import { useState } from 'react'
import Sidebar from './components/sidebar';
import MainContent from './components/maincontent'
import Taskbar from './components/taskbar';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  return (
    <div className="h-screen bg-[#F3F5F7] flex flex-col overflow-hidden">
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
        <div className="flex-1 overflow-auto">
          <MainContent />
        </div>
      </div>
    </div>
  ) 
}

export default App