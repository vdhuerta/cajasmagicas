import React, { useState, useEffect } from 'react';
import { DienesBlockType, ActivityLogType } from '../types';
import { ALL_DIENES_BLOCKS } from '../constants';
import GameCard from './GameCard';
import { speakText } from '../utils/tts';
import { AudioIcon } from './icons/AudioIcon';

const PAIRS_COUNT = 8;

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

interface MatchingGameProps {
    onGoHome: () => void;
    onUnlockAchievement: (id: string) => void;
    logActivity: (message: string, type: ActivityLogType) => void;
    addScore: (points: number, message: string) => void;
    onLevelComplete: (levelName: string) => void;
    completedLevels: Record<string, boolean>;
}

const MatchingGame: React.FC<MatchingGameProps> = ({ onGoHome, onUnlockAchievement, logActivity, addScore, onLevelComplete, completedLevels }) => {
  const [cards, setCards] = useState<DienesBlockType[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [pointsAwarded, setPointsAwarded] = useState(0);

  useEffect(() => {
    resetGame();
  }, []);

  const resetGame = () => {
    logActivity('Reiniciando Juego de Parejas', 'game');
    const selectedBlocks = shuffleArray(ALL_DIENES_BLOCKS).slice(0, PAIRS_COUNT);
    const gameCards = shuffleArray([...selectedBlocks, ...selectedBlocks]);
    setCards(gameCards);
    setFlippedIndices([]);
    setMatchedPairs([]);
    setIsChecking(false);
    setIsGameComplete(false);
    setPointsAwarded(0);
    setStartTime(Date.now());
  };
  
  useEffect(() => {
      if (matchedPairs.length === PAIRS_COUNT && !isGameComplete) {
          const endTime = Date.now();
          const elapsedSeconds = startTime ? (endTime - startTime) / 1000 : 0;
          
          if (!completedLevels['Matching Game']) {
            const points = Math.max(100, 1000 - Math.floor(elapsedSeconds * 10));
            setPointsAwarded(points);
            addScore(points, `Juego de Parejas completado en ${elapsedSeconds.toFixed(1)}s`);
            onUnlockAchievement('MATCHING_GAME_WIN');
          }

          setIsGameComplete(true);
          logActivity('Juego de Parejas completado con éxito', 'win');
          onLevelComplete('Matching Game');
      }
  }, [matchedPairs, onUnlockAchievement, isGameComplete, logActivity, addScore, startTime, onLevelComplete, completedLevels]);

  const handleCardClick = (index: number) => {
    if (isChecking || flippedIndices.includes(index) || matchedPairs.includes(cards[index].id)) {
      return;
    }

    const newFlippedIndices = [...flippedIndices, index];
    setFlippedIndices(newFlippedIndices);

    if (newFlippedIndices.length === 2) {
      setIsChecking(true);
      const [firstIndex, secondIndex] = newFlippedIndices;
      if (cards[firstIndex].id === cards[secondIndex].id) {
        setMatchedPairs(prev => [...prev, cards[firstIndex].id]);
        setFlippedIndices([]);
        setIsChecking(false);
      } else {
        setTimeout(() => {
          setFlippedIndices([]);
          setIsChecking(false);
        }, 1200);
      }
    }
  };

  const gameTitle = "¡Encuentra las parejas!";
  const completionTitle = "¡Las encontraste todas!";
  const completionText = "¡Buen trabajo recordando las figuras!";
  
  return (
    <div className="flex flex-col items-center justify-center h-full">
        <div className="flex items-center justify-center gap-3 mb-4">
          <h2 className="text-3xl font-bold text-center text-amber-600">{gameTitle}</h2>
          <button onClick={() => speakText(gameTitle)} className="p-2 rounded-full hover:bg-amber-100 transition" aria-label={`Leer en voz alta: ${gameTitle}`}>
            <AudioIcon className="text-amber-700"/>
          </button>
        </div>
      
       {isGameComplete && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
            <div className="bg-white p-10 rounded-2xl shadow-2xl text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <h3 className="text-4xl font-bold text-green-500">{completionTitle}</h3>
                  <button onClick={() => speakText(completionTitle)} className="p-2 rounded-full hover:bg-green-100 transition" aria-label={`Leer en voz alta: ${completionTitle}`}>
                    <AudioIcon className="w-7 h-7 text-green-600" />
                  </button>
                </div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <p className="text-lg text-slate-700">{completionText}</p>
                   <button onClick={() => speakText(completionText)} className="p-2 rounded-full hover:bg-slate-100 transition" aria-label={`Leer en voz alta: ${completionText}`}>
                     <AudioIcon className="w-5 h-5 text-slate-600" />
                   </button>
                </div>
                 {pointsAwarded > 0 && (
                    <p className="text-xl font-bold text-green-600 mb-6">+{pointsAwarded} puntos</p>
                )}
                <div className="flex justify-center gap-4">
                    <button 
                        onClick={resetGame}
                        className="px-6 py-3 bg-sky-500 text-white font-bold rounded-lg shadow-lg hover:bg-sky-600 transition"
                    >
                        Jugar de Nuevo
                    </button>
                    <button 
                        onClick={onGoHome}
                        className="px-6 py-3 bg-gray-400 text-white font-bold rounded-lg shadow-lg hover:bg-gray-500 transition"
                    >
                        Elegir otro Juego
                    </button>
                </div>
            </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4 p-4 bg-amber-50 rounded-2xl shadow-inner">
        {cards.map((cardBlock, index) => (
          <GameCard
            key={index}
            block={cardBlock}
            isFlipped={flippedIndices.includes(index) || matchedPairs.includes(cardBlock.id)}
            onClick={() => handleCardClick(index)}
          />
        ))}
      </div>
      <button onClick={resetGame} className="mt-6 px-6 py-2 bg-rose-400 text-white font-bold rounded-lg shadow-md hover:bg-rose-500 transition">
        Reiniciar Juego
      </button>
    </div>
  );
};

export default MatchingGame;