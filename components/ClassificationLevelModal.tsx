

import React, { useState } from 'react';
import { GAME_LEVELS, SHAPES, COLORS, SIZES, THICKNESSES, TRANSLATIONS } from '../constants';
import { speakText } from '../utils/tts';
import { AudioIcon } from './icons/AudioIcon';
import { CloseIcon } from './icons/CloseIcon';
import { ClassificationRule, UserProfile, DienesBlockType } from '../types';
import { HelpIcon } from './icons/HelpIcon';

interface ClassificationLevelModalProps {
  onSelectLevel: (levelIndex: number) => void;
  onStartExpertLevel: (rule: ClassificationRule) => void;
  onClose: () => void;
  completedLevels: Record<string, boolean>;
  user: UserProfile | null;
}

const levelColors = [
  // Rose, Amber, Green, Indigo...
  { cardBg: 'bg-rose-50', cardBorder: 'border-rose-200', titleText: 'text-rose-700', iconText: 'text-rose-600', iconHover: 'hover:bg-rose-200', buttonBg: 'bg-rose-500', buttonHover: 'hover:bg-rose-600' },
  { cardBg: 'bg-amber-50', cardBorder: 'border-amber-200', titleText: 'text-amber-700', iconText: 'text-amber-600', iconHover: 'hover:bg-amber-200', buttonBg: 'bg-amber-500', buttonHover: 'hover:bg-amber-600' },
  { cardBg: 'bg-green-50', cardBorder: 'border-green-200', titleText: 'text-green-700', iconText: 'text-green-600', iconHover: 'hover:bg-green-200', buttonBg: 'bg-green-500', buttonHover: 'hover:bg-green-600' },
  { cardBg: 'bg-indigo-50', cardBorder: 'border-indigo-200', titleText: 'text-indigo-700', iconText: 'text-indigo-600', iconHover: 'hover:bg-indigo-200', buttonBg: 'bg-indigo-500', buttonHover: 'hover:bg-indigo-600' },
  // Expert Level Color: Purple
  { cardBg: 'bg-purple-50', cardBorder: 'border-purple-200', titleText: 'text-purple-700', iconText: 'text-purple-600', iconHover: 'hover:bg-purple-200', buttonBg: 'bg-purple-500', buttonHover: 'hover:bg-purple-600' },
];

const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ExpertLevelCreator: React.FC<{onStart: (rule: ClassificationRule) => void}> = ({ onStart }) => {
    const [rules, setRules] = useState<ClassificationRule>({});
    const colors = levelColors[4]; // Purple for expert

    // FIX: Make `handleRuleChange` generic over the key `K`.
    // This allows TypeScript to understand the relationship between the `key` and the `value`'s type,
    // resolving an error where `newRules[key]` was inferred as `never` for assignments.
    const handleRuleChange = <K extends keyof ClassificationRule>(key: K, value: string) => {
        setRules(prevRules => {
            const newRules = { ...prevRules };
            if (value) {
                // Asserting the type here is safer than using 'any'
                newRules[key] = value as DienesBlockType[typeof key];
            } else {
                delete newRules[key];
            }
            return newRules;
        });
    };

    return (
        <div className={`${colors.cardBg} border ${colors.cardBorder} rounded-xl p-5 flex flex-col justify-between shadow-sm md:col-span-2`}>
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <h3 className={`text-xl font-bold ${colors.titleText}`}>{GAME_LEVELS[4].name}</h3>
                    <button onClick={() => speakText(GAME_LEVELS[4].name)} className={`p-1 rounded-full ${colors.iconHover} transition`}><AudioIcon className={`w-5 h-5 ${colors.iconText}`} /></button>
                </div>
                <div className="flex items-start gap-2 mb-4">
                    <p className="text-slate-600 flex-grow">{GAME_LEVELS[4].description}</p>
                    <button onClick={() => speakText(GAME_LEVELS[4].description)} className={`p-1 rounded-full ${colors.iconHover} transition`}><AudioIcon className={`w-5 h-5 ${colors.iconText}`} /></button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Selectors */}
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-slate-700 mb-1">{TRANSLATIONS.color}</label>
                        <select onChange={(e) => handleRuleChange('color', e.target.value)} className="p-2 border rounded-md bg-white">
                            <option value="">Cualquiera</option>
                            {COLORS.map(c => <option key={c} value={c}>{TRANSLATIONS[c]}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-slate-700 mb-1">{TRANSLATIONS.shape}</label>
                        <select onChange={(e) => handleRuleChange('shape', e.target.value)} className="p-2 border rounded-md bg-white">
                            <option value="">Cualquiera</option>
                            {SHAPES.map(s => <option key={s} value={s}>{TRANSLATIONS[s]}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-slate-700 mb-1">{TRANSLATIONS.size}</label>
                        <select onChange={(e) => handleRuleChange('size', e.target.value)} className="p-2 border rounded-md bg-white">
                            <option value="">Cualquiera</option>
                            {SIZES.map(s => <option key={s} value={s}>{TRANSLATIONS[s]}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-slate-700 mb-1">{TRANSLATIONS.thickness}</label>
                        <select onChange={(e) => handleRuleChange('thickness', e.target.value)} className="p-2 border rounded-md bg-white">
                            <option value="">Cualquiera</option>
                            {THICKNESSES.map(t => <option key={t} value={t}>{TRANSLATIONS[t]}</option>)}
                        </select>
                    </div>
                </div>
            </div>
            <button
                onClick={() => onStart(rules)}
                disabled={Object.keys(rules).length === 0}
                className={`mt-4 w-full px-6 py-3 ${colors.buttonBg} text-white font-bold rounded-lg shadow-md ${colors.buttonHover} transition-transform transform hover:scale-105 disabled:bg-slate-300 disabled:cursor-not-allowed`}
            >
                Jugar con esta Regla
            </button>
        </div>
    );
};


const ClassificationLevelModal: React.FC<ClassificationLevelModalProps> = ({ onSelectLevel, onStartExpertLevel, onClose, completedLevels, user }) => {
  const [showHelp, setShowHelp] = useState(false);
  const modalTitle = "Elige un Nivel";
  const modalSubtitle = "Cada nivel tiene un nuevo desafío de clasificación.";

  return (
    <div className="fixed inset-0 bg-slate-800 bg-opacity-60 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-4xl relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-800 transition z-10" aria-label="Cerrar"><CloseIcon /></button>
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3">
            <h2 className="text-4xl font-bold text-sky-800">{modalTitle}</h2>
            <button onClick={() => setShowHelp(true)} className="p-2 text-sky-600 hover:bg-sky-100 rounded-full transition" aria-label="Mostrar ayuda">
              <HelpIcon className="w-7 h-7" />
            </button>
          </div>
          <p className="text-slate-600 mt-2">{modalSubtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {GAME_LEVELS.filter(l => !l.isExpert).map((level, index) => {
            const isCompleted = completedLevels[level.name];
            const isCompletedAndLoggedIn = !!(isCompleted && user);
            const originalColors = levelColors[index % levelColors.length];

            const colors = isCompletedAndLoggedIn
              ? {
                  cardBg: 'bg-slate-100',
                  cardBorder: 'border-slate-200',
                  titleText: 'text-slate-700',
                  iconText: 'text-slate-500',
                  iconHover: 'hover:bg-slate-200',
                }
              : originalColors;

            let buttonClasses;
            const buttonText = isCompleted ? 'Volver a Jugar' : 'Jugar Nivel';

            if (isCompletedAndLoggedIn) {
              buttonClasses = 'bg-slate-500 hover:bg-slate-600 text-white';
            } else if (isCompleted) {
              buttonClasses = 'bg-green-500 hover:bg-green-600 text-white';
            } else {
              buttonClasses = `${originalColors.buttonBg} ${originalColors.buttonHover} text-white`;
            }
            
            const checkIconColor = isCompletedAndLoggedIn ? 'text-slate-500' : 'text-green-500';
            
            return (
              <div key={index} className={`${colors.cardBg} border ${colors.cardBorder} rounded-xl p-5 flex flex-col justify-between shadow-sm`}>
                <div className='flex flex-col flex-grow'>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className={`text-xl font-bold ${colors.titleText}`}>
                        {level.name}
                        {isCompleted && <CheckCircleIcon className={`w-6 h-6 inline-block ml-2 ${checkIconColor}`} />}
                    </h3>
                    <button onClick={() => speakText(level.name)} className={`p-1 rounded-full ${colors.iconHover} transition`} aria-label={`Leer en voz alta: ${level.name}`}><AudioIcon className={`w-5 h-5 ${colors.iconText}`} /></button>
                  </div>
                  <div className="flex items-start gap-2">
                    <p className="text-slate-600 flex-grow">{level.description}</p>
                    <button onClick={() => speakText(level.description)} className={`p-1 rounded-full ${colors.iconHover} transition`} aria-label={`Leer en voz alta: ${level.description}`}><AudioIcon className={`w-5 h-5 ${colors.iconText}`} /></button>
                  </div>
                </div>
                <button onClick={() => onSelectLevel(index)} className={`mt-4 w-full px-6 py-3 ${buttonClasses} font-bold rounded-lg shadow-md transition-transform transform hover:scale-105`}>
                    {buttonText}
                </button>
              </div>
            );
          })}
          <ExpertLevelCreator onStart={onStartExpertLevel} />
        </div>
      </div>
      
      {showHelp && (
        <div className="absolute inset-0 bg-slate-800 bg-opacity-70 flex items-center justify-center z-[60] p-4" onClick={() => setShowHelp(false)}>
          <div className="bg-sky-50 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-2xl relative animate-fade-in-up text-slate-700" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowHelp(false)} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-800 transition" aria-label="Cerrar ayuda"><CloseIcon /></button>
            <h3 className="text-3xl font-bold text-sky-800 text-center mb-4">¡Guía del Bosque Mágico!</h3>
            <p className="text-center mb-6">¡Hola, explorador! Aquí tienes todo lo que necesitas saber sobre las figuras mágicas y cómo ordenarlas.</p>
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <div>
                <h4 className="font-bold text-lg text-rose-600">¿Qué son las Figuras Mágicas?</h4>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>Estas figuras se llaman <strong>Bloques Lógicos</strong>. Cada una es única y especial.</li>
                  <li>En total, hay <strong>48 figuras diferentes</strong> en todo el juego. ¡Ni una más, ni una menos!</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-lg text-amber-600">Las 4 Diferencias Mágicas</h4>
                <p>Cada figura tiene cuatro características que la hacen única:</p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li><strong>Forma</strong>: Pueden ser Círculos, Cuadrados, Triángulos o Rectángulos.</li>
                  <li><strong>Color</strong>: Vienen en Rojo, Azul o Amarillo.</li>
                  <li><strong>Tamaño</strong>: Hay figuras Grandes y Pequeñas.</li>
                  <li><strong>Grosor</strong>: Algunas son <strong>Gruesas</strong> (se ven con relieve, como en 3D) y otras son <strong>Delgadas</strong> (se ven planas).</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-lg text-green-600">¿Cómo se Juega a Clasificar?</h4>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>Tu misión es arrastrar cada figura a la caja correcta.</li>
                  <li>Cada caja tiene una regla secreta. Por ejemplo, "Solo figuras rojas" o "Solo círculos pequeños".</li>
                  <li>¡Lee la etiqueta de la caja para descubrir la regla!</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-lg text-indigo-600">Los Niveles del Desafío</h4>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li><strong>Niveles 1 a 4</strong>: Son desafíos listos para jugar. ¡Empiezan fácil y se vuelven más difíciles!</li>
                  <li><strong>Nivel Experto</strong>: ¡Aquí tú creas la regla! Elige una, dos o hasta las cuatro características para crear tu propio desafío. Es la prueba definitiva para un maestro clasificador.</li>
                </ul>
              </div>
            </div>
            
            <button onClick={() => setShowHelp(false)} className="mt-6 w-full px-6 py-3 bg-sky-500 text-white font-bold rounded-lg shadow-md hover:bg-sky-600 transition">¡Entendido!</button>
          </div>
        </div>
      )}

      <style>{`@keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }`}</style>
    </div>
  );
};

export default ClassificationLevelModal;