import React from 'react';
import { CuisenaireRodType } from '../types';

interface CuisenaireRodProps {
  rod: CuisenaireRodType;
  onClick?: () => void;
}

const CuisenaireRod: React.FC<CuisenaireRodProps> = ({ rod, onClick }) => {
  const { id, value, colorName, colorHex } = rod;

  // Base unit for height, e.g., 20px per unit value. Fixed width.
  const height = value * 20;
  const width = 20;

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    // Using a common key to maintain compatibility with existing touch handlers
    e.dataTransfer.setData('dienes-block', JSON.stringify(rod));
  };

  const title = `${colorName} (Valor: ${value})`;
  const cursorClass = onClick ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing';

  return (
    <div
      id={id}
      draggable={!onClick}
      onDragStart={handleDragStart}
      onClick={onClick}
      className={`${cursorClass} transition-transform transform hover:scale-105 rounded-sm shadow-md flex items-center justify-center`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: colorHex,
        border: '1px solid rgba(0,0,0,0.2)',
      }}
      title={title}
      data-block={JSON.stringify(rod)} // For touch compatibility
    >
      {/* Number removed as per request */}
    </div>
  );
};

export default CuisenaireRod;
