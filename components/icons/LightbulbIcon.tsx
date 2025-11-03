import React from 'react';

export const LightbulbIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.311a7.5 7.5 0 01-7.5 0c-1.255 0-2.42-.157-3.548-.437m14.596 0c-1.128.28-2.293.437-3.548.437a7.5 7.5 0 01-7.5 0m14.596 0A11.956 11.956 0 0012 13.5a11.956 11.956 0 00-7.298 2.684m14.596 0A7.49 7.49 0 0112 18c-2.083 0-3.977-.85-5.32-2.202m10.64 0A7.49 7.49 0 0012 18c-2.083 0-3.977-.85-5.32-2.202m0 0A11.953 11.953 0 0112 13.5a11.953 11.953 0 017.298 2.684" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 11.25a.75.75 0 01.75-.75h3a.75.75 0 01.75.75v.005a.75.75 0 01-.75.75h-3a.75.75 0 01-.75-.75v-.005z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75a.75.75 0 01.75.75v.006a.75.75 0 01-.75.75h-.006a.75.75 0 01-.75-.75v-.006a.75.75 0 01.75-.75h.006z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 01.75.75v.006a.75.75 0 01-.75.75h-.006a.75.75 0 01-.75-.75v-.006a.75.75 0 01.75-.75h.006z" />
    </svg>
);