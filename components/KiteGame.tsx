import React, { useState, useEffect, useCallback, DragEvent, useMemo, useRef } from 'react';
import { CuisenaireRodType, ActivityLogType } from '../types';
import { ALL_CUISENAIRE_RODS, LEVEL_NAME_TRANSLATIONS } from '../constants';
import HoverHelper from './HoverHelper';
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

const HorizontalCuisenaireRod: React.FC<{ rod: CuisenaireRodType; onClick?: () => void; isDraggable?: boolean }> = ({ rod, onClick, isDraggable = true }) => {
    const { id, value, colorName, colorHex } = rod;
    const width = value * 20; // 20px per unit value
    const height = 20;
    const cursorClass = onClick ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing';

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData('dienes-block', JSON.stringify(rod));
    };

    const title = `${colorName} (Valor: ${value})`;

    return (
        <div
            id={id}
            draggable={isDraggable}
            onDragStart={handleDragStart}
            onClick={onClick}
            className={`${cursorClass} transition-transform transform hover:scale-105 rounded-sm shadow-md`}
            style={{
                width: `${width}px`,
                height: `${height}px`,
                backgroundColor: colorHex,
                border: '1px solid rgba(0,0,0,0.2)',
            }}
            title={title}
            data-block={JSON.stringify(rod)} // For touch compatibility
        />
    );
};


interface KiteGameProps {
  onGoHome: () => void;
  onUnlockAchievement: (id: string) => void;
  logActivity: (message: string, type: ActivityLogType, pointsEarned?: number) => void;
  addScore: (points: number, message: string) => void;
  completedActivities: Set<string>;
  logPerformance: (data: { game_name: string; level_name: string; incorrect_attempts: number; time_taken_ms: number; total_items: number }) => void;
}

type AnimationStep = 'idle' | 'walking' | 'climbing' | 'waiting' | 'finished';

const KiteGame: React.FC<KiteGameProps> = ({ onGoHome, onUnlockAchievement, logActivity, addScore, completedActivities, logPerformance }) => {
  const [rodsInPile, setRodsInPile] = useState<CuisenaireRodType[]>([]);
  const [structureRods, setStructureRods] = useState<CuisenaireRodType[]>([]);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect'; message: string } | null>(null);
  const [pointsAwarded, setPointsAwarded] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [totalIncorrectAttempts, setTotalIncorrectAttempts] = useState(0);
  const [isOver, setIsOver] = useState(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Animation states
  const [animationStep, setAnimationStep] = useState<AnimationStep>('idle');
  const [jorgePosition, setJorgePosition] = useState({ left: '5%', bottom: '3rem', transform: 'translateX(0)' });

  
  const levelId = 'seriation_kite_game';
  const gameTitle = LEVEL_NAME_TRANSLATIONS[levelId as keyof typeof LEVEL_NAME_TRANSLATIONS];
  const instructionText = "Jorge necesita ayuda para rescatar su volantín. Construye una estructura con las regletas para que pueda subir. La estructura debe ser estable y coherente.";

  const correctSequenceValues = useMemo(() => [10, 9, 8, 7, 6, 5, 4, 3, 2, 1], []);

  const resetGame = useCallback(() => {
    logActivity(`Iniciando ${gameTitle}`, 'game');
    setIsGameComplete(false);
    setPointsAwarded(0);
    setTotalIncorrectAttempts(0);
    setFeedback(null);
    setStructureRods([]);
    setRodsInPile(shuffleArray([...ALL_CUISENAIRE_RODS]));
    setStartTime(Date.now());
    // Reset animation
    setAnimationStep('idle');
    setJorgePosition({ left: '5%', bottom: '3rem', transform: 'translateX(0)' });
  }, [gameTitle, logActivity]);
  
  useEffect(() => {
    resetGame();
  }, [resetGame]);
  
  useEffect(() => {
    if (animationStep === 'walking') {
        // Walk to the base of the ladder (horizontally centered on the drop zone)
        setJorgePosition({ left: 'calc(100% - 18% - 2rem - 105px)', bottom: '3rem', transform: 'translateX(-50%)' });
        setTimeout(() => setAnimationStep('climbing'), 2000); // 2s walking animation
    } else if (animationStep === 'climbing') {
        // Climb diagonally to the kite's position
        setJorgePosition({ left: 'calc(100% - 18% - 7rem)', bottom: '236px', transform: 'translateX(-50%)' });
        setTimeout(() => setAnimationStep('waiting'), 2500); // 2.5s climbing animation
    } else if (animationStep === 'waiting') {
        // Wait for 6 seconds at the top
        setTimeout(() => {
            setAnimationStep('finished');
        }, 6000); 
    } else if (animationStep === 'finished') {
        // Show the final completion modal
        setIsGameComplete(true);
    }
  }, [animationStep]);

  const handleDrop = useCallback((rod: CuisenaireRodType) => {
    if (isGameComplete || animationStep !== 'idle' || structureRods.some(r => r.id === rod.id)) return;
    setStructureRods(prev => [...prev, rod]);
    setRodsInPile(prev => prev.filter(r => r.id !== rod.id));
  }, [isGameComplete, structureRods, animationStep]);
  
  const handleReturnToPile = (rodToReturn: CuisenaireRodType) => {
    if (isGameComplete || animationStep !== 'idle') return;

    setStructureRods(prevStructure => {
        const rodIndex = prevStructure.findIndex(r => r.id === rodToReturn.id);
        if (rodIndex === -1) return prevStructure;

        const rodsToReturnToPile = prevStructure.slice(rodIndex);
        const remainingRodsInStructure = prevStructure.slice(0, rodIndex);

        setRodsInPile(prevPile => [...prevPile, ...rodsToReturnToPile]);

        return remainingRodsInStructure;
    });
  };
  
    useEffect(() => {
        const el = dropZoneRef.current;
        if (!el || animationStep !== 'idle') return;

        const handleTouchDrop = (e: Event) => {
            const customEvent = e as CustomEvent;
            const blockDataString = customEvent.detail.blockData;
            if (blockDataString && (e.target as HTMLElement).closest('[data-droptarget="true"]')) {
                const block = JSON.parse(blockDataString);
                handleDrop(block);
            }
            setIsOver(false);
        };

        const handleTouchDragEnter = (e: Event) => {
            if ((e.target as HTMLElement).closest('[data-droptarget="true"]')) {
                 setIsOver(true);
            }
        };
        const handleTouchDragLeave = () => {
            setIsOver(false);
        };

        el.addEventListener('touchdrop', handleTouchDrop);
        el.addEventListener('touchdragenter', handleTouchDragEnter);
        el.addEventListener('touchdragleave', handleTouchDragLeave);

        return () => {
            el.removeEventListener('touchdrop', handleTouchDrop);
            el.removeEventListener('touchdragenter', handleTouchDragEnter);
            el.removeEventListener('touchdragleave', handleTouchDragLeave);
        };
    }, [handleDrop, animationStep]);

  const handleCheckStructure = () => {
    const userSequenceValues = structureRods.map(r => r.value);
    
    if (userSequenceValues.length === 0) {
        setFeedback({ type: 'incorrect', message: `¡Debes construir la estructura primero!` });
        setTotalIncorrectAttempts(p => p + 1);
        setTimeout(() => setFeedback(null), 2500);
        return;
    }
    
    const isCorrect = userSequenceValues.length === correctSequenceValues.length && userSequenceValues.every((val, index) => val === correctSequenceValues[index]);

    if (isCorrect) {
        setFeedback({ type: 'correct', message: '¡Estructura perfecta!' });
        
        setTimeout(() => {
             setAnimationStep('walking');
        }, 1500);
       
        const timeTakenMs = Date.now() - startTime;
        logPerformance({
            game_name: 'KiteGame',
            level_name: levelId,
            incorrect_attempts: totalIncorrectAttempts,
            time_taken_ms: timeTakenMs,
            total_items: 1
        });

        if (!completedActivities.has(levelId)) {
            const points = 400 - (totalIncorrectAttempts * 15);
            setPointsAwarded(points);
            addScore(points, `Completaste ${gameTitle}`);
            onUnlockAchievement('SERIATION_KITE_WIN');
        }
    } else {
        setFeedback({ type: 'incorrect', message: 'El orden no es correcto o faltan piezas. ¡Intenta de nuevo!' });
        setTotalIncorrectAttempts(p => p + 1);
        setTimeout(() => setFeedback(null), 2500);
    }
  };

  const completionTitle = "¡Volantín Rescatado!";
  const completionText = "¡Gracias a tu escalera, Jorge pudo recuperar su volantín!";
  
  const half = Math.ceil(rodsInPile.length / 2);
  const firstHalf = rodsInPile.slice(0, half);
  const secondHalf = rodsInPile.slice(half);

  return (
    <div className="flex flex-col h-full overflow-hidden">
        <div className="text-center mb-2 flex-shrink-0">
            <h2 className="text-3xl font-bold text-cyan-700">{gameTitle}</h2>
            <div className="flex items-center justify-center gap-2 mt-1 max-w-lg mx-auto">
                <p className="text-slate-600 text-sm">{instructionText}</p>
                <button onClick={() => speakText(instructionText)} className="p-2 rounded-full hover:bg-cyan-100 transition flex-shrink-0" aria-label={`Leer en voz alta: ${instructionText}`}>
                    <AudioIcon className="w-5 h-5 text-cyan-700"/>
                </button>
            </div>
        </div>

        {isGameComplete && (
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
        
        <div className="flex-grow w-full relative select-none">
            {/* Tree */}
            <div className="absolute bottom-12 right-[10%] w-6 bg-[#6B4F2E] h-48 rounded-t-md"></div>
            <div className="absolute bottom-52 right-[5%] w-40 h-40 bg-green-600 rounded-full opacity-80"></div>
            <div className="absolute bottom-48 right-[12%] w-32 h-32 bg-green-700 rounded-full opacity-80"></div>

            {/* Kite */}
            <div className="absolute bottom-[296px] right-[18%] w-16 h-16 transform -rotate-45 pointer-events-none">
                <div className="absolute top-0 left-0 w-8 h-8 bg-red-500"></div>
                <div className="absolute top-0 right-0 w-8 h-8 bg-yellow-400"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 bg-green-500"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500"></div>
            </div>
            
            {/* Boy */}
            <img 
                src="https://raw.githubusercontent.com/vdhuerta/assets-aplications/main/NinoDelVolantin.png"
                alt="Jorge, el niño que perdió su volantín"
                className="absolute w-24 z-10 pointer-events-none transition-all duration-[2500ms] ease-in-out"
                style={jorgePosition}
            />

             {/* Vertical Dashed Line */}
            <div className="absolute w-px pointer-events-none" style={{ bottom: '3rem', height: '248px', right: 'calc(18% + 2rem)', background: 'repeating-linear-gradient(black 0, black 4px, transparent 4px, transparent 8px)' }}></div>
            
            {/* Horizontal Base Line */}
            <div className="absolute bottom-12 h-px bg-black pointer-events-none" style={{ left: 'calc(5% + 4rem)', right: 'calc(18% + 2rem)' }}></div>

            {/* Drop Zone */}
            <div
                ref={dropZoneRef}
                data-droptarget="true"
                onDrop={(e: DragEvent<HTMLDivElement>) => {
                    e.preventDefault();
                    setIsOver(false);
                    const data = e.dataTransfer.getData('dienes-block');
                    if(data) handleDrop(JSON.parse(data));
                }}
                onDragOver={(e) => { e.preventDefault(); setIsOver(true); }}
                onDragLeave={() => setIsOver(false)}
                className={`absolute bottom-12 flex flex-col-reverse items-end gap-px transition-colors ${isOver && animationStep === 'idle' ? 'bg-green-200/50' : ''}`}
                style={{ right: 'calc(18% + 2rem)', width: '210px', height: '240px' }}
            >
                {structureRods.map(rod => (
                    <div 
                        key={rod.id} 
                        data-droptarget="true"
                        className="flex justify-end w-full"
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsOver(true); }}
                        onDrop={(e: DragEvent<HTMLDivElement>) => {
                            e.preventDefault();
                            e.stopPropagation(); 
                            setIsOver(false);
                            const data = e.dataTransfer.getData('dienes-block');
                            if (data) handleDrop(JSON.parse(data));
                        }}
                         onDragLeave={(e) => { e.stopPropagation(); setIsOver(false); }}
                    >
                         <HorizontalCuisenaireRod rod={rod} onClick={() => handleReturnToPile(rod)} isDraggable={false} />
                    </div>
                ))}
            </div>
        </div>
        
        <div className="flex-shrink-0 w-full flex flex-col items-center py-2">
            <div className="relative mb-2">
                <button
                    onClick={handleCheckStructure}
                    disabled={isGameComplete || animationStep !== 'idle'}
                    className="px-8 py-3 bg-lime-500 text-white font-bold rounded-xl shadow-lg hover:bg-lime-600 transition disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                    Verificar Estructura
                </button>
                {feedback && (
                    <div className={`absolute top-full mt-1 left-1/2 -translate-x-1/2 w-max px-3 py-1 rounded-md text-white text-sm font-semibold ${feedback.type === 'correct' ? 'bg-green-500' : 'bg-red-500'}`}>
                        {feedback.message}
                    </div>
                )}
            </div>
             <div className="w-full h-28 p-2 bg-rose-50 rounded-t-2xl shadow-inner flex flex-col items-center justify-center gap-2">
                <div className="flex flex-wrap items-center justify-center gap-2">
                    {firstHalf.map(rod => (
                        <HorizontalCuisenaireRod key={rod.id} rod={rod} isDraggable={animationStep === 'idle'} />
                    ))}
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                    {secondHalf.map(rod => (
                        <HorizontalCuisenaireRod key={rod.id} rod={rod} isDraggable={animationStep === 'idle'} />
                    ))}
                </div>
            </div>
            <HoverHelper text="Arrastra las regletas al área sobre la línea negra para construir la estructura." />
        </div>
    </div>
  );
};

export default KiteGame;