import React, { useState, useEffect } from 'react';
import { DienesBlockType, ClassificationRule, Color, Shape, Size, Thickness, ActivityLogType } from '../types';
import { ALL_DIENES_BLOCKS, TRANSLATIONS } from '../constants';
import DienesBlock from './DienesBlock';
import { ElfIcon } from './icons/ElfIcon';
import { speakText } from '../utils/tts';
import { AudioIcon } from './icons/AudioIcon';

const TOTAL_ROUNDS = 5;

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

const possibleRules: ClassificationRule[] = [
  { color: Color.Red }, { color: Color.Blue }, { color: Color.Yellow },
  { shape: Shape.Circle }, { shape: Shape.Square }, { shape: Shape.Triangle }, { shape: Shape.Rectangle },
  { size: Size.Small }, { size: Size.Large },
  { thickness: Thickness.Thick }, { thickness: Thickness.Thin },
];

const generateRuleDescription = (rule: ClassificationRule): string => {
    const key = Object.keys(rule)[0] as keyof ClassificationRule;
    const value = rule[key]!;
    return `¡Aquí solo guardo figuras de ${TRANSLATIONS[key]} **${TRANSLATIONS[value]}**!`;
}

interface OddOneOutGameProps {
  onGoHome: () => void;
  onUnlockAchievement: (id: string) => void;
  logActivity: (message: string, type: ActivityLogType) => void;
}

const OddOneOutGame: React.FC<OddOneOutGameProps> = ({ onGoHome, onUnlockAchievement, logActivity }) => {
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [blocks, setBlocks] = useState<DienesBlockType[]>([]);
  const [imposterId, setImposterId] = useState<string | null>(null);
  const [ruleDescription, setRuleDescription] = useState('');
  const [isGameOver, setIsGameOver] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [clickedBlockId, setClickedBlockId] = useState<string | null>(null);

  useEffect(() => {
    startNewRound();
  }, [round]);

  const startNewRound = () => {
    setFeedback(null);
    setClickedBlockId(null);

    const rule = possibleRules[Math.floor(Math.random() * possibleRules.length)];
    const matchingBlocks = ALL_DIENES_BLOCKS.filter(b => checkBlockRule(b, rule));
    const imposterBlocks = ALL_DIENES_BLOCKS.filter(b => !checkBlockRule(b, rule));
    
    const selectedCorrect = shuffleArray(matchingBlocks).slice(0, 4);
    const selectedImposter = shuffleArray(imposterBlocks)[0];

    setBlocks(shuffleArray([...selectedCorrect, selectedImposter]));
    setImposterId(selectedImposter.id);
    setRuleDescription(generateRuleDescription(rule));
  };
  
  const handleEndGame = (finalScore: number) => {
    setIsGameOver(true);
    logActivity(`El Duende Despistado completado con una puntuación de ${finalScore}/${TOTAL_ROUNDS}`, 'win');
    onUnlockAchievement('ODD_ONE_OUT_WIN');
    if (finalScore === TOTAL_ROUNDS) {
      onUnlockAchievement('ODD_ONE_OUT_PERFECT');
    }
  };


  const resetGame = () => {
    logActivity('Reiniciando El Duende Despistado', 'game');
    setRound(1);
    setScore(0);
    setIsGameOver(false);
    startNewRound();
  };

  const handleBlockClick = (blockId: string) => {
    if (feedback === 'correct') return; // Prevent clicking after correct answer

    setClickedBlockId(blockId);

    if (blockId === imposterId) {
      logActivity(`Ronda ${round}: ¡Impostor encontrado correctamente!`, 'system');
      setFeedback('correct');
      const newScore = score + 1;
      setScore(newScore);
      setTimeout(() => {
        if (round < TOTAL_ROUNDS) {
          setRound(r => r + 1);
        } else {
          handleEndGame(newScore);
        }
      }, 1500);
    } else {
      logActivity(`Ronda ${round}: Intento incorrecto.`, 'system');
      setFeedback('incorrect');
      const blockElement = document.getElementById(blockId);
      if (blockElement) {
          blockElement.classList.add('animate-shake');
          setTimeout(() => {
            blockElement.classList.remove('animate-shake');
            setFeedback(null);
            setClickedBlockId(null);
          }, 600);
      }
    }
  };

  const gameTitle = "El Duende Despistado";
  const gameInstructions = "Un duende ha mezclado las figuras. ¡Pincha sobre la figura que NO pertenece al grupo!";
  const completionTitle = "¡Misión Cumplida!";
  const completionText = `¡Has ayudado al duende y acertaste ${score} de ${TOTAL_ROUNDS} veces!`;

  return (
    <div className="flex flex-col items-center justify-start h-full pt-4">
      <div className="flex items-center justify-center gap-3 mb-2">
        <h2 className="text-3xl font-bold text-center text-teal-600">{gameTitle}</h2>
        <button onClick={() => speakText(gameTitle)} className="p-2 rounded-full hover:bg-teal-100 transition" aria-label={`Leer en voz alta: ${gameTitle}`}>
          <AudioIcon className="text-teal-700"/>
        </button>
      </div>
      <p className="text-slate-600 mb-6">{gameInstructions}</p>

      {isGameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
              <div className="bg-white p-10 rounded-2xl shadow-2xl text-center">
                  <h3 className="text-4xl font-bold text-green-500 mb-4">{completionTitle}</h3>
                  <p className="text-lg text-slate-700 mb-6">{completionText}</p>
                  <div className="flex justify-center gap-4">
                      <button onClick={resetGame} className="px-6 py-3 bg-sky-500 text-white font-bold rounded-lg shadow-lg hover:bg-sky-600 transition">Jugar de Nuevo</button>
                      <button onClick={onGoHome} className="px-6 py-3 bg-gray-400 text-white font-bold rounded-lg shadow-lg hover:bg-gray-500 transition">Volver al Inicio</button>
                  </div>
              </div>
          </div>
      )}

      {/* Game Area */}
      <div className="w-full max-w-4xl">
        <div className="flex items-center justify-center gap-4 mb-8">
            <ElfIcon className="w-24 h-24" />
            <div className="relative bg-white border-2 border-slate-300 rounded-xl p-4 shadow-sm">
                <p className="text-lg text-slate-700" dangerouslySetInnerHTML={{ __html: ruleDescription }} />
                <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-l-2 border-b-2 border-slate-300 transform rotate-45"></div>
            </div>
        </div>

        <div className="flex items-center justify-center gap-4 md:gap-8 p-6 bg-teal-50 rounded-2xl shadow-inner h-40 md:h-48">
          {blocks.map(block => (
            <div key={block.id} onClick={() => handleBlockClick(block.id)} className={`transition-all duration-300 md:scale-110 lg:scale-125
              ${feedback === 'correct' && block.id === imposterId ? 'animate-sparkle' : ''}
              ${feedback === 'correct' && block.id !== imposterId ? 'opacity-30' : ''}
            `}>
              <DienesBlock block={block} />
            </div>
          ))}
        </div>
        
        <div className="flex justify-between items-center mt-4 px-2">
            <p className="text-lg font-bold text-slate-600">Puntuación: {score}</p>
            <p className="text-lg font-bold text-slate-600">Ronda: {round} / {TOTAL_ROUNDS}</p>
        </div>
      </div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
          20%, 40%, 60%, 80% { transform: translateX(8px); }
        }
        .animate-shake { animation: shake 0.6s ease-in-out; }
        @keyframes sparkle {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0px gold; }
          50% { transform: scale(1.2); box-shadow: 0 0 20px 10px gold; }
        }
        .animate-sparkle > div { border-radius: 999px; animation: sparkle 1s ease-in-out; }
      `}</style>
    </div>
  );
};

export default OddOneOutGame;