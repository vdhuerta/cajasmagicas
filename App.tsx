import React, { useState, useEffect } from 'react';
import ClassificationGame from './components/ClassificationGame';
import MatchingGame from './components/MatchingGame';
import { speakText } from './utils/tts';
import ClassificationLevelModal from './components/ClassificationLevelModal';
import { GameLevel, ClassificationRule, Notification, Achievement, ActivityLogEntry, ActivityLogType } from './types';
import { GAME_LEVELS, TRANSLATIONS, ALL_ACHIEVEMENTS } from './constants';
import MatchingGameIntro from './components/MatchingGameIntro';
import OddOneOutGame from './components/OddOneOutGame';
import { HamburgerMenuIcon } from './components/icons/HamburgerMenuIcon';
import Menu from './components/Menu';
import Achievements from './components/Achievements';
import NotificationContainer from './components/NotificationContainer';
import OddOneOutGameIntro from './components/OddOneOutGameIntro';
import { BookOpenIcon } from './components/icons/BookOpenIcon';
import TeachersGuide from './components/TeachersGuide';
import NotificationsLog from './components/NotificationsLog';
import { BellIcon } from './components/icons/BellIcon';
import { HomeIcon } from './components/icons/HomeIcon';

type Game = 'home' | 'classification' | 'matching' | 'odd-one-out' | 'achievements';

const App: React.FC = () => {
  const [activeGame, setActiveGame] = useState<Game>('home');
  const [showClassificationModal, setShowClassificationModal] = useState(false);
  const [showMatchingIntro, setShowMatchingIntro] = useState(false);
  const [showOddOneOutIntro, setShowOddOneOutIntro] = useState(false);
  const [showTeachersGuide, setShowTeachersGuide] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<GameLevel | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLogOpen, setIsLogOpen] = useState(false);

  const [unlockedAchievements, setUnlockedAchievements] = useState<Record<string, boolean>>({});
  const [completedLevels, setCompletedLevels] = useState<Record<string, boolean>>({});
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  
  const unseenLogsCount = activityLog.filter(log => !log.seen).length;

  useEffect(() => {
    const savedAchievements = localStorage.getItem('unlockedAchievements');
    if (savedAchievements) {
      setUnlockedAchievements(JSON.parse(savedAchievements));
    }
    const savedLog = localStorage.getItem('activityLog');
    if (savedLog) {
      setActivityLog(JSON.parse(savedLog));
    } else {
      logActivity('¡Bienvenido al Bosque Mágico!', 'system');
    }
    const savedCompletedLevels = localStorage.getItem('completedLevels');
    if (savedCompletedLevels) {
        setCompletedLevels(JSON.parse(savedCompletedLevels));
    }
  }, []);
  
  useEffect(() => {
      localStorage.setItem('activityLog', JSON.stringify(activityLog));
  }, [activityLog]);

  useEffect(() => {
      localStorage.setItem('completedLevels', JSON.stringify(completedLevels));
  }, [completedLevels]);

  const logActivity = (message: string, type: ActivityLogType) => {
      const newEntry: ActivityLogEntry = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          message,
          type,
          seen: isLogOpen, // if log is open, mark as seen immediately
      };
      setActivityLog(prev => [newEntry, ...prev]);
  };

  const unlockAchievement = (achievementId: string) => {
    if (unlockedAchievements[achievementId]) return;

    const achievement = ALL_ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return;

    const newUnlocked = { ...unlockedAchievements, [achievementId]: true };
    setUnlockedAchievements(newUnlocked);
    localStorage.setItem('unlockedAchievements', JSON.stringify(newUnlocked));

    const newNotification: Notification = {
      id: Date.now(),
      message: `¡Logro desbloqueado: ${achievement.name}!`,
      achievementId: achievement.id,
    };
    setNotifications(prev => [...prev, newNotification]);
    logActivity(`Logro desbloqueado: ${achievement.name}`, 'achievement');
  };
  
  const handleLevelComplete = (levelName: string) => {
      setCompletedLevels(prev => ({ ...prev, [levelName]: true }));
  };

  const handlePlayClassification = () => {
    setShowClassificationModal(true);
  };

  const handlePlayMatching = () => {
    setShowMatchingIntro(true);
  };
  
  const handleStartMatching = () => {
    setShowMatchingIntro(false);
    setActiveGame('matching');
    logActivity('Iniciado el Juego de Parejas', 'game');
  };

  const handlePlayOddOneOut = () => {
    setShowOddOneOutIntro(true);
  };

  const handleStartOddOneOut = () => {
    setShowOddOneOutIntro(false);
    setActiveGame('odd-one-out');
    logActivity('Iniciado El Duende Despistado', 'game');
  };

  const handleSelectLevel = (levelIndex: number) => {
    const level = GAME_LEVELS[levelIndex];
    setCurrentLevel(level);
    setActiveGame('classification');
    setShowClassificationModal(false);
    logActivity(`Iniciado Juego de Clasificación: ${level.name}`, 'game');
  };

  const handleStartExpertLevel = (rule: ClassificationRule) => {
    const ruleKeys = Object.keys(rule);
    if (ruleKeys.length === 0) return;

    const label = Object.entries(rule)
        .map(([key, value]) => `${TRANSLATIONS[key] || key}: ${TRANSLATIONS[value] || value}`)
        .join(', ');

    const expertLevel: GameLevel = {
        title: "Desafío Experto Personalizado",
        name: "Nivel Experto",
        description: `Clasificar por: ${label}`,
        boxes: [
            { id: 'box-custom-rule', label: label, rule: rule },
            { id: 'box-others', label: 'Todo lo Demás', rule: {} }
        ],
        isExpert: true,
    };
    setCurrentLevel(expertLevel);
    setActiveGame('classification');
    setShowClassificationModal(false);
    logActivity(`Iniciado Nivel Experto: ${label}`, 'game');
  };

  const navigate = (game: Game) => {
    setActiveGame(game);
    setIsMenuOpen(false);
    if (game === 'home') {
      setCurrentLevel(null);
      logActivity('Navegando a la página de Inicio', 'system');
    } else if (game === 'achievements') {
      logActivity('Viendo el Salón de Logros', 'system');
    }
  };

  const handleOpenLog = () => {
    setIsLogOpen(true);
    // Mark all as seen when opening
    setActivityLog(prev => prev.map(log => ({ ...log, seen: true })));
  };

  const handleClearLog = () => {
    const welcomeMessage: ActivityLogEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      message: 'Registro limpiado. ¡Empezando de nuevo!',
      type: 'system',
      seen: true,
    };
    setActivityLog([welcomeMessage]);
  };

  const renderGame = () => {
    switch (activeGame) {
      case 'classification':
        return currentLevel && <ClassificationGame gameLevel={currentLevel} onGoHome={() => navigate('home')} onUnlockAchievement={unlockAchievement} logActivity={logActivity} onLevelComplete={handleLevelComplete} />;
      case 'matching':
        return <MatchingGame onGoHome={() => navigate('home')} onUnlockAchievement={unlockAchievement} logActivity={logActivity} />;
      case 'odd-one-out':
        return <OddOneOutGame onGoHome={() => navigate('home')} onUnlockAchievement={unlockAchievement} logActivity={logActivity} />;
      case 'achievements':
        return <Achievements unlockedAchievements={unlockedAchievements} />;
      case 'home':
      default:
        const welcomeTitle = "¡Bienvenido al Bosque Mágico!";
        const welcomeText = "¡Los duendes clasificadores necesitan tu ayuda! Un gran viento ha mezclado todas sus figuras mágicas. ¿Puedes ayudarles a ordenar todo en las Cajas Mágicas?";
        
        return (
          <div className="flex flex-col items-center justify-center h-full text-center">
             <h1 className="text-5xl font-bold text-sky-700 mb-4">{welcomeTitle}</h1>
             <p className="text-xl text-slate-600 max-w-2xl md:max-w-4xl mb-12">{welcomeText}</p>

            <div className="flex flex-col md:flex-row gap-6">
              <button
                onClick={handlePlayClassification}
                className="px-8 py-4 bg-rose-400 text-white font-bold rounded-xl shadow-lg hover:bg-rose-500 transition-transform transform hover:scale-105"
              >
                Juego de Clasificación
              </button>
              <button
                onClick={handlePlayMatching}
                className="px-8 py-4 bg-amber-400 text-white font-bold rounded-xl shadow-lg hover:bg-amber-500 transition-transform transform hover:scale-105"
              >
                Juego de Parejas
              </button>
              <button
                onClick={handlePlayOddOneOut}
                className="px-8 py-4 bg-teal-400 text-white font-bold rounded-xl shadow-lg hover:bg-teal-500 transition-transform transform hover:scale-105"
              >
                El Duende Despistado
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-sky-50 text-slate-800 p-4 md:p-8">
      <NotificationContainer notifications={notifications} setNotifications={setNotifications} />
      <header className="w-full flex justify-between items-center pb-4">
        <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('home')}
              className="p-3 bg-white text-slate-700 rounded-full shadow-sm hover:bg-sky-100 transition"
              aria-label="Ir a la página de inicio"
            >
              <HomeIcon />
            </button>
            <h1 className="text-3xl font-bold text-sky-800">Cajas Mágicas</h1>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => setShowTeachersGuide(true)}
              className="flex items-center gap-2 px-3 py-2 bg-white text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-sky-100 transition"
              aria-label="Guía para Profesores"
            >
              <BookOpenIcon />
              <span className="hidden sm:inline">Profesores</span>
            </button>
             <button
              onClick={handleOpenLog}
              className="relative p-3 bg-white text-slate-700 rounded-full shadow-sm hover:bg-sky-100 transition"
              aria-label="Registro de actividad"
            >
              <BellIcon />
              {unseenLogsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                  {unseenLogsCount}
                </span>
              )}
            </button>
            <div className="relative">
              <button
                  onClick={() => setIsMenuOpen(prev => !prev)}
                  className="p-3 bg-white rounded-full shadow-md hover:bg-sky-100 transition"
                  aria-label="Abrir menú"
              >
                  <HamburgerMenuIcon />
              </button>
              {isMenuOpen && <Menu onNavigate={navigate} />}
            </div>
        </div>
      </header>
      <div className="w-full border-b-2 border-slate-200 mb-6"></div>
      <main className="w-full h-[calc(100vh-140px)]">
        {renderGame()}
      </main>
      {showClassificationModal && (
        <ClassificationLevelModal 
          onSelectLevel={handleSelectLevel}
          onStartExpertLevel={handleStartExpertLevel}
          onClose={() => setShowClassificationModal(false)}
          completedLevels={completedLevels}
        />
      )}
      {showMatchingIntro && (
        <MatchingGameIntro 
          onStart={handleStartMatching}
          onClose={() => setShowMatchingIntro(false)}
        />
      )}
      {showOddOneOutIntro && (
        <OddOneOutGameIntro
          onStart={handleStartOddOneOut}
          onClose={() => setShowOddOneOutIntro(false)}
        />
      )}
      {showTeachersGuide && (
        <TeachersGuide onClose={() => setShowTeachersGuide(false)} />
      )}
      <NotificationsLog
        isOpen={isLogOpen}
        onClose={() => setIsLogOpen(false)}
        logs={activityLog}
        onClear={handleClearLog}
      />
    </div>
  );
};

export default App;