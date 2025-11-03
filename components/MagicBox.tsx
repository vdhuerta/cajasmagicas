

import React, { useState, ReactNode, useRef, useEffect } from 'react';
// FIX: Import TreasureObject and use a union type to make the component more reusable.
import { DienesBlockType, TreasureObject } from '../types';
import DienesBlock from './DienesBlock';
import { speakText } from '../utils/tts';
import { AudioIcon } from './icons/AudioIcon';
// FIX: Import TreasureObjectDisplay for rendering treasure items.
import TreasureObjectDisplay from './TreasureObjectDisplay';

interface MagicBoxProps {
  id: string;
  label: string;
  // FIX: Allow onDrop to handle either type of object.
  onDrop: (boxId: string, block: DienesBlockType | TreasureObject) => void;
  // FIX: Allow blocks to be an array of either type.
  blocks: (DienesBlockType | TreasureObject)[];
  children?: ReactNode;
}

const MagicBox: React.FC<MagicBoxProps> = ({ id, label, onDrop, blocks, children }) => {
  const [isOver, setIsOver] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(false);
    const blockDataString = e.dataTransfer.getData('dienes-block');
    if (blockDataString) {
        const blockData = JSON.parse(blockDataString);
        onDrop(id, blockData);
    }
  };
  
  const handleSpeak = (e: React.MouseEvent) => {
      e.stopPropagation();
      speakText(label);
  }

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleTouchDrop = (e: Event) => {
        const customEvent = e as CustomEvent;
        const blockDataString = customEvent.detail.blockData;
        if (blockDataString) {
            const blockData = JSON.parse(blockDataString);
            onDrop(id, blockData);
        }
        setIsOver(false);
    };

    const handleTouchDragEnter = () => setIsOver(true);
    const handleTouchDragLeave = () => setIsOver(false);

    element.addEventListener('touchdrop', handleTouchDrop);
    element.addEventListener('touchdragenter', handleTouchDragEnter);
    element.addEventListener('touchdragleave', handleTouchDragLeave);

    return () => {
        element.removeEventListener('touchdrop', handleTouchDrop);
        element.removeEventListener('touchdragenter', handleTouchDragEnter);
        element.removeEventListener('touchdragleave', handleTouchDragLeave);
    };
  }, [id, onDrop]);

  return (
    <div
      ref={ref}
      data-droptarget="true"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative p-4 border-4 border-dashed rounded-2xl transition-all duration-300 ${
        isOver ? 'border-amber-400 bg-amber-100' : 'border-sky-200 bg-sky-100'
      }`}
    >
      <div className="flex items-center justify-center gap-2 mb-2">
        <h3 className="text-center font-bold text-sky-800">{label}</h3>
        <button onClick={handleSpeak} className="p-1 rounded-full hover:bg-sky-200 transition" aria-label={`Leer en voz alta: ${label}`}>
            <AudioIcon className="w-5 h-5 text-sky-700" />
        </button>
      </div>

      <div className="h-full min-h-[150px] flex flex-wrap items-start justify-center gap-2 p-2 bg-white/50 rounded-lg">
        {/* FIX: Use type guards to render the correct component for each item type. */}
        {blocks.map(item => {
          if ('shape' in item && 'thickness' in item) {
            return <DienesBlock key={item.id} block={item as DienesBlockType} />;
          }
          if ('objectType' in item) {
            return <TreasureObjectDisplay key={item.id} treasure={item as TreasureObject} />;
          }
          return null;
        })}
      </div>
      {children}
    </div>
  );
};

export default MagicBox;