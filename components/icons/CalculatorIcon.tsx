import React from 'react';

const CalculatorIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6.75A2.25 2.25 0 015.25 4.5h13.5A2.25 2.25 0 0121 6.75v10.5A2.25 2.25 0 0118.75 19.5H5.25A2.25 2.25 0 013 17.25V6.75z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75h6m-6-4.5h.008v.008H9v-.008zm3.75 0h.008v.008h-.008v-.008zm-3.75 4.5h.008v.008H9v-.008zm3.75 0h.008v.008h-.008v-.008zm3.75-4.5h.008v.008h-.008v-.008z" />
    </svg>
);

export default CalculatorIcon;