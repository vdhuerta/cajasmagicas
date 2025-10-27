
import React, { useState, useEffect } from 'react';
import { TreasureObject, TreasureClassificationRule, TreasureMagicBoxDefinition, ObjectType, Color, Size, Pattern, Holes, ActivityLogType } from '../types';
import { ALL_TREASURE_OBJECTS, TRANSLATIONS } from '../constants';
import TreasureObjectDisplay from './TreasureObjectDisplay';
import MagicBox from './MagicBox';
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

const checkTreasureRule = (treasure: TreasureObject, rule: TreasureClassificationRule): boolean => {
    return Object.entries(rule).every(([key, value]) => {
        return treasure[key as keyof Omit<TreasureObject, 'id'>] === value;
    });
};

const availableCriteria: (keyof TreasureObject)[] = ['objectType', 'color', 'size', 'pattern', 'holes'];

interface TreasureSortGameProps {
  onGoHome: () => void;
  onUnlockAchievement: (id: string) => void;
  logActivity: (message: string, type: ActivityLogType) => void;
  addScore: (points: number, message: string) => void;
  onLevelComplete: (levelName: string) => void;
  completedLevels: Record<string, boolean>;
  logPerformance: (data: { game_name: string; level_name: string; incorrect_attempts: number; time_taken_ms: number; total_items: number }) => void;
}

const TreasureSortGame: React.FC<TreasureSortGameProps> = ({ onGoHome, onUnlockAchievement, logActivity, addScore, onLevelComplete, completedLevels, logPerformance }) => {
  const [activeCriterion, setActiveCriterion] = useState<keyof TreasureObject | null>(null);
  const [magicBoxes, setMagicBoxes] = useState<TreasureMagicBoxDefinition[]>([]);
  const [treasuresInPile, setTreasuresInPile] = useState<TreasureObject[]>([]);
  const [treasuresInBoxes, setTreasuresInBoxes] = useState<Record<string, TreasureObject[]>>({});
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [incorrectAttempts, setIncorrectAttempts] = useState(0);

  const validCriteria = availableCriteria.filter(crit =>
    ALL_TREASURE_OBJECTS.some(obj => obj[crit] !== undefined && obj[crit] !== null)
  );

  useEffect(() => {
    if (!activeCriterion) return;
    if (treasuresInPile.length === 0 && Object.keys(treasuresInBoxes).length > 0) {
      const isCorrect = Object.entries(treasuresInBoxes).every(([boxId, treasures]) => {
        const boxDef = magicBoxes.find(b => b.id === boxId);
        if (!boxDef) return false;
        // FIX: Cast `treasures` to `TreasureObject[]` to resolve the type error where `every` was not found on type `unknown`.
        return (treasures as TreasureObject[]).every(treasure => checkTreasureRule(treasure, boxDef.rule));
      });

      if (isCorrect && !isGameComplete) {
        const timeTakenMs = Date.now() - startTime;
        logPerformance({
            game_name: 'TreasureSort',
            level_name: `Clasificación por ${TRANSLATIONS[activeCriterion]}`,
            incorrect_attempts: incorrectAttempts,
            time_taken_ms: timeTakenMs,
            total_items: ALL_TREASURE_OBJECTS.length,
        });

        setIsGameComplete(true);
        logActivity(`Clasificación completada por ${activeCriterion}`, 'win');
        
        if (!completedLevels['Treasure Sort Game']) {
            addScore(150, `Completaste un desafío en El Baúl de los Tesoros`);
            onUnlockAchievement('TREASURE_SORT_WIN');
        }
        onLevelComplete('Treasure Sort Game');
      }
    }
  }, [treasuresInPile, treasuresInBoxes, isGameComplete, activeCriterion, magicBoxes, onUnlockAchievement, logActivity, addScore, completedLevels, onLevelComplete, startTime, incorrectAttempts, logPerformance]);

  const handleCriterionSelect = (criterion: keyof TreasureObject) => {
    logActivity(`Nuevo criterio de clasificación seleccionado: ${TRANSLATIONS[criterion]}`, 'game');
    setActiveCriterion(criterion);
    setIsGameComplete(false);
    setIncorrectAttempts(0);
    setStartTime(Date.now());

    const values = [...new Set(ALL_TREASURE_OBJECTS.map(t => t[criterion]).filter(v => v !== undefined && v !== null))] as (string[] | undefined[]);
    const newBoxes: TreasureMagicBoxDefinition[] = values.map(value => ({
      id: `box-${criterion}-${value}`,
      label: `${TRANSLATIONS[value!]}`,
      rule: { [criterion]: value } as TreasureClassificationRule
    }));

    setMagicBoxes(newBoxes);
    setTreasuresInPile(shuffleArray(ALL_TREASURE_OBJECTS));
    
    const initialBoxes: Record<string, TreasureObject[]> = {};
    newBoxes.forEach(box => { initialBoxes[box.id] = []; });
    setTreasuresInBoxes(initialBoxes);
  };

  const handleDrop = (boxId: string, treasure: TreasureObject) => {
    const boxDef = magicBoxes.find(b => b.id === boxId);
    if (!boxDef) return;

    if (checkTreasureRule(treasure, boxDef.rule)) {
      setTreasuresInPile(prev => prev.filter(t => t.id !== treasure.id));
      setTreasuresInBoxes(prev => ({
        ...prev,
        [boxId]: [...prev[boxId], treasure]
      }));
    } else {
      setIncorrectAttempts(prev => prev + 1);
      const el = document.getElementById(treasure.id);
      if (el) {
        el.classList.add('animate-shake');
        setTimeout(() => el.classList.remove('animate-shake'), 500);
      }
    }
  };

  const gameTitle = "El Baúl de los Tesoros";
  const completionTitle = "¡Excelente Trabajo!";
  const completionText = `¡Has ordenado todos los tesoros por ${TRANSLATIONS[activeCriterion!]}!`;
  
  const cols = magicBoxes.length > 3 ? 'md:grid-cols-3 lg:grid-cols-4' : `md:grid-cols-${magicBoxes.length}`;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-center gap-3 mb-4">
        <h2 className="text-3xl font-bold text-center text-stone-700">{gameTitle}</h2>
      </div>

      {isGameComplete && (
         <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
            <div className="bg-white p-10 rounded-2xl shadow-2xl text-center">
                <h3 className="text-4xl font-bold text-amber-500 mb-4">{completionTitle}</h3>
                <div className="flex items-center justify-center gap-2 mb-6">
                    <p className="text-lg text-slate-700">{completionText}</p>
                    <button onClick={() => speakText(completionText)} className="p-2 rounded-full hover:bg-slate-100 transition">
                        <AudioIcon className="w-5 h-5 text-slate-600" />
                    </button>
                </div>
                <div className="flex justify-center gap-4">
                    <button onClick={() => { setActiveCriterion(null); setIsGameComplete(false); }} className="px-6 py-3 bg-green-500 text-white font-bold rounded-lg shadow-lg hover:bg-green-600 transition">Elegir otra Regla</button>
                    <button onClick={onGoHome} className="px-6 py-3 bg-gray-400 text-white font-bold rounded-lg shadow-lg hover:bg-gray-500 transition">Otros Juegos</button>
                </div>
            </div>
        </div>
      )}

      {/* Criterion Selector */}
      <div className={`p-4 bg-stone-100 rounded-2xl shadow-inner mb-4 transition-all duration-500 ${activeCriterion ? 'max-h-24 overflow-hidden' : 'max-h-96'}`}>
          <h3 className="text-xl font-bold text-center text-stone-600 mb-3">{activeCriterion ? `Clasificando por: ${TRANSLATIONS[activeCriterion]}` : 'Elige cómo quieres ordenar los tesoros'}</h3>
          <div className="flex flex-wrap items-center justify-center gap-3">
              {validCriteria.map(criterion => (
                  <button key={criterion} onClick={() => handleCriterionSelect(criterion)} className="px-5 py-2 bg-white text-stone-700 font-semibold rounded-lg shadow-md hover:bg-amber-100 hover:shadow-lg transition">
                      {TRANSLATIONS[criterion]}
                  </button>
              ))}
          </div>
      </div>
      
      {activeCriterion ? (
        <>
            <div className={`flex-grow grid grid-cols-2 ${cols} gap-4 p-4 bg-emerald-50 rounded-2xl shadow-inner`}>
                {magicBoxes.map(box => (
                    <MagicBox key={box.id} id={box.id} label={box.label} onDrop={(boxId, item) => handleDrop(boxId, item as TreasureObject)} blocks={treasuresInBoxes[box.id] || []}>
                    </MagicBox>
                ))}
            </div>

            <div className="h-48 md:h-56 mt-4 p-4 bg-rose-50 rounded-2xl shadow-inner flex flex-wrap items-start justify-center gap-2 overflow-y-auto">
                {treasuresInPile.map(treasure => (
                    <TreasureObjectDisplay key={treasure.id} treasure={treasure} />
                ))}
            </div>
        </>
      ) : (
        <div className="flex-grow flex items-center justify-center text-center text-slate-500 bg-emerald-50 rounded-2xl shadow-inner">
            <p className="text-2xl">Selecciona un criterio arriba para empezar a jugar.</p>
        </div>
      )}

      <style>{`
        @keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); } 20%, 40%, 60%, 80% { transform: translateX(5px); } }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  );
};

export default TreasureSortGame;