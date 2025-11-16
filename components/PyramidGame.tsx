import React, { useState, useEffect, useCallback, useMemo, DragEvent } from 'react';
import { DienesBlockType, ActivityLogType, Shape, Color, Size, Thickness } from '../types';
import { LEVEL_NAME_TRANSLATIONS } from '../constants';
import DienesBlock from './DienesBlock';
import { speakText } from '../utils/tts';

const TOTAL_ROUNDS = 3;
const CELL_SIZE = 24; // px, reduced for better fit

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

interface PyramidGameProps {
  onGoHome: () => void;
  onUnlockAchievement: (id: string) => void;
  logActivity: (message: string, type: ActivityLogType, pointsEarned?: number) => void;
  addScore: (points: number, message: string) => void;
  completedActivities: Set<string>;
  logPerformance: (data: { game_name: string; level_name: string; incorrect_attempts: number; time_taken_ms: number; total_items: number }) => void;
}

const PyramidGame: React.FC<PyramidGameProps> = ({ onGoHome, onUnlockAchievement, logActivity, addScore, completedActivities, logPerformance }) => {
  const [round, setRound] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  const [baseSize, setBaseSize] = useState(10);
  const [targetSize, setTargetSize] = useState(9);
  const [grid, setGrid] = useState<(DienesBlockType | null)[]>([]);
  const [ghostIndices, setGhostIndices] = useState<Set<number>>(new Set());
  const [choicePile, setChoicePile] = useState<DienesBlockType[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect'; message: string } | null>(null);
  const [pointsAwarded, setPointsAwarded] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [totalIncorrectAttempts, setTotalIncorrectAttempts] = useState(0);

  const levelId = 'seriation_pyramid_game';
  const gameTitle = LEVEL_NAME_TRANSLATIONS[levelId as keyof typeof LEVEL_NAME_TRANSLATIONS];
  const instructionText = "Arrastra los bloques amarillos para rellenar el área más clara y así construir el siguiente nivel de la pirámide.";

  const baseBlock = useMemo(() => ({ id: 'base-block', shape: Shape.Square, color: Color.Red, size: Size.Large, thickness: Thickness.Thick }), []);
  const buildBlock = useMemo(() => ({ id: 'build-block', shape: Shape.Square, color: Color.Yellow, size: Size.Small, thickness: Thickness.Thin }), []);

  const startNewRound = useCallback(() => {
    setFeedback(null);
    const newBaseSize = 12 - (round * 2); // 10, 8, 6
    const newTargetSize = newBaseSize - 2;
    setBaseSize(newBaseSize);
    setTargetSize(newTargetSize);
    setGrid(Array(newBaseSize * newBaseSize).fill(null));

    const newGhostIndices = new Set<number>();
    for (let row = 1; row < newBaseSize - 1; row++) {
      for (let col = 1; col < newBaseSize - 1; col++) {
        newGhostIndices.add(row * newBaseSize + col);
      }
    }
    setGhostIndices(newGhostIndices);
    
    const pile = Array(newTargetSize * newTargetSize).fill(null).map((_, i) => ({
        ...buildBlock,
        id: `build-block-${i}`
    }));
    setChoicePile(pile);

  }, [round, buildBlock]);

  const resetGame = useCallback(() => {
    logActivity(`Iniciando ${gameTitle}`, 'game');
    setRound(1);
    setIsGameOver(false);
    setPointsAwarded(0);
    setTotalIncorrectAttempts(0);
    setStartTime(Date.now());
  }, [gameTitle, logActivity]);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  useEffect(() => {
    if (!isGameOver) startNewRound();
  }, [round, isGameOver, startNewRound]);
  
  const handleDrop = (index: number, block: DienesBlockType) => {
    if (grid[index] || !ghostIndices.has(index) || feedback?.type === 'correct') return;

    setGrid(prev => {
        const newGrid = [...prev];
        newGrid[index] = { ...block, id: `placed-${index}` };
        return newGrid;
    });

    setChoicePile(prev => {
        const pile = [...prev];
        pile.pop();
        return pile;
    });
  };

  const handleReturnToPile = (index: number) => {
    if (!grid[index] || feedback?.type === 'correct') return;
     setGrid(prev => {
        const newGrid = [...prev];
        newGrid[index] = null;
        return newGrid;
    });
    setChoicePile(prev => [...prev, { ...buildBlock, id: `build-block-${prev.length}` }]);
  }

  const handleCheck = () => {
    const placedBlocksCount = grid.filter(cell => cell !== null).length;
    if (placedBlocksCount === 0) {
        setFeedback({ type: 'incorrect', message: '¡Debes construir algo primero!' });
        setTimeout(() => setFeedback(null), 2000);
        return;
    }

    const correctBlocksCount = ghostIndices.size;
    let placedOnGhost = 0;
    let placedOutsideGhost = 0;

    grid.forEach((cell, index) => {
        if (cell !== null) {
            if (ghostIndices.has(index)) {
                placedOnGhost++;
            } else {
                placedOutsideGhost++;
            }
        }
    });

    if (placedOutsideGhost > 0) {
        setFeedback({ type: 'incorrect', message: 'Has colocado bloques fuera del área correcta.' });
        setTotalIncorrectAttempts(p => p + 1);
        setTimeout(() => setFeedback(null), 2500);
        return;
    }

    if (placedOnGhost < correctBlocksCount) {
        setFeedback({ type: 'incorrect', message: 'Faltan bloques para completar el cuadrado.' });
        setTotalIncorrectAttempts(p => p + 1);
        setTimeout(() => setFeedback(null), 2500);
        return;
    }

    if (placedOnGhost === correctBlocksCount && placedOutsideGhost === 0) {
        setFeedback({ type: 'correct', message: '¡Nivel perfecto!' });
        setTimeout(() => (round < TOTAL_ROUNDS ? setRound(r => r + 1) : handleEndGame()), 2000);
    }
  };

  const handleEndGame = () => {
    setIsGameOver(true);
    const timeTakenMs = Date.now() - startTime;
    logActivity(`${gameTitle} completado.`, 'win');
    logPerformance({
        game_name: 'PyramidGame', level_name: levelId,
        incorrect_attempts: totalIncorrectAttempts, time_taken_ms: timeTakenMs, total_items: TOTAL_ROUNDS,
    });
    const points = 450 - (totalIncorrectAttempts * 20);
    setPointsAwarded(points);
    if (points > 0) addScore(points, `Completaste ${gameTitle}`);
    if (!completedActivities.has(levelId)) onUnlockAchievement('SERIATION_PYRAMID_WIN');
  };

  const completionTitle = "¡Gran Arquitecto!";
  const completionText = "¡Has completado la pirámide con éxito!";

  return (
    <div className="flex flex-col items-center justify-start h-full pt-2">
        <div className="text-center mb-2">
            <h2 className="text-3xl font-bold text-amber-700">{gameTitle}</h2>
            <p className="text-slate-600 text-sm mt-1">{instructionText}</p>
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

        <div className="flex-grow w-full max-w-4xl flex flex-col md:flex-row items-center justify-center gap-6">
            <div className="p-4 bg-rose-50 rounded-2xl shadow-inner flex flex-col items-center gap-3 order-2 md:order-1">
                 <h3 className="font-bold text-slate-700">Bloques para Construir</h3>
                 <div className="w-48 h-48 flex flex-wrap items-start justify-center gap-1 overflow-y-auto p-1 bg-white/50 rounded">
                    {choicePile.map(rod => (
                        <DienesBlock key={rod.id} block={rod} />
                    ))}
                 </div>
            </div>
            <div className="flex flex-col items-center order-1 md:order-2">
                <div
                    className="grid gap-px bg-slate-200 shadow-inner p-1 rounded-md"
                    style={{
                        gridTemplateColumns: `repeat(${baseSize}, ${CELL_SIZE}px)`,
                        gridTemplateRows: `repeat(${baseSize}, ${CELL_SIZE}px)`,
                    }}
                >
                    {grid.map((cell, index) => {
                        const isGhost = ghostIndices.has(index);
                        return(
                            <div
                                key={index}
                                data-droptarget="true"
                                onDrop={(e: DragEvent<HTMLDivElement>) => { e.preventDefault(); const d = e.dataTransfer.getData('dienes-block'); if(d) handleDrop(index, JSON.parse(d)); }}
                                onDragOver={(e) => e.preventDefault()}
                                onClick={() => handleReturnToPile(index)}
                                className={`transition-colors ${cell ? 'cursor-pointer' : ''}`}
                                style={{
                                    width: `${CELL_SIZE}px`,
                                    height: `${CELL_SIZE}px`,
                                    backgroundColor: cell ? buildBlock.color : (isGhost ? 'rgba(255, 255, 255, 0.5)' : baseBlock.color),
                                    outline: cell ? '1px solid rgba(0,0,0,0.2)' : 'none',
                                }}
                            >
                               {cell && <div className="w-full h-full flex items-center justify-center"><DienesBlock block={cell} /></div> }
                            </div>
                        );
                    })}
                </div>
                <div className="mt-4 flex gap-4 items-center">
                    <button onClick={handleCheck} disabled={feedback?.type === 'correct'}
                        className="px-6 py-2 bg-lime-500 text-white font-bold rounded-lg shadow-md hover:bg-lime-600 transition disabled:bg-slate-300">
                        ¡Listo!
                    </button>
                </div>
                {feedback && <div className={`mt-2 px-3 py-1 rounded-md text-white text-sm ${feedback.type === 'correct' ? 'bg-green-500' : 'bg-red-500'}`}>{feedback.message}</div>}
            </div>
        </div>
    </div>
  );
};

export default PyramidGame;