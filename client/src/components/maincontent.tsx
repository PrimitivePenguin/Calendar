import React from 'react';
import { Plus } from 'lucide-react';
import Calendar from './calendar';

const MainContent = () => {
  return (
    <div className="flex-1 transition-all duration-300 bg-[#F3F5F7] px-3 h-[100vh] overflow-hidden">
      <div className="bg-white border-2 rounded-md border-[rgba(0,0,0,0.08)] h-[20vh] p-6 shadow-sm flex flex-col items-center justify-center">
        {/* Custom folder SVG */}
        <svg 
          width="120" 
          height="120" 
          viewBox="0 0 120 120" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="opacity-50"
        >
          <path 
            d="M20 35C20 31.6863 22.6863 29 26 29H47.1716C48.7335 29 50.2314 29.6321 51.3431 30.7438L58.6569 38.0576C59.7686 39.1693 61.2665 39.8014 62.8284 39.8014H94C97.3137 39.8014 100 42.4877 100 45.8014V85C100 88.3137 97.3137 91 94 91H26C22.6863 91 20 88.3137 20 85V35Z" 
            stroke="currentColor" 
            strokeWidth="2"
            className="text-[#3B40E8]"
          />
          <path 
            d="M20 45C20 42.7909 21.7909 41 24 41H96C98.2091 41 100 42.7909 100 45V85C100 88.3137 97.3137 91 94 91H26C22.6863 91 20 88.3137 20 85V45Z" 
            fill="currentColor"
            className="text-[#3B40E8]/10"
          />
          <circle 
            cx="60" 
            cy="66" 
            r="15" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeDasharray="4 4"
            className="text-[#3B40E8]"
          />
          <path 
            d="M60 61V71M55 66H65" 
            stroke="currentColor" 
            strokeWidth="2"
            className="text-[#3B40E8]"
          />
        </svg>

        {/* Text */}
        <p className="mt-4 text-sm text-gray-500">
          No files have been added yet
        </p>

        {/* Button */}
        <button className="mt-4 px-4 py-2 bg-[#3B40E8] text-white rounded-md text-sm hover:bg-[#3B40E8]/90 transition-colors duration-200 flex items-center gap-2">
          <Plus size={16} />
          <span>Add File</span>
        </button>
      </div>
      <div className="bg-white border-2 rounded-md border-[rgba(0,0,0,0.08)] h-[80vh] p-6 shadow-sm flex flex-col items-center justify-center">
        <Calendar />
      </div>

    </div>
    
  );
};

export default MainContent;