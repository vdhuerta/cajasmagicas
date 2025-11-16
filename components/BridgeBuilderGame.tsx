import React, { useState, useEffect, useCallback, DragEvent, useMemo, useRef } from 'react';
import { CuisenaireRodType, ActivityLogType } from '../types';
import { ALL_CUISENAIRE_RODS } from '../constants';
import { speakText } from '../utils/tts';
import { AudioIcon } from './icons/AudioIcon';
import { BridgeIcon } from './icons/BridgeIcon';

const TARGET_LENGTH = 10;
const NUM_TRACKS = 4;
const MAX_USES_PER_ROD = 3;

// NEW: Vertical Rod Component for building the bridge
const VerticalCuisenaireRod: React.FC<{ rod: CuisenaireRodType; onClick?: () => void; }> = ({ rod, onClick }) => {
    const { id, value, colorName, colorHex } = rod;
    const width = 20;
    const height = value * 20;

    return (
        <div
            id={id}
            onClick={onClick}
            className={`${onClick ? 'cursor-pointer' : 'cursor-default'} rounded-sm shadow-md`}
            style={{ width: `${width}px`, height: `${height}px`, backgroundColor: colorHex, border: '1px solid rgba(0,0,0,0.2)' }}
            title={`${colorName} (Valor: ${value})`}
            data-block={JSON.stringify(rod)}
        />
    );
};

// NEW: Horizontal Rod for inventory display
const HorizontalCuisenaireRod: React.FC<{ rod: CuisenaireRodType; }> = ({ rod }) => {
    const { id, value, colorName, colorHex } = rod;
    const width = value * 20;
    const height = 20;

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData('dienes-block', JSON.stringify(rod));
    };

    return (
        <div
            id={id}
            draggable
            onDragStart={handleDragStart}
            className={'cursor-grab active:cursor-grabbing transition-transform transform hover:scale-105 rounded-sm shadow-md'}
            style={{ width: `${width}px`, height: `${height}px`, backgroundColor: colorHex, border: '1px solid rgba(0,0,0,0.2)' }}
            title={`${colorName} (Valor: ${value})`}
            data-block={JSON.stringify(rod)}
        />
    );
};


interface BridgeBuilderGameProps {
  onGoHome: () => void;
  onUnlockAchievement: (id: string) => void;
  logActivity: (message: string, type: ActivityLogType, pointsEarned?: number) => void;
  addScore: (points: number, message: string) => void;
  completedActivities: Set<string>;
  logPerformance: (data: { game_name: string; level_name: string; incorrect_attempts: number; time_taken_ms: number; total_items: number }) => void;
}

const BridgeBuilderGame: React.FC<BridgeBuilderGameProps> = ({ onGoHome, onUnlockAchievement, logActivity, addScore, completedActivities, logPerformance }) => {
    const [gameState, setGameState] = useState<'building' | 'coding'>('building');
    const [inventory, setInventory] = useState<Record<number, number>>({});
    const [tracks, setTracks] = useState<CuisenaireRodType[][]>(Array(NUM_TRACKS).fill([]));
    const [codeInputs, setCodeInputs] = useState<string[]>(Array(NUM_TRACKS).fill(''));
    const [feedback, setFeedback] = useState<{ type: 'structure' | 'code' | 'general'; message: string } | null>(null);
    const [structureFeedback, setStructureFeedback] = useState<string[]>([]);
    const [isGameComplete, setIsGameComplete] = useState(false);
    const [pointsAwarded, setPointsAwarded] = useState(0);
    const [startTime, setStartTime] = useState<number>(0);
    const [incorrectAttempts, setIncorrectAttempts] = useState(0);
    const dropZoneRefs = useRef<(HTMLDivElement | null)[]>([]);

    const levelId = 'bridge_builder_game';

    const resetGame = useCallback(() => {
        logActivity('Iniciando El Puente', 'game');
        setGameState('building');
        setTracks(Array(NUM_TRACKS).fill([]));
        setCodeInputs(Array(NUM_TRACKS).fill(''));
        setFeedback(null);
        setStructureFeedback([]);
        setIsGameComplete(false);
        setPointsAwarded(0);
        setIncorrectAttempts(0);
        setStartTime(Date.now());
        
        const initialInventory: Record<number, number> = {};
        ALL_CUISENAIRE_RODS.filter(rod => rod.value !== 10).forEach(rod => {
            initialInventory[rod.value] = MAX_USES_PER_ROD;
        });
        setInventory(initialInventory);
    }, [logActivity]);

    useEffect(() => {
        resetGame();
    }, [resetGame]);

    const trackLengths = useMemo(() => tracks.map(track => track.reduce((sum, rod) => sum + rod.value, 0)), [tracks]);

    const handleDrop = useCallback((trackIndex: number, rod: CuisenaireRodType) => {
        if (gameState !== 'building' || trackLengths[trackIndex] + rod.value > TARGET_LENGTH || inventory[rod.value] <= 0) {
            // Shake effect or some visual feedback would be good here
            return;
        }

        setTracks(prevTracks => {
            const newTracks = [...prevTracks];
            newTracks[trackIndex] = [...newTracks[trackIndex], rod];
            return newTracks;
        });

        setInventory(prevInventory => ({
            ...prevInventory,
            [rod.value]: prevInventory[rod.value] - 1,
        }));
    }, [gameState, trackLengths, inventory]);
    
    const handleRemoveRod = (trackIndex: number, rodIndex: number) => {
        if (gameState !== 'building') return;

        const rodToRemove = tracks[trackIndex][rodIndex];
        
        setTracks(prevTracks => {
            const newTracks = [...prevTracks];
            newTracks[trackIndex] = newTracks[trackIndex].filter((_, i) => i !== rodIndex);
            return newTracks;
        });
        
        setInventory(prevInventory => ({
            ...prevInventory,
            [rodToRemove.value]: prevInventory[rodToRemove.value] + 1,
        }));
    };

    const handleCodeInputChange = (index: number, value: string) => {
        const newCodeInputs = [...codeInputs];
        newCodeInputs[index] = value;
        setCodeInputs(newCodeInputs);
    };

    const handleVerifyStructure = () => {
        const newStructureFeedback = trackLengths.map((len, index) => {
            if (len < TARGET_LENGTH) return `El carril ${index + 1} es muy corto.`;
            if (len > TARGET_LENGTH) return `El carril ${index + 1} es muy largo.`;
            return '¡Correcto!';
        });

        setStructureFeedback(newStructureFeedback);

        const allCorrect = newStructureFeedback.every(fb => fb === '¡Correcto!');
        if (allCorrect) {
            setFeedback({ type: 'structure', message: '¡La estructura del puente es perfecta! Ahora, a enviar el código secreto.' });
            setTimeout(() => {
                setGameState('coding');
                setFeedback(null);
            }, 2500);
        } else {
            setFeedback({ type: 'structure', message: 'Algunos carriles no tienen el largo correcto. ¡Revisa y corrige!' });
            setIncorrectAttempts(p => p + 1);
        }
    };

    const handleVerifyCode = () => {
        const isCodeCorrect = codeInputs.every((input, index) => {
            const trackValues = tracks[index].map(r => r.value);
            const userValuesStr = input.replace(/\s/g, '').split('+').filter(s => s); // filter empty strings from inputs like "5+"

            // Check for non-numeric or invalid parts
            if (userValuesStr.some(s => isNaN(parseInt(s, 10)))) return false;
            
            const userValues = userValuesStr.map(Number);
            
            // The sum of parts must equal the target length
            const userSum = userValues.reduce((a, b) => a + b, 0);
            if (userSum !== TARGET_LENGTH) return false;

            // Compare the multiset of numbers used, regardless of order
            const sortedTrackValues = [...trackValues].sort((a, b) => a - b);
            const sortedUserValues = [...userValues].sort((a, b) => a - b);
            
            if (sortedTrackValues.length !== sortedUserValues.length) return false;
            
            return sortedTrackValues.every((val, i) => val === sortedUserValues[i]);
        });


        if (isCodeCorrect) {
            setFeedback({ type: 'code', message: '¡Código correcto! ¡El castillo está a salvo!' });

            const timeTakenMs = Date.now() - startTime;
            logPerformance({
                game_name: 'BridgeBuilder',
                level_name: levelId,
                incorrect_attempts: incorrectAttempts,
                time_taken_ms: timeTakenMs,
                total_items: 1
            });
            
            if (!completedActivities.has(levelId)) {
                const points = 500 - (incorrectAttempts * 20);
                setPointsAwarded(points);
                addScore(points, `Completaste El Puente`);
                onUnlockAchievement('BRIDGE_BUILDER_WIN');
            }
            
            setTimeout(() => {
                setIsGameComplete(true);
            }, 2000);

        } else {
            setFeedback({ type: 'code', message: 'El código secreto no es correcto. Los enemigos podrían descubrir nuestro plan. ¡Inténtalo de nuevo!' });
            setIncorrectAttempts(p => p + 1);
        }
    };

    const gameTitle = "El Puente";
    const instructionText = "Construye 4 carriles de puente. Luego, ¡envía el CÓDIGO secreto de tu construcción!";
    const completionTitle = "¡Puente Reconstruido!";
    const completionText = "¡Has salvado el castillo! Tu ingenio ha sido clave para la victoria.";

    return (
        <div className="flex flex-col h-full items-center p-2 relative">
             <div className="text-center mb-2 flex-shrink-0">
                <div className="flex items-center justify-center gap-3">
                    <h2 className="text-3xl font-bold text-amber-800">{gameTitle}</h2>
                    <button onClick={() => speakText(gameTitle)} className="p-2 rounded-full hover:bg-amber-100 transition" aria-label={`Leer en voz alta: ${gameTitle}`}>
                        <AudioIcon className="w-6 h-6 text-amber-700" />
                    </button>
                </div>
                <p className="text-slate-600 max-w-2xl">{instructionText}</p>
            </div>

            {isGameComplete && (
                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-30">
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
            
            <div className="relative w-full max-w-[56.25rem] mx-auto">
                {/* 1. Castle Image (Base Layer) */}
                <img src="https://raw.githubusercontent.com/vdhuerta/assets-aplications/main/Castillo%20El%20Puente.png" alt="Castillo sin puente sobre un río" className="w-full h-auto" />
                
                {/* 2. Materials Panel (Overlay) */}
                 <div className="absolute top-[246px] left-4 z-10 w-72">
                    <div className="bg-stone-200/80 backdrop-blur-sm p-4 rounded-xl shadow-lg">
                        <h3 className="text-xl font-bold text-stone-700 text-center mb-3">Materiales</h3>
                        <div className="space-y-3 pr-2">
                            {ALL_CUISENAIRE_RODS.filter(rod => rod.value !== 10).sort((a,b) => a.value - b.value).map(rod => (
                                <div key={rod.id} className="flex items-center gap-2">
                                    <div className={`${inventory[rod.value] > 0 ? '' : 'opacity-30'}`}>
                                       <HorizontalCuisenaireRod rod={rod} />
                                    </div>
                                    <span className={`font-bold text-lg ${inventory[rod.value] > 0 ? 'text-stone-800' : 'text-stone-400'}`}>x {inventory[rod.value]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 3. Bridge Workspace (Overlay) */}
                <div className="absolute inset-x-0 bottom-[11.5%]">
                    <div className="grid grid-cols-4 gap-x-[3px] gap-y-2 w-max mx-auto">
                        {tracks.map((track, trackIndex) => (
                            <div
                                key={trackIndex}
                                ref={el => dropZoneRefs.current[trackIndex] = el}
                                onDrop={(e: DragEvent<HTMLDivElement>) => {
                                    e.preventDefault();
                                    const data = e.dataTransfer.getData('dienes-block');
                                    if (data) handleDrop(trackIndex, JSON.parse(data));
                                }}
                                onDragOver={(e) => e.preventDefault()}
                                className="w-12 h-60 bg-sky-300/20 backdrop-blur-sm rounded-md border-2 border-dashed border-white/60 flex flex-col items-center justify-end p-1 gap-px"
                            >
                                {track.map((rod, rodIndex) => (
                                    <VerticalCuisenaireRod key={`${rod.id}-${rodIndex}`} rod={rod} onClick={() => handleRemoveRod(trackIndex, rodIndex)} />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
             {/* Controls Area (Below the main scene) */}
            <div className="mt-4">
                {/* UI for Building Phase */}
                {gameState === 'building' && (
                    <div className="mt-4 text-center">
                        <button onClick={handleVerifyStructure} className="px-6 py-3 bg-green-500 text-white font-bold rounded-lg shadow-md hover:bg-green-600">Verificar Estructura</button>
                        <p className="text-xs text-slate-500 italic mt-2">
                            Una vez validada la estructura, debes enviar el código de construcción de cada carril al castillo.
                        </p>
                        {feedback?.type === 'structure' && <p className="mt-2 text-sm text-red-600 font-semibold">{feedback.message}</p>}
                    </div>
                )}
            </div>

             {/* UI for Coding Phase - MODAL */}
            {gameState === 'coding' && (
                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-start justify-center pt-20 z-20 animate-fade-in">
                    <div className="bg-amber-100 rounded-xl shadow-lg p-6 w-full max-w-3xl relative animate-fade-in-up">
                        <h3 className="text-2xl font-bold text-amber-800 text-center">¡Envía el Código Secreto!</h3>
                        <p className="text-sm text-center text-amber-700 mb-4">
                            Escribe el código que forma cada carril, comenzando por el de la izquierda (Carril 1), para que los enemigos no entiendan el plano.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            {codeInputs.map((code, index) => (
                                <div key={index} className="flex flex-col items-center">
                                    <label className="font-bold text-slate-700 mb-1">Carril {index + 1}</label>
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={(e) => handleCodeInputChange(index, e.target.value)}
                                        className="w-full text-center p-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 text-center">
                            <button onClick={handleVerifyCode} className="px-8 py-3 bg-blue-500 text-white font-bold text-lg rounded-xl shadow-lg hover:bg-blue-600 transition">
                                Verificar Código
                            </button>
                            {feedback?.type === 'code' && (
                                <p className={`mt-2 text-sm font-semibold ${feedback.message.includes('correcto') ? 'text-green-600' : 'text-red-600'}`}>
                                    {feedback.message}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
             <style>{`
                @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
                }
                .animate-shake { animation: shake 0.5s ease-in-out; }
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default BridgeBuilderGame;