import React, { useState, useEffect, DragEvent, useRef, useCallback, useMemo } from 'react';
import { CuisenaireRodType, ActivityLogType } from '../types';
import { ALL_CUISENAIRE_RODS, LEVEL_NAME_TRANSLATIONS } from '../constants';
import CuisenaireRod from './CuisenaireRod';
import HoverHelper from './HoverHelper';
import { AudioIcon } from './icons/AudioIcon';
import { speakText } from '../utils/tts';

const TOTAL_ROUNDS = 5;
type PatternType = 'AAB' | 'AABB' | 'ABCB';
const PATTERNS: PatternType[] = ['AAB', 'AABB', 'ABCB'];

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

interface ColorSnakeGameProps {
  onGoHome: () => void;
  onUnlockAchievement: (id: string) => void;
  logActivity: (message: string, type: ActivityLogType, pointsEarned?: number) => void;
  addScore: (points: number, message: string) => void;
  completedActivities: Set<string>;
  logPerformance: (data: { game_name: string; level_name: string; incorrect_attempts: number; time_taken_ms: number; total_items: number }) => void;
}

const ColorSnakeGame: React.FC<ColorSnakeGameProps> = ({ onGoHome, onUnlockAchievement, logActivity, addScore, completedActivities, logPerformance }) => {
  const [round, setRound] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  const [baseSequence, setBaseSequence] = useState<CuisenaireRodType[]>([]);
  const [correctNextRods, setCorrectNextRods] = useState<CuisenaireRodType[]>([]);
  const [droppedRods, setDroppedRods] = useState<(CuisenaireRodType | null)[]>([null, null]);
  const [choicePile, setChoicePile] = useState<CuisenaireRodType[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect'; message: string } | null>(null);
  const [pointsAwarded, setPointsAwarded] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [totalIncorrectAttempts, setTotalIncorrectAttempts] = useState(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const levelId = 'color_snake_game';
  const gameTitle = LEVEL_NAME_TRANSLATIONS[levelId as keyof typeof LEVEL_NAME_TRANSLATIONS] || "La Serpiente de Colores";
  const instructionText = '¡Ayuda a la serpiente a crecer! Descubre su patrón de colores y arrastra las siguientes dos piezas para continuar la secuencia.';

  const startNewRound = useCallback(() => {
    setFeedback(null);
    setDroppedRods([null, null]);

    const patternType = PATTERNS[Math.floor(Math.random() * PATTERNS.length)];
    // We only need up to 3 unique rods
    const [A, B, C] = shuffleArray(ALL_CUISENAIRE_RODS).slice(0, 3);
    
    let corePattern: CuisenaireRodType[] = [];
    switch (patternType) {
        case 'AAB': corePattern = [A, A, B]; break;
        case 'AABB': corePattern = [A, A, B, B]; break;
        case 'ABCB': corePattern = [A, B, C, B]; break;
    }
    
    // The base sequence is one full nucleus of the pattern.
    const base = corePattern;
    // The correct answer is the first two elements of the next pattern repetition.
    const correct = corePattern.slice(0, 2);
    
    // Get unique rods actually used in the pattern to create distractors.
    const allInvolvedRods = [...new Set(corePattern)];
    const distractors = shuffleArray(ALL_CUISENAIRE_RODS.filter(r => !allInvolvedRods.find(p => p.id === r.id))).slice(0, 3);
    const choices = shuffleArray([...correct, ...distractors]);
    
    setBaseSequence(base);
    setCorrectNextRods(correct);
    setChoicePile(choices);
  }, []);

  useEffect(() => {
    resetGame();
  }, []);

  useEffect(() => {
    if (!isGameOver) {
      startNewRound();
    }
  }, [round, startNewRound, isGameOver]);

  const handleDrop = useCallback((slotIndex: number, droppedRod: CuisenaireRodType) => {
    if (feedback?.type === 'correct' || droppedRods[slotIndex]) return;

    setDroppedRods(prev => {
      const newDropped = [...prev];
      newDropped[slotIndex] = droppedRod;
      return newDropped;
    });
    setChoicePile(prev => {
        const indexToRemove = prev.findIndex(r => r.id === droppedRod.id);
        if (indexToRemove > -1) {
            const newPile = [...prev];
            newPile.splice(indexToRemove, 1);
            return newPile;
        }
        return prev;
    });
  }, [droppedRods, feedback]);
  
  const handleReturnRod = (slotIndex: number) => {
    if (feedback?.type === 'correct') return;
    const rodToReturn = droppedRods[slotIndex];
    if (rodToReturn) {
      setDroppedRods(prev => {
        const newDropped = [...prev];
        newDropped[slotIndex] = null;
        return newDropped;
      });
      setChoicePile(prev => shuffleArray([...prev, rodToReturn]));
    }
  };
  
  useEffect(() => {
    const el = gameAreaRef.current;
    if (!el) return;
    const findSlotIndex = (target: EventTarget | null): number | null => {
         if (!(target instanceof HTMLElement)) return null;
         const zoneEl = target.closest('[data-slot-index]');
         const indexStr = zoneEl ? zoneEl.getAttribute('data-slot-index') : null;
         return indexStr !== null ? parseInt(indexStr, 10) : null;
    }
    const handleTouchDrop = (e: Event) => {
        const slotIndex = findSlotIndex(e.target);
        if (slotIndex !== null) {
            const customEvent = e as CustomEvent;
            const blockDataString = customEvent.detail.blockData;
            if (blockDataString) handleDrop(slotIndex, JSON.parse(blockDataString));
        }
    };
    el.addEventListener('touchdrop', handleTouchDrop);
    return () => { el.removeEventListener('touchdrop', handleTouchDrop); };
  }, [handleDrop]);


  const handleCheckPattern = () => {
    if (droppedRods.some(r => r === null)) {
      setFeedback({ type: 'incorrect', message: '¡Completa los dos espacios!' });
      setTimeout(() => setFeedback(null), 1500);
      return;
    }

    const isCorrect = 
      droppedRods[0]?.id === correctNextRods[0]?.id &&
      droppedRods[1]?.id === correctNextRods[1]?.id;

    if (isCorrect) {
      setFeedback({ type: 'correct', message: '¡Muy bien!' });
      setTimeout(() => {
        if (round < TOTAL_ROUNDS) {
          setRound(r => r + 1);
        } else {
          handleEndGame();
        }
      }, 2000);
    } else {
      setTotalIncorrectAttempts(prev => prev + 1);
      setFeedback({ type: 'incorrect', message: '¡Esa no es la secuencia! Inténtalo de nuevo.' });
      setTimeout(() => setFeedback(null), 2500);
    }
  };

  const handleEndGame = () => {
    setIsGameOver(true);
    const timeTakenMs = Date.now() - startTime;
    logActivity(`${gameTitle} completado.`, 'win');
    
    logPerformance({
        game_name: 'ColorSnake',
        level_name: levelId,
        incorrect_attempts: totalIncorrectAttempts,
        time_taken_ms: timeTakenMs,
        total_items: TOTAL_ROUNDS,
    });
    
    const points = 350 - (totalIncorrectAttempts * 20);
    setPointsAwarded(points);
    if (points > 0) addScore(points, `Completaste ${gameTitle}`);

    if (!completedActivities.has(levelId)) {
        onUnlockAchievement('SERIATION_COLOR_SNAKE_WIN');
    }
  };

  const resetGame = () => {
    logActivity(`Reiniciando ${gameTitle}`, 'game');
    setRound(1);
    setIsGameOver(false);
    setPointsAwarded(0);
    setTotalIncorrectAttempts(0);
    setStartTime(Date.now());
    startNewRound();
  };

  const choicePileMaxHeight = useMemo(() => {
    if (choicePile.length === 0) return 40;
    const maxVal = Math.max(...choicePile.map(r => r.value));
    return maxVal * 20 + 20;
  }, [choicePile]);
  
  const completionTitle = "¡Serpiente Gigante!";
  const completionText = `¡Has completado todos los patrones de colores!`;

  return (
    <div className="flex flex-col items-center justify-start h-full pt-4">
      <div className="text-center mb-4">
        <h2 className="text-3xl font-bold text-purple-600">{gameTitle}</h2>
        <div className="flex items-center justify-center gap-2 mt-2 max-w-lg mx-auto">
            <p className="text-slate-600">{instructionText}</p>
            <button onClick={() => speakText(instructionText)} className="p-2 rounded-full hover:bg-purple-100 transition flex-shrink-0" aria-label={`Leer en voz alta: ${instructionText}`}>
                <AudioIcon className="w-5 h-5 text-purple-700"/>
            </button>
        </div>
        <p className="text-slate-600 mt-1">Ronda: {round} / {TOTAL_ROUNDS}</p>
      </div>

      {isGameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
              <div className="bg-white p-10 rounded-2xl shadow-2xl text-center">
                  <h3 className="text-4xl font-bold text-green-500 mb-4">{completionTitle}</h3>
                  <p className="text-lg text-slate-700 mb-2">{completionText}</p>
                   {pointsAwarded > 0 && <p className="text-xl font-bold text-green-600 mb-6">+{pointsAwarded} puntos</p>}
                  <div className="flex justify-center gap-4">
                      <button onClick={resetGame} className="px-6 py-3 bg-sky-500 text-white font-bold rounded-lg shadow-lg hover:bg-sky-600 transition">Jugar de Nuevo</button>
                      <button onClick={onGoHome} className="px-6 py-3 bg-gray-400 text-white font-bold rounded-lg shadow-lg hover:bg-gray-500 transition">Otros Juegos</button>
                  </div>
              </div>
          </div>
      )}

      <div className="w-full max-w-4xl flex-grow flex flex-col items-center justify-start">
        <div ref={gameAreaRef} className="p-8 bg-sky-50 rounded-2xl shadow-inner flex items-end justify-center gap-1 h-72">
          {/* Snake Head */}
           <div className="w-10 h-10 text-green-600 self-end mb-2 mr-[-5px]">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19,5a3,3,0,0,0-3-3,2.9,2.9,0,0,0-1.7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16.5,7.5a1,1,0,1,1,1-1A1,1,0,0,1,16.5,7.5Z" fill="currentColor"/>
                </svg>
            </div>
          {baseSequence.map((rod, index) => <CuisenaireRod key={`${rod.id}-${index}`} rod={rod} />)}
          {[0, 1].map(index => (
            <div key={index} className="flex flex-col items-center justify-end" style={{ height: '100%' }}>
              {droppedRods[index] ? (
                <CuisenaireRod rod={droppedRods[index]!} onClick={() => handleReturnRod(index)} />
              ) : (
                <div
                  data-droptarget="true" data-slot-index={index}
                  onDrop={(e: DragEvent<HTMLDivElement>) => {
                    e.preventDefault();
                    const data = e.dataTransfer.getData('dienes-block');
                    if (data) handleDrop(index, JSON.parse(data));
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  className="w-[20px] bg-slate-300/50 border-2 border-dashed rounded-sm"
                  style={{ height: `${correctNextRods[index] ? correctNextRods[index]!.value * 20 : 100}px` }}
                />
              )}
            </div>
          ))}
        </div>

        <div className="my-6 relative">
            <button 
                onClick={handleCheckPattern} 
                disabled={feedback?.type === 'correct'}
                className="px-8 py-4 bg-lime-500 text-white font-bold rounded-xl shadow-lg hover:bg-lime-600 transition-transform transform hover:scale-105 disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
                Verificar
            </button>
            {feedback && (
              <div className={`absolute top-full mt-2 left-1/2 -translate-x-1/2 w-max px-3 py-1 rounded-md text-white text-sm font-semibold ${feedback.type === 'correct' ? 'bg-green-500' : 'bg-red-500'}`}>
                {feedback.message}
              </div>
            )}
        </div>

        <div 
          className="w-full max-w-md p-4 bg-rose-50 rounded-2xl shadow-inner flex flex-wrap items-end justify-center gap-4 transition-all duration-300"
          style={{ minHeight: `${choicePileMaxHeight}px` }}
        >
          {choicePile.map((rod, index) => (
            <div key={`${rod.id}-${index}`} className="flex flex-col items-center justify-end">
              <CuisenaireRod rod={rod} />
            </div>
          ))}
        </div>
        <HoverHelper text="Arrastra las dos piezas que continúan el patrón de la serpiente." />
      </div>
    </div>
  );
};

export default ColorSnakeGame;
