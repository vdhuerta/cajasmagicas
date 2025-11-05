import React from 'react';
import { Pattern } from '../../types';

interface SockIconProps {
  className?: string;
  pattern?: Pattern;
}

export const SockIcon: React.FC<SockIconProps> = ({ className, pattern }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      {pattern === Pattern.Stripes && (
        <pattern id="sockStripes" patternUnits="userSpaceOnUse" width="20" height="20" patternTransform="rotate(45)">
          <rect width="20" height="20" fill="currentColor" fillOpacity="0.8" />
          <rect width="10" height="20" fill="currentColor" fillOpacity="1" />
        </pattern>
      )}
      {pattern === Pattern.Dots && (
        <pattern id="sockDots" patternUnits="userSpaceOnUse" width="20" height="20">
          <rect width="20" height="20" fill="currentColor" fillOpacity="0.8" />
          <circle cx="10" cy="10" r="5" fill="currentColor" fillOpacity="1" />
        </pattern>
      )}
    </defs>
    <path
      d="M 20,95 V 50 C 20,40 30,40 30,30 V 5 H 70 V 30 C 70,40 80,40 80,50 V 90 L 50,80 Z"
      stroke="currentColor"
      strokeOpacity="0.5"
      strokeWidth="3"
      fill={pattern === Pattern.Solid || !pattern ? 'currentColor' : `url(#${pattern === Pattern.Stripes ? 'sockStripes' : 'sockDots'})`}
      fillOpacity={pattern === Pattern.Solid || !pattern ? 0.8 : 1}
    />
  </svg>
);
