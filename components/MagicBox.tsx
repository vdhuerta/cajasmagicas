
import React, { useState, ReactNode, useRef, useEffect } from 'react';
import { DienesBlockType } from '../types';
import DienesBlock from './DienesBlock';
import { speakText } from '../utils/tts';
import { AudioIcon } from './icons/AudioIcon';

interface MagicBoxProps {
  id: string;
  label: string;
  onDrop: (boxId: string, block: DienesBlockType) => void;
  blocks: DienesBlockType[];
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
    const blockData = JSON.parse(e.dataTransfer.getData('dienes-block'));
    onDrop(id, blockData);
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
        const blockData = JSON.parse(customEvent.detail.blockData);
        onDrop(id, blockData);
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
        {blocks.map(block => (
          <DienesBlock key={block.id} block={block} />
        ))}
      </div>
      {children}
    </div>
  );
};

export default MagicBox;
