import React, { useState, useEffect } from 'react';
import { DienesBlockType, ClassificationRule, MagicBoxDefinition, GameLevel, ActivityLogType } from '../types';
import { ALL_DIENES_BLOCKS } from '../constants';
import DienesBlock from './DienesBlock';
import MagicBox from './MagicBox';
import { getMagicBoxName } from '../services/geminiService';
import { SparklesIcon } from './icons/SparklesIcon';
import { AudioIcon } from './icons/AudioIcon';
import { speakText } from '../utils/tts';

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const checkBlockRule = (block: DienesBlockType, rule: ClassificationRule): boolean => {
    return Object.entries(rule).every(([key, value]) => {
        return block[key as keyof Omit<DienesBlockType, 'id'>] === value;
    });
};

interface ClassificationGameProps {
  gameLevel: GameLevel;
  onGoHome: () => void;
  onUnlockAchievement: (id: string) => void;
  logActivity: (message: string, type: ActivityLogType) => void;
  onLevelComplete: (levelName: string) => void;
}

const ClassificationGame: React.FC<ClassificationGameProps> = ({ gameLevel, onGoHome, onUnlockAchievement, logActivity, onLevelComplete }) => {
  const [blocksInPile, setBlocksInPile] = useState<DienesBlockType[]>([]);
  const [blocksInBoxes, setBlocksInBoxes] = useState<Record<string, DienesBlockType[]>>({});
  const [magicBoxNames, setMagicBoxNames] = useState<Record<string, string>>({});
  const [generatingNameFor, setGeneratingNameFor] = useState<string | null>(null);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  
  useEffect(() => {
    startLevel(gameLevel);
  }, [gameLevel]);

  useEffect(() => {
    if (blocksInPile.length === 0 && Object.keys(blocksInBoxes).length > 0) {
      const isCorrect = Object.entries(blocksInBoxes).every(([boxId, blocks]) => {
        const boxDef = gameLevel.boxes.find(b => b.id === boxId);
        if (!boxDef) return false;
        
        // Dynamic logic for "Everything Else" box
        if (Object.keys(boxDef.rule).length === 0) {
            const otherRules = gameLevel.boxes
                .filter(b => Object.keys(b.rule).length > 0)
                .map(b => b.rule);
            return blocks.every(block => !otherRules.some(rule => checkBlockRule(block, rule)));
        }
        return blocks.every(block => checkBlockRule(block, boxDef.rule));
      });

      if (isCorrect && !isLevelComplete) {
        setIsLevelComplete(true);
        onLevelComplete(gameLevel.name);
        logActivity(`Nivel completado: ${gameLevel.name}`, 'win');
        if (gameLevel.name.includes("Nivel 1")) onUnlockAchievement('CLASSIFICATION_LVL_1');
        if (gameLevel.name.includes("Nivel 2")) onUnlockAchievement('CLASSIFICATION_LVL_2');
        if (gameLevel.name.includes("Nivel 3")) onUnlockAchievement('CLASSIFICATION_LVL_3');
        if (gameLevel.name.includes("Nivel 4")) onUnlockAchievement('CLASSIFICATION_LVL_4');
        if (gameLevel.isExpert) onUnlockAchievement('CLASSIFICATION_EXPERT');
      }
    }
  }, [blocksInPile, blocksInBoxes, gameLevel, onUnlockAchievement, isLevelComplete, logActivity, onLevelComplete]);

  const startLevel = (levelData: GameLevel) => {
    setIsLevelComplete(false);
    setBlocksInPile(shuffleArray(ALL_DIENES_BLOCKS));
    const initialBoxes: Record<string, DienesBlockType[]> = {};
    levelData.boxes.forEach(box => {
      initialBoxes[box.id] = [];
    });
    setBlocksInBoxes(initialBoxes);
    setMagicBoxNames({});
    setGeneratingNameFor(null);
  };

  const handleDrop = (boxId: string, block: DienesBlockType) => {
    const boxDef = gameLevel.boxes.find(b => b.id === boxId)!;
    let isCorrectDrop;

    if (Object.keys(boxDef.rule).length === 0) { // This is the 'Everything Else' box
        const otherRules = gameLevel.boxes.filter(b => Object.keys(b.rule).length > 0).map(b => b.rule);
        isCorrectDrop = !otherRules.some(rule => checkBlockRule(block, rule));
    } else {
        isCorrectDrop = checkBlockRule(block, boxDef.rule);
    }
      
    if (isCorrectDrop) {
      setBlocksInPile(prev => prev.filter(b => b.id !== block.id));
      setBlocksInBoxes(prev => ({
        ...prev,
        [boxId]: [...prev[boxId], block]
      }));
    } else {
        const blockElement = document.getElementById(block.id);
        if (blockElement) {
            blockElement.classList.add('animate-shake');
            setTimeout(() => blockElement.classList.remove('animate-shake'), 500);
        }
    }
  };
  
  const handleGenerateName = async (box: MagicBoxDefinition) => {
    if (generatingNameFor || Object.keys(box.rule).length === 0) return;
    setGeneratingNameFor(box.id);
    onUnlockAchievement('GEMINI_NAME');
    try {
        const name = await getMagicBoxName(box.rule);
        setMagicBoxNames(prev => ({ ...prev, [box.id]: name }));
        logActivity(`Nombre mágico generado para la caja: "${name}"`, 'system');
    } catch (error) {
        console.error("Failed to generate name:", error);
        setMagicBoxNames(prev => ({ ...prev, [box.id]: "¡Una Caja de Maravillas!" }));
    } finally {
        setGeneratingNameFor(null);
    }
  };

  const completionTitle = "¡Felicitaciones!";
  const completionText = "¡Ordenaste todas las figuras correctamente!";
  
  // Dynamically set grid columns for medium screens based on number of boxes.
  const mdCols = gameLevel.boxes.length;
  const mdGridClass = `md:grid-cols-${mdCols > 1 ? Math.min(mdCols, 4) : 2}`;


  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-center gap-3 mb-4">
        <h2 className="text-3xl font-bold text-center text-sky-600">{gameLevel.title}</h2>
        <button onClick={() => speakText(gameLevel.title)} className="p-2 rounded-full hover:bg-sky-100 transition" aria-label={`Leer en voz alta: ${gameLevel.title}`}>
          <AudioIcon />
        </button>
      </div>
      
      {isLevelComplete && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
            <div className="bg-white p-10 rounded-2xl shadow-2xl text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <h3 className="text-4xl font-bold text-amber-500">{completionTitle}</h3>
                   <button onClick={() => speakText(completionTitle)} className="p-2 rounded-full hover:bg-amber-100 transition" aria-label={`Leer en voz alta: ${completionTitle}`}>
                     <AudioIcon className="w-7 h-7 text-amber-600" />
                   </button>
                </div>
                <div className="flex items-center justify-center gap-2 mb-6">
                  <p className="text-lg text-slate-700">{completionText}</p>
                   <button onClick={() => speakText(completionText)} className="p-2 rounded-full hover:bg-slate-100 transition" aria-label={`Leer en voz alta: ${completionText}`}>
                     <AudioIcon className="w-5 h-5 text-slate-600" />
                   </button>
                </div>
                <div className="flex justify-center">
                  <button 
                      onClick={onGoHome}
                      className="px-6 py-3 bg-green-500 text-white font-bold rounded-lg shadow-lg hover:bg-green-600 transition"
                  >
                      Elegir otro Nivel
                  </button>
                </div>
            </div>
        </div>
      )}

      {/* Magic Boxes */}
      <div className={`flex-grow grid grid-cols-2 ${mdGridClass} gap-4 p-4 bg-emerald-50 rounded-2xl shadow-inner`}>
        {gameLevel.boxes.map(box => (
          <MagicBox key={box.id} id={box.id} label={box.label} onDrop={handleDrop} blocks={blocksInBoxes[box.id] || []}>
            {blocksInBoxes[box.id]?.length > 0 && !magicBoxNames[box.id] && Object.keys(box.rule).length > 0 && (
              <button 
                onClick={() => handleGenerateName(box)} 
                disabled={!!generatingNameFor}
                className="absolute -top-4 -right-4 px-2 py-1 bg-amber-400 text-white text-xs font-bold rounded-full shadow-lg hover:bg-amber-500 transition disabled:bg-slate-300 flex items-center gap-1">
                 {generatingNameFor === box.id ? 'Pensando...' : <> <SparklesIcon /> Nombre Mágico</>}
              </button>
            )}
            {magicBoxNames[box.id] && (
                <div className="absolute top-2 left-2 right-2 p-1 bg-white bg-opacity-80 rounded-md text-center text-amber-700 font-bold text-sm shadow flex items-center justify-center gap-1">
                    <span>{magicBoxNames[box.id]}</span>
                     <button onClick={(e) => { e.stopPropagation(); speakText(magicBoxNames[box.id]!); }} className="p-0.5 rounded-full hover:bg-amber-100 transition" aria-label={`Leer nombre mágico: ${magicBoxNames[box.id]}`}>
                       <AudioIcon className="w-4 h-4 text-amber-800" />
                     </button>
                </div>
            )}
          </MagicBox>
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

export default ClassificationGame;