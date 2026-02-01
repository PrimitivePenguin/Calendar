import React from 'react';
import { Calendar } from './calendar';

const MainContent = () => {
  return (
    <div className="h-full bg-[#F3F5F7] p-6 overflow-hidden">
      {/* Calendar Section */}
      <div className="bg-white h-full border-2 rounded-lg border-[rgba(0,0,0,0.08)] shadow-sm overflow-hidden">
        <Calendar />
      </div>
    </div>
  );
};

export default MainContent;