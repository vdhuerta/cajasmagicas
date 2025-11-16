import React, { useState, useEffect, DragEvent, useRef, useCallback, useMemo } from 'react';
import { CuisenaireRodType, ActivityLogType } from '../types';
import { ALL_CUISENAIRE_RODS } from '../constants';
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


interface FrogJumpGameProps {
  onGoHome: () => void;
  onUnlockAchievement: (id: string) => void;
  logActivity: (message: string, type: ActivityLogType, pointsEarned?: number) => void;
  addScore: (points: number, message: string) => void;
  completedActivities: Set<string>;
  logPerformance: (data: { game_name: string; level_name: string; incorrect_attempts: number; time_taken_ms: number; total_items: number }) => void;
}

const FrogJumpGame: React.FC<FrogJumpGameProps> = ({ onGoHome, onUnlockAchievement, logActivity, addScore, completedActivities, logPerformance }) => {
    const [round, setRound] = useState(1);
    const [isGameOver, setIsGameOver] = useState(false);
    
    const [baseSequence, setBaseSequence] = useState<CuisenaireRodType[]>([]);
    const [jumpStick, setJumpStick] = useState<CuisenaireRodType | null>(null);
    const [correctRod, setCorrectRod] = useState<CuisenaireRodType | null>(null);
    const [droppedRod, setDroppedRod] = useState<CuisenaireRodType | null>(null);
    const [choicePile, setChoicePile] = useState<CuisenaireRodType[]>([]);

    const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect'; message: string } | null>(null);
    const [pointsAwarded, setPointsAwarded] = useState(0);
    const [startTime, setStartTime] = useState<number>(0);
    const [totalIncorrectAttempts, setTotalIncorrectAttempts] = useState(0);
    const dropZoneRef = useRef<HTMLDivElement>(null);
    
    const levelId = 'seriation_frog_jump_game';
    const gameTitle = 'El Salto del Sapo';
    const instructionText = "Observa el salto inicial para deducir la regla. Usa el 'palo de salto' como medida y arrastra la siguiente piedra para que la rana pueda cruzar.";

    const startNewRound = useCallback(() => {
        setFeedback(null);
        setDroppedRod(null);
        
        const interval = Math.random() < 0.6 ? 2 : 3;
        let startValue = 1;

        if (interval === 2) {
            startValue = Math.floor(Math.random() * 5) + 1; // 1-5, so max is 5+2+2 = 9
        } else { // interval === 3
            startValue = Math.floor(Math.random() * 2) + 1; // 1-2, so max is 2+3+3 = 8
        }
        
        const seqValues = [startValue, startValue + interval, startValue + 2 * interval];
        const sequenceRods = seqValues.map(v => ALL_CUISENAIRE_RODS.find(r => r.value === v)).filter(Boolean) as CuisenaireRodType[];
        
        if (sequenceRods.length < 3) { 
            startNewRound();
            return;
        }

        setBaseSequence(sequenceRods.slice(0, 2));
        setJumpStick(ALL_CUISENAIRE_RODS.find(r => r.value === interval)!);
        setCorrectRod(sequenceRods[2]);
        
        const distractors = shuffleArray(ALL_CUISENAIRE_RODS.filter(r => !sequenceRods.find(p => p.id === r.id))).slice(0, 3);
        setChoicePile(shuffleArray([sequenceRods[2], ...distractors]));

    }, []);
    
    const handleEndGame = useCallback(() => {
        setIsGameOver(true);
        const timeTakenMs = Date.now() - startTime;
        logActivity(`${gameTitle} completado.`, 'win');
        logPerformance({
            game_name: 'FrogJumpGame', level_name: levelId,
            incorrect_attempts: totalIncorrectAttempts, time_taken_ms: timeTakenMs, total_items: TOTAL_ROUNDS,
        });
        const points = 420 - (totalIncorrectAttempts * 18);
        setPointsAwarded(points);
        if (points > 0) addScore(points, `Completaste ${gameTitle}`);
        if (!completedActivities.has(levelId)) onUnlockAchievement('SERIATION_FROG_JUMP_WIN');
    }, [startTime, totalIncorrectAttempts, addScore, logActivity, logPerformance, onUnlockAchievement, completedActivities, levelId, gameTitle]);

    const handleDrop = useCallback((dropped: CuisenaireRodType) => {
        if (feedback || droppedRod) return;

        setDroppedRod(dropped);
        setChoicePile(prev => prev.filter(r => r.id !== dropped.id));
        
        if (dropped.id === correctRod?.id) {
            setFeedback({ type: 'correct', message: '¡Salto perfecto!' });
            setTimeout(() => {
                if (round < TOTAL_ROUNDS) {
                    setRound(r => r + 1);
                } else {
                    handleEndGame();
                }
            }, 1500);
        } else {
            setTotalIncorrectAttempts(p => p + 1);
            setFeedback({ type: 'incorrect', message: '¡Ese no es el salto correcto!' });
            setTimeout(() => {
                setDroppedRod(null);
                setChoicePile(prev => shuffleArray([...prev, dropped]));
                setFeedback(null);
            }, 1500);
        }
    }, [correctRod, droppedRod, feedback, round, handleEndGame]);

    const resetGame = useCallback(() => {
        logActivity(`Iniciando ${gameTitle}`, 'game');
        setRound(1);
        setIsGameOver(false);
        setPointsAwarded(0);
        setTotalIncorrectAttempts(0);
        setStartTime(Date.now());
    }, [gameTitle, logActivity]);
    
    useEffect(() => { resetGame(); }, [resetGame]);
    useEffect(() => { if (!isGameOver) startNewRound(); }, [round, isGameOver, startNewRound]);
    
    useEffect(() => {
        const el = dropZoneRef.current;
        if (!el) return;
        const handleTouchDrop = (e: Event) => {
            const customEvent = e as CustomEvent;
            const blockDataString = customEvent.detail.blockData;
            if (blockDataString && (e.target as HTMLElement).closest('[data-droptarget="true"]')) {
                handleDrop(JSON.parse(blockDataString));
            }
        };
        el.addEventListener('touchdrop', handleTouchDrop);
        return () => { el?.removeEventListener('touchdrop', handleTouchDrop); };
    }, [handleDrop]);
    
    const choicePileMaxHeight = useMemo(() => {
        if (choicePile.length === 0) return 40;
        return Math.max(...choicePile.map(r => r.value)) * 20 + 20;
    }, [choicePile]);

    const completionTitle = "¡Misión Cumplida!";
    const completionText = "¡Has ayudado a la rana a cruzar el arroyo!";

    return (
        <div className="flex flex-col items-center justify-start h-full pt-2">
            <div className="text-center mb-4">
                <h2 className="text-3xl font-bold text-emerald-700">{gameTitle}</h2>
                <p className="text-slate-600 text-sm mt-1 max-w-lg">{instructionText}</p>
                <p className="text-slate-500 text-sm">Ronda: {round} / {TOTAL_ROUNDS}</p>
            </div>

            {isGameOver && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
                    <div className="bg-white p-10 rounded-2xl shadow-2xl text-center">
                        <h3 className="text-4xl font-bold text-green-500 mb-4">{completionTitle}</h3>
                        <p className="text-lg text-slate-700 mb-2">{completionText}</p>
                        {pointsAwarded > 0 && <p className="text-xl font-bold text-green-600 mb-6">+{pointsAwarded} puntos</p>}
                        <div className="flex justify-center gap-4">
                            <button onClick={resetGame} className="px-6 py-3 bg-sky-500 text-white font-bold rounded-lg shadow-lg hover:bg-sky-600">Jugar de Nuevo</button>
                            <button onClick={onGoHome} className="px-6 py-3 bg-gray-400 text-white font-bold rounded-lg shadow-lg hover:bg-gray-500">Otros Juegos</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="w-full max-w-4xl flex-grow flex flex-col items-center justify-start">
                <div className="p-8 bg-sky-50 rounded-2xl shadow-inner flex items-end justify-center gap-1 h-72">
                    {baseSequence.map((rod, index) => <CuisenaireRod key={`${rod.id}-${index}`} rod={rod} />)}
                    {jumpStick && <div className="mx-2 opacity-60"><CuisenaireRod rod={jumpStick} /></div>}
                    <div ref={dropZoneRef} className="flex flex-col items-center justify-end h-full">
                        {droppedRod ? (
                            <div className={`${feedback?.type === 'incorrect' ? 'animate-shake' : ''}`}>
                                <CuisenaireRod rod={droppedRod} />
                            </div>
                        ) : (
                            <div
                                data-droptarget="true"
                                onDrop={(e: DragEvent<HTMLDivElement>) => { e.preventDefault(); const d = e.dataTransfer.getData('dienes-block'); if(d) handleDrop(JSON.parse(d)); }}
                                onDragOver={(e) => e.preventDefault()}
                                className="w-[20px] bg-slate-300/50 border-2 border-dashed border-slate-400 rounded-sm"
                                style={{ height: `${correctRod ? correctRod.value * 20 : 100}px` }}
                            />
                        )}
                    </div>
                </div>
                
                {feedback && <div className={`mt-2 px-3 py-1 rounded-md text-white text-sm ${feedback.type === 'correct' ? 'bg-green-500' : 'bg-red-500'}`}>{feedback.message}</div>}

                <div className="w-full max-w-md p-4 bg-rose-50 rounded-2xl shadow-inner flex flex-wrap items-end justify-center gap-4 mt-6 transition-all duration-300" style={{ minHeight: `${choicePileMaxHeight}px` }}>
                    {choicePile.map(rod => <CuisenaireRod key={rod.id} rod={rod} />)}
                </div>
                <HoverHelper text="Arrastra la pieza que encaja después del 'palo de salto'." />
            </div>
             <style>{`
                @keyframes shake {
                  0%, 100% { transform: translateX(0); }
                  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                  20%, 40%, 60%, 80% { transform: translateX(5px); }
                }
                .animate-shake { animation: shake 0.5s ease-in-out; }
            `}</style>
        </div>
    );
};

export default FrogJumpGame;