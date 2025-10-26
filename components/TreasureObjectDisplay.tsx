import React from 'react';
import { TreasureObject, ObjectType, Size } from '../types';
import { TAILWIND_COLORS, TRANSLATIONS } from '../constants';
import { ButtonIcon } from './icons/ButtonIcon';
import { LidIcon } from './icons/LidIcon';
import { SpoonIcon } from './icons/SpoonIcon';
import { SockIcon } from './icons/SockIcon';

interface TreasureObjectDisplayProps {
  treasure: TreasureObject;
}

const TreasureObjectDisplay: React.FC<TreasureObjectDisplayProps> = ({ treasure }) => {
  const { id, objectType, color, size, holes, pattern } = treasure;
  const dimensions = size === Size.Large ? 'w-16 h-16' : 'w-12 h-12';
  const colorClass = TAILWIND_COLORS[color].svg.replace('fill', 'text');

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    // Using a common key 'dienes-block' to maintain compatibility with existing touch handlers
    // without modifying the core App component's drag logic. This is a pragmatic choice.
    e.dataTransfer.setData('dienes-block', JSON.stringify(treasure));
  };

  const renderIcon = () => {
    const className = `${dimensions} ${colorClass}`;
    switch (objectType) {
      case ObjectType.Button:
        return <ButtonIcon className={className} holes={holes} />;
      case ObjectType.Lid:
        return <LidIcon className={className} />;
      case ObjectType.Spoon:
        return <SpoonIcon className={className} />;
      case ObjectType.Sock:
        return <SockIcon className={className} pattern={pattern} />;
      default:
        return null;
    }
  };
  
  const titleParts = [
      TRANSLATIONS[objectType],
      TRANSLATIONS[color],
      TRANSLATIONS[size],
  ];
  if (pattern) titleParts.push(TRANSLATIONS[pattern]);
  if (holes) titleParts.push(TRANSLATIONS[holes]);

  const title = titleParts.join(' ');

  return (
    <div
      id={id}
      draggable
      onDragStart={handleDragStart}
      className="cursor-grab active:cursor-grabbing transition-transform transform hover:scale-110"
      title={title}
      data-block={JSON.stringify(treasure)} // For touch compatibility
    >
      {renderIcon()}
    </div>
  );
};

export default TreasureObjectDisplay;
