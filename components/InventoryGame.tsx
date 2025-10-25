

import React, { useState, useEffect, DragEvent, useRef, useCallback } from 'react';
import { DienesBlockType, InventoryGameDifficulty, InventoryOrder, ClassificationRule, ActivityLogType, Shape, Color, Size, Thickness } from '../types';
import { ALL_DIENES_BLOCKS, TRANSLATIONS } from '../constants';
import DienesBlock from './DienesBlock';
import { speakText } from '../utils/tts';
import { AudioIcon } from './icons/AudioIcon';
import { ElfIcon } from './icons/ElfIcon';

const TOTAL_ROUNDS = 3;

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

const generateOrder = (difficulty: InventoryGameDifficulty): InventoryOrder => {
    let rule: ClassificationRule = {};
    let maxPossibleCount = 0;

    const difficultyParams = {
        'Básico': { numAttributes: 1, minCount: 2, maxCount: 4 },
        'Medio': { numAttributes: 2, minCount: 3, maxCount: 5 },
        'Experto': { numAttributes: 3, minCount: 2, maxCount: 4 },
    }[difficulty];

    while (maxPossibleCount < difficultyParams.minCount) {
        rule = {};
        
        const attributesPool: (keyof ClassificationRule)[] = ['shape', 'color', 'size', 'thickness'];
        const shuffledAttributes = shuffleArray(attributesPool);
        const selectedAttributes = shuffledAttributes.slice(0, difficultyParams.numAttributes);

        for (const attr of selectedAttributes) {
            let values: string[] = [];
            if (attr === 'shape') values = Object.values(Shape);
            if (attr === 'color') values = Object.values(Color);
            if (attr === 'size') values = Object.values(Size);
            if (attr === 'thickness') values = Object.values(Thickness);
            
            const randomValue = values[Math.floor(Math.random() * values.length)];
            (rule as any)[attr] = randomValue;
        }
        
        maxPossibleCount = ALL_DIENES_BLOCKS.filter(b => checkBlockRule(b, rule)).length;
    }
    
    const effectiveMaxCount = Math.min(difficultyParams.maxCount, maxPossibleCount);

    const lowerBound = difficultyParams.minCount;
    const upperBound = Math.max(lowerBound, effectiveMaxCount);

    const count = Math.floor(Math.random() * (upperBound - lowerBound + 1)) + lowerBound;

    // --- Description generation logic ---
    const tempRule = { ...rule };
    let shapePart = '';
    const adjectiveParts: string[] = [];
    const adjectiveOrder: (keyof ClassificationRule)[] = ['size', 'thickness', 'color'];

    if (tempRule.shape) {
        let shapeName = TRANSLATIONS[tempRule.shape];
        if (count > 1) {
            if (shapeName.endsWith('o') || shapeName.endsWith('a')) {
                 shapeName = shapeName.slice(0, -1) + 'os';
            } else if (shapeName.endsWith('l')) {
                 shapeName += 'es';
            }
            else {
                 shapeName += 's';
            }
        }
        shapePart = shapeName;
        delete tempRule.shape;
    }

    adjectiveOrder.forEach(adjKey => {
        if (tempRule[adjKey]) {
            let adj = TRANSLATIONS[tempRule[adjKey]!];
            if (count > 1) {
                 if (adj.endsWith('l')) {
                    adj = adj.slice(0, -1) + 'les';
                 } else if (adj.endsWith('o') || adj.endsWith('a')) {
                    adj = adj.slice(0, -1) + 'os';
                 } else {
                    adj += 's';
                 }
            }
            adjectiveParts.push(adj);
        }
    });

    let fullDescription: string;
    if (shapePart) {
        fullDescription = [shapePart, ...adjectiveParts].join(' ');
    } else {
        const noun = count > 1 ? 'figuras' : 'figura';
        fullDescription = [noun, ...adjectiveParts].join(' ');
    }
    
    const description = `¡Necesito ${count} ${fullDescription.charAt(0).toUpperCase() + fullDescription.slice(1)}!`;
    
    return { rule, count, description };
};


interface InventoryGameProps {
  difficulty: InventoryGameDifficulty;
  onGoHome: () => void;
  onUnlockAchievement: (id: string) => void;
  logActivity: (message: string, type: ActivityLogType) => void;
  addScore: (points: number, message: string) => void;
  onLevelComplete: (levelName: string) => void;
  completedLevels: Record<string, boolean>;
}

const InventoryGame: React.FC<InventoryGameProps> = ({ difficulty, onGoHome, onUnlockAchievement, logActivity, addScore, onLevelComplete, completedLevels }) => {
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [currentOrder, setCurrentOrder] = useState<InventoryOrder | null>(null);
  const [blocksInPile, setBlocksInPile] = useState<DienesBlockType[]>([]);
  const [blocksInBasket, setBlocksInBasket] = useState<DienesBlockType[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [feedback, setFeedback] = useState<{type: 'correct' | 'incorrect', message: string} | null>(null);
  const [isBasketOver, setIsBasketOver] = useState(false);
  const [pointsAwarded, setPointsAwarded] = useState(0);
  const basketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startNewRound();
  }, [round, difficulty]);
  
  const handleDropInBasket = useCallback((blockData: DienesBlockType) => {
    setBlocksInPile(prev => prev.filter(b => b.id !== blockData.id));
    setBlocksInBasket(prev => [...prev, blockData]);
  }, []);

  useEffect(() => {
    const element = basketRef.current;
    if (!element) return;

    const handleTouchDrop = (e: Event) => {
        const customEvent = e as CustomEvent;
        const block = JSON.parse(customEvent.detail.blockData);
        handleDropInBasket(block);
        setIsBasketOver(false);
    };

    const handleTouchDragEnter = () => setIsBasketOver(true);
    const handleTouchDragLeave = () => setIsBasketOver(false);
    
    element.addEventListener('touchdrop', handleTouchDrop);
    element.addEventListener('touchdragenter', handleTouchDragEnter);
    element.addEventListener('touchdragleave', handleTouchDragLeave);

    return () => {
        element.removeEventListener('touchdrop', handleTouchDrop);
        element.removeEventListener('touchdragenter', handleTouchDragEnter);
        element.removeEventListener('touchdragleave', handleTouchDragLeave);
    };
  }, [handleDropInBasket]);

  const startNewRound = () => {
    const order = generateOrder(difficulty);
    setCurrentOrder(order);

    const requiredBlocks = shuffleArray(ALL_DIENES_BLOCKS.filter(b => checkBlockRule(b, order.rule))).slice(0, order.count);
    const distractorBlocks = shuffleArray(ALL_DIENES_BLOCKS.filter(b => !checkBlockRule(b, order.rule))).slice(0, 15 - order.count);
    
    setBlocksInPile(shuffleArray([...requiredBlocks, ...distractorBlocks]));
    setBlocksInBasket([]);
    setFeedback(null);
  };
  
  const handleCheckInventory = () => {
      if (!currentOrder) return;
      
      const isCorrectCount = blocksInBasket.length === currentOrder.count;
      const allItemsMatch = blocksInBasket.every(block => checkBlockRule(block, currentOrder.rule));

      if (isCorrectCount && allItemsMatch) {
          setFeedback({ type: 'correct', message: '¡Perfecto! Justo lo que necesitaba.' });
          logActivity(`Ronda ${round} (${difficulty}) completada correctamente.`, 'system');
          const newScore = score + 1;
          setScore(newScore);
          setTimeout(() => {
              if (round < TOTAL_ROUNDS) {
                  setRound(r => r + 1);
              } else {
                  setIsGameOver(true);
                  const levelKey = `Inventory Game ${difficulty}`;
                  
                  if (!completedLevels[levelKey]) {
                    let basePoints = 0;
                    let achievementId: string | null = null;
                    switch(difficulty) {
                        case 'Básico': basePoints = 100; achievementId = 'INVENTORY_BASIC_WIN'; break;
                        case 'Medio': basePoints = 150; achievementId = 'INVENTORY_MEDIUM_WIN'; break;
                        case 'Experto': basePoints = 200; achievementId = 'INVENTORY_EXPERT_WIN'; break;
                    }
                    const totalPoints = newScore * basePoints;
                    setPointsAwarded(totalPoints);
                    if (totalPoints > 0) {
                        addScore(totalPoints, `Completaste el Inventario (${difficulty})`);
                    }
                    if (achievementId) {
                        onUnlockAchievement(achievementId);
                    }
                  }
                  onLevelComplete(levelKey);
                  logActivity(`Juego del Inventario (${difficulty}) completado con ${newScore} aciertos.`, 'win');
              }
          }, 2000);
      } else {
          logActivity(`Intento incorrecto en el Inventario (Ronda ${round}, ${difficulty})`, 'system');
          let message = "¡Uy! Algo no está bien. ";
          if (!isCorrectCount) {
              message += `Necesito ${currentOrder.count} piezas, no ${blocksInBasket.length}.`;
          } else { 
              message += "Revisa bien las figuras que pusiste en la cesta.";
          }
          setFeedback({ type: 'incorrect', message });
          setTimeout(() => setFeedback(null), 2500);
      }
  };
  
  const handleDragDrop = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsBasketOver(false);
      const blockData = JSON.parse(e.dataTransfer.getData('dienes-block')) as DienesBlockType;
      handleDropInBasket(blockData);
  };
  
  const moveFromBasketToPile = (block: DienesBlockType) => {
      setBlocksInBasket(prev => prev.filter(b => b.id !== block.id));
      setBlocksInPile(prev => [...prev, block]);
  };

  const gameTitle = "El Inventario del Duende";
  const completionTitle = "¡Trabajo Terminado!";
  const completionText = `¡Gracias a tu ayuda, el duende completó sus inventos! Acertaste ${score} de ${TOTAL_ROUNDS} pedidos.`;

  return (
    <div className="flex flex-col h-full">
        <div className="flex items-center justify-center gap-3 mb-2">
            <h2 className="text-3xl font-bold text-center text-lime-700">{gameTitle}</h2>
            <button onClick={() => speakText(gameTitle)} className="p-2 rounded-full hover:bg-lime-100 transition" aria-label={`Leer en voz alta: ${gameTitle}`}>
                <AudioIcon className="text-lime-800"/>
            </button>
        </div>
        <p className="text-center text-slate-600 mb-4">Nivel: <strong>{difficulty}</strong> - Ronda: <strong>{round}</strong> / {TOTAL_ROUNDS}</p>

        {isGameOver && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
                <div className="bg-white p-10 rounded-2xl shadow-2xl text-center">
                    <h3 className="text-4xl font-bold text-green-500 mb-4">{completionTitle}</h3>
                    <p className="text-lg text-slate-700 mb-2">{completionText}</p>
                    {pointsAwarded > 0 && (
                        <p className="text-xl font-bold text-green-600 mb-6">+{pointsAwarded} puntos</p>
                    )}
                    <div className="flex justify-center gap-4">
                        <button onClick={onGoHome} className="px-6 py-3 bg-sky-500 text-white font-bold rounded-lg shadow-lg hover:bg-sky-600 transition">Elegir otro Nivel</button>
                    </div>
                </div>
            </div>
        )}

        <div className="flex items-center justify-center gap-4 my-4">
            <ElfIcon className="w-24 h-24 flex-shrink-0" />
            <div className="relative bg-white border-2 border-slate-300 rounded-xl p-4 shadow-sm">
                <div className="flex items-start gap-2">
                  <p className="text-lg text-slate-700 font-semibold">{currentOrder?.description}</p>
                   <button onClick={() => currentOrder && speakText(currentOrder.description)} className="p-1 rounded-full hover:bg-slate-100 transition" aria-label="Leer pedido en voz alta">
                       <AudioIcon className="w-5 h-5 text-slate-600" />
                   </button>
                </div>
                <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-l-2 border-b-2 border-slate-300 transform rotate-45"></div>
            </div>
        </div>
        
        <div 
            ref={basketRef}
            data-droptarget="true"
            onDrop={handleDragDrop}
            onDragOver={(e) => { e.preventDefault(); setIsBasketOver(true); }}
            onDragLeave={() => setIsBasketOver(false)}
            className={`flex-grow relative min-h-[200px] border-4 border-dashed rounded-2xl p-4 transition-colors duration-300 ${isBasketOver ? 'border-amber-400 bg-amber-100' : 'border-stone-400 bg-stone-100'}`}
        >
            <h3 className="text-center font-bold text-stone-700 mb-2">Cesta del Duende ({blocksInBasket.length} / {currentOrder?.count})</h3>
            <div className="flex flex-wrap items-center justify-center gap-2">
                {blocksInBasket.map(block => (
                    <div key={block.id} onClick={() => moveFromBasketToPile(block)} className="cursor-pointer">
                        <DienesBlock block={block} />
                    </div>
                ))}
            </div>
            {feedback && (
                <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg text-white font-bold shadow-lg ${feedback.type === 'correct' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {feedback.message}
                </div>
            )}
        </div>
        
        <div className="flex items-center justify-center my-4">
            <button 
                onClick={handleCheckInventory}
                disabled={feedback?.type === 'correct'}
                className="px-8 py-4 bg-lime-500 text-white font-bold rounded-xl shadow-lg hover:bg-lime-600 transition-transform transform hover:scale-105 disabled:bg-slate-300 disabled:cursor-not-allowed">
                Revisar Cesta
            </button>
        </div>

        {/* Blocks Pile */}
        <div className="h-40 p-4 bg-rose-50 rounded-2xl shadow-inner flex flex-wrap items-start justify-center gap-2 overflow-y-auto">
            {blocksInPile.map(block => (
                <DienesBlock key={block.id} block={block} />
            ))}
        </div>
    </div>
  );
};

export default InventoryGame;