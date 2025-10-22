
import React, { useState, useEffect, DragEvent, useRef, useCallback } from 'react';
import { DienesBlockType, Shape, Color, ActivityLogType } from '../types';
import { ALL_DIENES_BLOCKS } from '../constants';
import DienesBlock from './DienesBlock';
import { speakText } from '../utils/tts';
import { AudioIcon } from './icons/AudioIcon';

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

type VennZone = 'circlesOnly' | 'blueOnly' | 'intersection';

interface VennDiagramGameProps {
  onGoHome: () => void;
  onUnlockAchievement: (id: string) => void;
  logActivity: (message: string, type: ActivityLogType) => void;
}

const VennDiagramGame: React.FC<VennDiagramGameProps> = ({ onGoHome, onUnlockAchievement, logActivity }) => {
  const [blocksInPile, setBlocksInPile] = useState<DienesBlockType[]>([]);
  const [blocksInZones, setBlocksInZones] = useState<Record<VennZone, DienesBlockType[]>>({
    circlesOnly: [],
    blueOnly: [],
    intersection: [],
  });
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [draggedOverZone, setDraggedOverZone] = useState<VennZone | null>(null);
  const zonesContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    startLevel();
  }, []);
  
  useEffect(() => {
      const totalBlocksInZones = blocksInZones.circlesOnly.length + blocksInZones.blueOnly.length + blocksInZones.intersection.length;
      if (blocksInPile.length === 0 && totalBlocksInZones > 0 && !isGameComplete) {
          setIsGameComplete(true);
          onUnlockAchievement('VENN_DIAGRAM_WIN');
          logActivity('Juego "El Cruce Mágico" completado', 'win');
      }
  }, [blocksInPile, blocksInZones, isGameComplete, onUnlockAchievement, logActivity]);

  const startLevel = () => {
    const relevantBlocks = ALL_DIENES_BLOCKS.filter(b => b.shape === Shape.Circle || b.color === Color.Blue);
    setBlocksInPile(shuffleArray(relevantBlocks));
    setBlocksInZones({ circlesOnly: [], blueOnly: [], intersection: [] });
    setIsGameComplete(false);
  };
  
  const checkBlockRule = (block: DienesBlockType, zoneId: VennZone): boolean => {
      const isCircle = block.shape === Shape.Circle;
      const isBlue = block.color === Color.Blue;
      
      switch(zoneId) {
          case 'circlesOnly': return isCircle && !isBlue;
          case 'blueOnly': return isBlue && !isCircle;
          case 'intersection': return isCircle && isBlue;
          default: return false;
      }
  };

  const handleDrop = useCallback((zoneId: VennZone, block: DienesBlockType) => {
    if (checkBlockRule(block, zoneId)) {
      setBlocksInPile(prev => prev.filter(b => b.id !== block.id));
      setBlocksInZones(prev => ({
        ...prev,
        [zoneId]: [...prev[zoneId], block]
      }));
    } else {
        const blockElement = document.getElementById(block.id);
        if (blockElement) {
            blockElement.classList.add('animate-shake');
            setTimeout(() => blockElement.classList.remove('animate-shake'), 500);
        }
    }
  }, []);
  
  const handleDragOver = (e: DragEvent<HTMLDivElement>, zoneId: VennZone) => {
    e.preventDefault();
    setDraggedOverZone(zoneId);
  }
  
  const onDrop = (e: DragEvent<HTMLDivElement>, zoneId: VennZone) => {
    e.preventDefault();
    const blockData = JSON.parse(e.dataTransfer.getData('dienes-block'));
    handleDrop(zoneId, blockData);
    setDraggedOverZone(null);
  }

  useEffect(() => {
    const el = zonesContainerRef.current;
    if (!el) return;

    const findZoneId = (target: EventTarget | null): VennZone | null => {
         if (!(target instanceof HTMLElement)) return null;
         const zoneEl = target.closest('[data-droptarget-id]');
         return zoneEl ? zoneEl.getAttribute('data-droptarget-id') as VennZone : null;
    }

    const handleTouchDrop = (e: Event) => {
        const zoneId = findZoneId(e.target);
        if (zoneId) {
            const customEvent = e as CustomEvent;
            const block = JSON.parse(customEvent.detail.blockData);
            handleDrop(zoneId, block);
            setDraggedOverZone(null);
        }
    };
    const handleTouchDragEnter = (e: Event) => {
        const zoneId = findZoneId(e.target);
        if (zoneId) setDraggedOverZone(zoneId);
    };
    const handleTouchDragLeave = () => {
        setDraggedOverZone(null);
    };
    
    el.addEventListener('touchdrop', handleTouchDrop);
    el.addEventListener('touchdragenter', handleTouchDragEnter);
    el.addEventListener('touchdragleave', handleTouchDragLeave);

    return () => {
        el.removeEventListener('touchdrop', handleTouchDrop);
        el.removeEventListener('touchdragenter', handleTouchDragEnter);
        el.removeEventListener('touchdragleave', handleTouchDragLeave);
    };
  }, [handleDrop]);

  const gameTitle = "El Cruce Mágico";
  const completionTitle = "¡Lo Lograste!";
  const completionText = "¡Has clasificado todas las figuras en su lugar correcto!";
  
  const zoneLabels: Record<VennZone, string> = {
      circlesOnly: 'Solo Círculos',
      intersection: 'Círculos Azules',
      blueOnly: 'Solo Azules',
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-center gap-3 mb-4">
        <h2 className="text-3xl font-bold text-center text-cyan-600">{gameTitle}</h2>
        <button onClick={() => speakText(gameTitle)} className="p-2 rounded-full hover:bg-cyan-100 transition" aria-label={`Leer en voz alta: ${gameTitle}`}>
          <AudioIcon className="text-cyan-700"/>
        </button>
      </div>
      
      {isGameComplete && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
            <div className="bg-white p-10 rounded-2xl shadow-2xl text-center">
                <h3 className="text-4xl font-bold text-green-500 mb-4">{completionTitle}</h3>
                <p className="text-lg text-slate-700 mb-6">{completionText}</p>
                <div className="flex justify-center gap-4">
                    <button onClick={startLevel} className="px-6 py-3 bg-sky-500 text-white font-bold rounded-lg shadow-lg hover:bg-sky-600 transition">Jugar de Nuevo</button>
                    <button onClick={onGoHome} className="px-6 py-3 bg-gray-400 text-white font-bold rounded-lg shadow-lg hover:bg-gray-500 transition">Volver al Inicio</button>
                </div>
            </div>
        </div>
      )}

      {/* Venn Diagram Zones */}
      <div ref={zonesContainerRef} className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-lime-50 rounded-2xl shadow-inner">
        {(['circlesOnly', 'intersection', 'blueOnly'] as VennZone[]).map(zoneId => (
            <div
                key={zoneId}
                data-droptarget="true"
                data-droptarget-id={zoneId}
                onDragOver={(e) => handleDragOver(e, zoneId)}
                onDragLeave={() => setDraggedOverZone(null)}
                onDrop={(e) => onDrop(e, zoneId)}
                className={`p-4 border-4 border-dashed rounded-2xl transition-all duration-300
                    ${zoneId === 'circlesOnly' ? (draggedOverZone === zoneId ? 'border-amber-400 bg-amber-100' : 'border-amber-200 bg-amber-50') : ''}
                    ${zoneId === 'intersection' ? (draggedOverZone === zoneId ? 'border-green-400 bg-green-100' : 'border-green-200 bg-green-50') : ''}
                    ${zoneId === 'blueOnly' ? (draggedOverZone === zoneId ? 'border-sky-400 bg-sky-100' : 'border-sky-200 bg-sky-50') : ''}
                `}
            >
                 <div className="flex items-center justify-center gap-2 mb-2">
                    <h3 className="text-center font-bold text-slate-800">{zoneLabels[zoneId]}</h3>
                    <button onClick={() => speakText(zoneLabels[zoneId])} className="p-1 rounded-full hover:bg-slate-200 transition" aria-label={`Leer en voz alta: ${zoneLabels[zoneId]}`}>
                        <AudioIcon className="w-5 h-5 text-slate-700" />
                    </button>
                </div>
                <div className="h-full min-h-[150px] flex flex-wrap items-start justify-center gap-2 p-2 bg-white/50 rounded-lg">
                    {blocksInZones[zoneId].map(block => (
                        <DienesBlock key={block.id} block={block} />
                    ))}
                </div>
            </div>
        ))}
      </div>

      {/* Blocks Pile */}
      <div className="h-48 md:h-56 mt-4 p-4 bg-rose-50 rounded-2xl shadow-inner flex flex-wrap items-start justify-center gap-2 overflow-y-auto">
        {blocksInPile.map(block => (
          <DienesBlock key={block.id} block={block} />
        ))}
      </div>
       <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default VennDiagramGame;
