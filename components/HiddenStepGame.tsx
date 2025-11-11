import React, { useState, useEffect, DragEvent, useRef, useCallback, useMemo } from 'react';
import { CuisenaireRodType, ActivityLogType } from '../types';
import { ALL_CUISENAIRE_RODS, LEVEL_NAME_TRANSLATIONS } from '../constants';
import CuisenaireRod from './CuisenaireRod';
import HoverHelper from './HoverHelper';
import { AudioIcon } from './icons/AudioIcon';
import { speakText } from '../utils/tts';

const TOTAL_ROUNDS = 5;

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

interface HiddenStepGameProps {
  onGoHome: () => void;
  onUnlockAchievement: (id: string) => void;
  logActivity: (message: string, type: ActivityLogType, pointsEarned?: number) => void;
  addScore: (points: number, message: string) => void;
  completedActivities: Set<string>;
  logPerformance: (data: { game_name: string; level_name: string; incorrect_attempts: number; time_taken_ms: number; total_items: number }) => void;
}

type SequencePattern = 'ascending' | 'descending' | 'growth-pattern';

const HiddenStepGame: React.FC<HiddenStepGameProps> = ({ onGoHome, onUnlockAchievement, logActivity, addScore, completedActivities, logPerformance }) => {
  const [round, setRound] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  const [sequence, setSequence] = useState<(CuisenaireRodType | null)[]>([]);
  const [correctRod, setCorrectRod] = useState<CuisenaireRodType | null>(null);
  const [droppedRod, setDroppedRod] = useState<CuisenaireRodType | null>(null);
  const [choicePile, setChoicePile] = useState<CuisenaireRodType[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect'; message: string } | null>(null);
  const [pointsAwarded, setPointsAwarded] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [totalIncorrectAttempts, setTotalIncorrectAttempts] = useState(0);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const levelId = 'hidden_step_game';
  const gameTitle = LEVEL_NAME_TRANSLATIONS[levelId as keyof typeof LEVEL_NAME_TRANSLATIONS] || 'El Peldaño Escondido';
  const instructionText = '¡Falta un peldaño en la escalera! Mira la secuencia y arrastra la pieza correcta para completar el espacio.';

  const startNewRound = useCallback(() => {
    setFeedback(null);
    setDroppedRod(null);

    const patterns: SequencePattern[] = ['ascending', 'descending', 'growth-pattern'];
    const chosenPattern = patterns[Math.floor(Math.random() * patterns.length)];

    let fullSequence: CuisenaireRodType[] = [];
    let isSequenceValid = false;

    while (!isSequenceValid) {
        switch (chosenPattern) {
            case 'ascending': {
                const startValue = Math.floor(Math.random() * 6) + 1; // 1 to 6
                fullSequence = Array.from({ length: 5 }, (_, i) => ALL_CUISENAIRE_RODS.find(r => r.value === startValue + i)).filter(Boolean) as CuisenaireRodType[];
                break;
            }
            case 'descending': {
                const startValue = Math.floor(Math.random() * 6) + 5; // 5 to 10
                fullSequence = Array.from({ length: 5 }, (_, i) => ALL_CUISENAIRE_RODS.find(r => r.value === startValue - i)).filter(Boolean) as CuisenaireRodType[];
                break;
            }
            case 'growth-pattern': {
                const step = 2;
                const startValue = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3
                fullSequence = Array.from({ length: 5 }, (_, i) => ALL_CUISENAIRE_RODS.find(r => r.value === startValue + i * step)).filter(Boolean) as CuisenaireRodType[];
                break;
            }
        }
        if (fullSequence.length === 5) {
            isSequenceValid = true;
        }
    }

    const missingRod = fullSequence[2];
    const displaySequence: (CuisenaireRodType | null)[] = [...fullSequence];
    displaySequence[2] = null;

    setSequence(displaySequence);
    setCorrectRod(missingRod);

    const distractors = shuffleArray(ALL_CUISENAIRE_RODS.filter(r => !fullSequence.find(p => p.id === r.id))).slice(0, 4);
    setChoicePile(shuffleArray([missingRod, ...distractors]));

  }, []);

  useEffect(() => {
    resetGame();
  }, []);

  useEffect(() => {
    if (!isGameOver) {
      startNewRound();
    }
  }, [round, startNewRound, isGameOver]);
  
  const handleDrop = useCallback((newlyDroppedRod: CuisenaireRodType) => {
    if (feedback?.type === 'correct') return;

    // A new drop replaces the old one, which goes back to the choice pile.
    setChoicePile(prev => {
        // Remove the newly dropped rod from the pile
        const newPile = prev.filter(r => r.id !== newlyDroppedRod.id);
        // If there was a rod in the slot already, add it back to the pile
        if (droppedRod) {
            newPile.push(droppedRod);
        }
        return shuffleArray(newPile);
    });

    setDroppedRod(newlyDroppedRod);
  }, [droppedRod, feedback]);

  useEffect(() => {
    const el = dropZoneRef.current;
    if (!el) return;
    const handleTouchDrop = (e: Event) => {
        const customEvent = e as CustomEvent;
        const blockDataString = customEvent.detail.blockData;
        if (blockDataString) {
            const block = JSON.parse(blockDataString);
            handleDrop(block);
        }
    };
    el.addEventListener('touchdrop', handleTouchDrop);
    return () => { el.removeEventListener('touchdrop', handleTouchDrop); };
  }, [handleDrop]);


  const handleCheck = () => {
    if (!droppedRod) {
      setFeedback({ type: 'incorrect', message: '¡Arrastra una pieza al espacio vacío!' });
      setTimeout(() => setFeedback(null), 1500);
      return;
    }

    if (droppedRod.id === correctRod?.id) {
      setFeedback({ type: 'correct', message: '¡Esa es la pieza correcta!' });
      setTimeout(() => {
        if (round < TOTAL_ROUNDS) {
          setRound(r => r + 1);
        } else {
          handleEndGame();
        }
      }, 2000);
    } else {
      setTotalIncorrectAttempts(prev => prev + 1);
      setFeedback({ type: 'incorrect', message: '¡Oh, no! Esa no es la pieza. Intenta de nuevo.' });
      const rodToReturn = droppedRod;
      setTimeout(() => {
          setFeedback(null);
          setDroppedRod(null);
          setChoicePile(prev => shuffleArray([...prev, rodToReturn]));
      }, 2500);
    }
  };

  const handleEndGame = () => {
    setIsGameOver(true);
    const timeTakenMs = Date.now() - startTime;
    logActivity(`${gameTitle} completado.`, 'win');
    
    logPerformance({
        game_name: 'HiddenStep',
        level_name: levelId,
        incorrect_attempts: totalIncorrectAttempts,
        time_taken_ms: timeTakenMs,
        total_items: TOTAL_ROUNDS,
    });
    
    const points = 300 - (totalIncorrectAttempts * 15);
    setPointsAwarded(points);
    if (points > 0) {
        addScore(points, `Completaste ${gameTitle}`);
    }

    if (!completedActivities.has(levelId)) {
        onUnlockAchievement('SERIATION_HIDDEN_STEP_WIN');
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

  const completionTitle = "¡Misterio Resuelto!";
  const completionText = `¡Has encontrado todos los peldaños escondidos!`;

  return (
    <div className="flex flex-col items-center justify-start h-full pt-4">
      <div className="text-center mb-4">
        <h2 className="text-3xl font-bold text-orange-600">{gameTitle}</h2>
        <div className="flex items-center justify-center gap-2 mt-2 max-w-md mx-auto">
            <p className="text-slate-600">{instructionText}</p>
            <button onClick={() => speakText(instructionText)} className="p-2 rounded-full hover:bg-orange-100 transition flex-shrink-0" aria-label={`Leer en voz alta: ${instructionText}`}>
                <AudioIcon className="w-5 h-5 text-orange-700"/>
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
        <div className="p-8 bg-sky-50 rounded-2xl shadow-inner flex items-end justify-center gap-2 h-72">
          {sequence.map((rod, index) => {
            if (rod) {
              return <CuisenaireRod key={`${rod.id}-${index}`} rod={rod} />;
            } else {
              // The Drop Zone
              return (
                <div key="drop-zone" ref={dropZoneRef} className="flex flex-col items-center justify-end" style={{ height: '100%' }}>
                  {droppedRod ? (
                     <CuisenaireRod rod={droppedRod} onClick={() => {
                        if (feedback?.type !== 'correct') {
                            setChoicePile(prev => shuffleArray([...prev, droppedRod]));
                            setDroppedRod(null);
                        }
                     }} />
                  ) : (
                    <div
                      data-droptarget="true"
                      onDrop={(e: DragEvent<HTMLDivElement>) => {
                        e.preventDefault();
                        const data = e.dataTransfer.getData('dienes-block');
                        if (data) handleDrop(JSON.parse(data));
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      className={`w-[20px] bg-slate-300/50 border-2 border-dashed rounded-sm transition-colors ${
                        feedback?.type === 'incorrect' ? 'border-red-500' : 'border-slate-400'
                      }`}
                      style={{ height: `${correctRod ? correctRod.value * 20 : 100}px` }}
                    />
                  )}
                </div>
              );
            }
          })}
        </div>

        <div className="my-6 relative">
            <button 
                onClick={handleCheck} 
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
          style={{ height: `${choicePileMaxHeight}px` }}
        >
          {choicePile.map(rod => (
            <div key={rod.id} className="flex flex-col items-center justify-end">
              <CuisenaireRod rod={rod} />
            </div>
          ))}
        </div>
        <HoverHelper text="Arrastra la regleta que falta al espacio vacío en la secuencia." />
      </div>
    </div>
  );
};

export default HiddenStepGame;
