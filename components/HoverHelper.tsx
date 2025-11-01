import React from 'react';
import { InformationCircleIcon } from './icons/InformationCircleIcon';

interface HoverHelperProps {
  text: string;
}

const HoverHelper: React.FC<HoverHelperProps> = ({ text }) => (
  <div className="hidden md:flex items-center justify-center gap-2 mt-2 text-sm text-slate-500 italic">
    <InformationCircleIcon className="w-5 h-5 flex-shrink-0" />
    <span>{text}</span>
  </div>
);

export default HoverHelper;
