
import React, { useState, useEffect } from 'react';
import ClassificationGame from './components/ClassificationGame';
import MatchingGame from './components/MatchingGame';
import { speakText } from './utils/tts';
import ClassificationLevelModal from './components/ClassificationLevelModal';
import { GameLevel, ClassificationRule, Notification, Achievement, ActivityLogEntry, ActivityLogType, InventoryGameDifficulty, User, DienesBlockType } from './types';
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
import VennDiagramGame from './components/VennDiagramGame';
import VennDiagramGameIntro from './components/VennDiagramGameIntro';
import InventoryGameIntro from './components/InventoryGameIntro';
import InventoryLevelModal from './components/InventoryLevelModal';
import InventoryGame from './components/InventoryGame';
import RegistrationModal from './components/RegistrationModal';
import { UserIcon } from './components/icons/UserIcon';
import { LogoutIcon } from './components/icons/LogoutIcon';
import LogoutConfirmationModal from './components/LogoutConfirmationModal';
import ClearDataConfirmationModal from './components/ClearDataConfirmationModal';
import { MagnifyingGlassIcon } from './components/icons/MagnifyingGlassIcon';
import { ClassificationIcon } from './components/icons/ClassificationIcon';
import { InstallIcon } from './components/icons/InstallIcon';
import AddToHomeScreenModal from './components/AddToHomeScreenModal';
import { PairsIcon } from './components/icons/PairsIcon';
import { VennDiagramIcon } from './components/icons/VennDiagramIcon';
import { ClipboardListIcon } from './components/icons/ClipboardListIcon';

type Game = 'home' | 'classification-games' | 'classification' | 'matching' | 'odd-one-out' | 'achievements' | 'venn-diagram' | 'inventory';

const App: React.FC = () => {
  const [activeGame, setActiveGame] = useState<Game>('home');
  const [showClassificationModal, setShowClassificationModal] = useState(false);
  const [showMatchingIntro, setShowMatchingIntro] = useState(false);
  const [showOddOneOutIntro, setShowOddOneOutIntro] = useState(false);
  const [showVennDiagramIntro, setShowVennDiagramIntro] = useState(false);
  const [showInventoryIntro, setShowInventoryIntro] = useState(false);
  const [showInventoryLevelModal, setShowInventoryLevelModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showClearDataConfirm, setShowClearDataConfirm] = useState(false);
  const [showAddToHomeScreenModal, setShowAddToHomeScreenModal] = useState(false);


  const [showTeachersGuide, setShowTeachersGuide] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<GameLevel | null>(null);
  const [currentInventoryLevel, setCurrentInventoryLevel] = useState<InventoryGameDifficulty | null>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLogOpen, setIsLogOpen] = useState(false);
  
  const [user, setUser] = useState<User | null>(null);

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
    const savedUser = localStorage.getItem('magicBoxUser');
    if (savedUser) {
        setUser(JSON.parse(savedUser));
    }
  }, []);
  
  useEffect(() => {
      localStorage.setItem('activityLog', JSON.stringify(activityLog));
  }, [activityLog]);

  useEffect(() => {
      localStorage.setItem('completedLevels', JSON.stringify(completedLevels));
  }, [completedLevels]);
  
  useEffect(() => {
    let draggedElement: HTMLElement | null = null;
    let draggedBlockData: string | null = null;
    let lastDropTarget: HTMLElement | null = null;

    const getDraggable = (target: EventTarget | null): HTMLElement | null => {
        if (!(target instanceof HTMLElement)) return null;
        return target.closest('[draggable="true"]');
    };
    
    const getDropTarget = (x: number, y: number): HTMLElement | null => {
        const elementUnderTouch = document.elementFromPoint(x, y);
        if (!(elementUnderTouch instanceof HTMLElement)) return null;
        return elementUnderTouch.closest('[data-droptarget="true"]');
    }

    const touchStartHandler = (event: TouchEvent) => {
        const draggable = getDraggable(event.target);

        if (draggable) {
            // Prevent scrolling and default behavior
            event.preventDefault();

            draggedElement = draggable;
            draggedBlockData = draggable.getAttribute('data-block');

            // Add visual feedback for dragging
            draggedElement.style.opacity = '0.5';
            draggedElement.style.transform = 'scale(1.1)';
            draggedElement.style.zIndex = '1000';

            document.addEventListener('touchmove', touchMoveHandler, { passive: false });
            document.addEventListener('touchend', touchEndHandler, { passive: false });
        }
    };

    const touchMoveHandler = (event: TouchEvent) => {
        if (!draggedElement) return;
        event.preventDefault(); 

        const touch = event.touches[0];
        const currentDropTarget = getDropTarget(touch.clientX, touch.clientY);

        if (lastDropTarget && lastDropTarget !== currentDropTarget) {
            lastDropTarget.dispatchEvent(new CustomEvent('touchdragleave', { bubbles: true }));
        }

        if (currentDropTarget && currentDropTarget !== lastDropTarget) {
            currentDropTarget.dispatchEvent(new CustomEvent('touchdragenter', { bubbles: true }));
        }
        
        lastDropTarget = currentDropTarget;
    };

    const touchEndHandler = (event: TouchEvent) => {
        if (draggedElement) {
            // Reset visual feedback
            draggedElement.style.opacity = '1';
            draggedElement.style.transform = 'scale(1)';
            draggedElement.style.zIndex = '';

            const touch = event.changedTouches[0];
            const dropTarget = getDropTarget(touch.clientX, touch.clientY);

            if (dropTarget && draggedBlockData) {
                // Dispatch drop event
                const dropEvent = new CustomEvent('touchdrop', {
                    bubbles: true,
                    detail: { blockData: draggedBlockData }
                });
                dropTarget.dispatchEvent(dropEvent);
            }
            
            if(lastDropTarget) {
                 lastDropTarget.dispatchEvent(new CustomEvent('touchdragleave', { bubbles: true }));
            }
        }
        
        // Cleanup
        document.removeEventListener('touchmove', touchMoveHandler);
        document.removeEventListener('touchend', touchEndHandler);
        draggedElement = null;
        draggedBlockData = null;
        lastDropTarget = null;
    };

    document.addEventListener('touchstart', touchStartHandler, { passive: false });

    return () => {
        document.removeEventListener('touchstart', touchStartHandler);
        document.removeEventListener('touchmove', touchMoveHandler);
        document.removeEventListener('touchend', touchEndHandler);
    };
  }, []);

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

  const handlePlayVennDiagram = () => {
    setShowVennDiagramIntro(true);
  };

  const handleStartVennDiagram = () => {
    setShowVennDiagramIntro(false);
    setActiveGame('venn-diagram');
    logActivity('Iniciado El Cruce Mágico', 'game');
  };

  const handlePlayInventory = () => {
      setShowInventoryIntro(true);
  };

  const handleStartInventory = () => {
      setShowInventoryIntro(false);
      setShowInventoryLevelModal(true);
  };
  
  const handleSelectInventoryLevel = (difficulty: InventoryGameDifficulty) => {
      setCurrentInventoryLevel(difficulty);
      setActiveGame('inventory');
      setShowInventoryLevelModal(false);
      logActivity(`Iniciado El Inventario del Duende: Nivel ${difficulty}`, 'game');
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

  const handleChooseClassificationLevelAgain = () => {
    setActiveGame('classification-games');
    setCurrentLevel(null);
    setShowClassificationModal(true);
    logActivity('Volviendo a la selección de nivel de Clasificación', 'system');
  };

  const handleChooseInventoryLevelAgain = () => {
      setActiveGame('classification-games');
      setCurrentInventoryLevel(null);
      setShowInventoryLevelModal(true);
      logActivity('Volviendo a la selección de nivel de Inventario', 'system');
  };

  const navigate = (game: Game) => {
    setActiveGame(game);
    setIsMenuOpen(false);
    if (game === 'home') {
      setCurrentLevel(null);
      setCurrentInventoryLevel(null);
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
  
  const handleRegister = (userData: User) => {
    setUser(userData);
    localStorage.setItem('magicBoxUser', JSON.stringify(userData));
    setShowRegistrationModal(false);
    logActivity(`Usuario ${userData.firstName} se ha registrado.`, 'system');
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logActivity(`Usuario ${user?.firstName} ha cerrado sesión.`, 'system');
    setUser(null);
    localStorage.removeItem('magicBoxUser');
    setShowLogoutConfirm(false);
  };
  
  const handleClearData = () => {
    setIsMenuOpen(false);
    setShowClearDataConfirm(true);
  };

  const confirmClearData = () => {
    // Reset states
    setUnlockedAchievements({});
    setCompletedLevels({});
    const welcomeMessage: ActivityLogEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      message: '¡Bienvenido al Bosque Mágico!',
      type: 'system',
      seen: true,
    };
    setActivityLog([welcomeMessage]);

    // Clear localStorage
    localStorage.removeItem('unlockedAchievements');
    localStorage.removeItem('completedLevels');
    localStorage.removeItem('activityLog');

    // Close modal and navigate home
    setShowClearDataConfirm(false);
    navigate('home');
    logActivity('Todos los datos del juego han sido limpiados.', 'system');
  };

  const renderGame = () => {
    switch (activeGame) {
      case 'classification':
        return currentLevel && <ClassificationGame gameLevel={currentLevel} onGoHome={handleChooseClassificationLevelAgain} onUnlockAchievement={unlockAchievement} logActivity={logActivity} onLevelComplete={handleLevelComplete} />;
      case 'matching':
        return <MatchingGame onGoHome={() => navigate('home')} onUnlockAchievement={unlockAchievement} logActivity={logActivity} />;
      case 'odd-one-out':
        return <OddOneOutGame onGoHome={() => navigate('home')} onUnlockAchievement={unlockAchievement} logActivity={logActivity} />;
      case 'venn-diagram':
        return <VennDiagramGame onGoHome={() => navigate('home')} onUnlockAchievement={unlockAchievement} logActivity={logActivity} />;
      case 'inventory':
          return currentInventoryLevel && <InventoryGame difficulty={currentInventoryLevel} onGoHome={handleChooseInventoryLevelAgain} onUnlockAchievement={unlockAchievement} logActivity={logActivity} />;
      case 'achievements':
        return <Achievements unlockedAchievements={unlockedAchievements} />;
      case 'classification-games':
        const welcomeTitle = "Juegos de Clasificación";
        const welcomeText = "¡Ayuda a los duendes a ordenar sus figuras mágicas usando diferentes reglas!";
        
        return (
          <div className="flex flex-col items-center justify-center h-full text-center">
             <h1 className="text-5xl font-bold text-sky-700 mb-4">{welcomeTitle}</h1>
             <p className="text-xl text-slate-600 max-w-2xl md:max-w-4xl mb-12">{welcomeText}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <button
                onClick={handlePlayMatching}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-amber-400 text-white font-bold rounded-xl shadow-lg hover:bg-amber-500 transition-transform transform hover:scale-105"
              >
                <PairsIcon className="w-7 h-7" />
                <span>Juego de Parejas</span>
              </button>
              <button
                onClick={handlePlayOddOneOut}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-teal-400 text-white font-bold rounded-xl shadow-lg hover:bg-teal-500 transition-transform transform hover:scale-105"
              >
                <MagnifyingGlassIcon className="w-7 h-7" />
                <span>El Duende Despistado</span>
              </button>
              <button
                onClick={handlePlayVennDiagram}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-cyan-400 text-white font-bold rounded-xl shadow-lg hover:bg-cyan-500 transition-transform transform hover:scale-105"
              >
                <VennDiagramIcon className="w-7 h-7" />
                <span>El Cruce Mágico</span>
              </button>
              <button
                onClick={handlePlayInventory}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-lime-500 text-white font-bold rounded-xl shadow-lg hover:bg-lime-600 transition-transform transform hover:scale-105"
              >
                <ClipboardListIcon className="w-7 h-7" />
                <span>El Inventario del Duende</span>
              </button>
              <button
                onClick={handlePlayClassification}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-rose-400 text-white font-bold rounded-xl shadow-lg hover:bg-rose-500 transition-transform transform hover:scale-105"
              >
                <ClassificationIcon className="w-7 h-7" />
                <span>Juego de Clasificación</span>
              </button>
            </div>
          </div>
        );
      case 'home':
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center">
             <h1 className="text-5xl font-bold text-sky-700 mb-4">¡Bienvenido al Bosque Mágico!</h1>
             <p className="text-xl text-slate-600 max-w-2xl md:max-w-4xl mb-12">Explora y aprende los secretos para pensar como un matemático.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Clasificación Card */}
                <div 
                    onClick={() => setActiveGame('classification-games')}
                    className="p-8 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer"
                >
                    <h2 className="text-3xl font-bold text-rose-600 mb-3">Clasificación</h2>
                    <p className="text-slate-600">Aprende a agrupar objetos por sus características como color, forma y tamaño.</p>
                </div>

                {/* Seriación Card (Disabled) */}
                 <div className="p-8 bg-white/50 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-lg opacity-60 cursor-not-allowed">
                    <h2 className="text-3xl font-bold text-sky-600 mb-3">Seriación</h2>
                    <p className="text-slate-600">Ordena objetos en una secuencia lógica, como del más pequeño al más grande.</p>
                    <span className="inline-block mt-4 px-3 py-1 bg-sky-200 text-sky-800 text-sm font-semibold rounded-full">Próximamente</span>
                </div>

                {/* Conservación Card (Disabled) */}
                <div className="p-8 bg-white/50 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-lg opacity-60 cursor-not-allowed">
                    <h2 className="text-3xl font-bold text-amber-600 mb-3">Conservación</h2>
                    <p className="text-slate-600">Descubre que la cantidad de algo no cambia aunque su forma sí lo haga.</p>
                     <span className="inline-block mt-4 px-3 py-1 bg-amber-200 text-amber-800 text-sm font-semibold rounded-full">Próximamente</span>
                </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-sky-50 text-slate-800 p-4 md:p-8 relative isolate">
       <div 
        className="absolute inset-0 bg-cover bg-center -z-10" 
        style={{ 
          backgroundImage: "url('https://raw.githubusercontent.com/vdhuerta/assets-aplications/main/generated-image%20(15).jpg')",
          opacity: 0.2,
        }}
      ></div>
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
            {user && (
                <span className="hidden sm:block text-xl font-semibold text-rose-600">
                    ¡Hola, {user.firstName}!
                </span>
            )}
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
              onClick={() => setShowAddToHomeScreenModal(true)}
              className="p-3 bg-white text-slate-700 rounded-full shadow-sm hover:bg-sky-100 transition"
              aria-label="Instalar en tu dispositivo"
            >
              <InstallIcon />
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
            {user ? (
                <button
                    onClick={handleLogout}
                    className="p-3 bg-white text-slate-700 rounded-full shadow-sm hover:bg-rose-100 transition"
                    aria-label="Cerrar sesión"
                >
                    <LogoutIcon />
                </button>
            ) : (
                <button
                    onClick={() => setShowRegistrationModal(true)}
                    className="p-3 bg-white text-slate-700 rounded-full shadow-sm hover:bg-sky-100 transition"
                    aria-label="Registrarse"
                >
                    <UserIcon />
                </button>
            )}
            <div className="relative">
              <button
                  onClick={() => setIsMenuOpen(prev => !prev)}
                  className="p-3 bg-white rounded-full shadow-md hover:bg-sky-100 transition"
                  aria-label="Abrir menú"
              >
                  <HamburgerMenuIcon />
              </button>
              {isMenuOpen && <Menu onNavigate={navigate} onClearData={handleClearData} />}
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
          user={user}
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
      {showVennDiagramIntro && (
        <VennDiagramGameIntro
          onStart={handleStartVennDiagram}
          onClose={() => setShowVennDiagramIntro(false)}
        />
      )}
      {showInventoryIntro && (
        <InventoryGameIntro
          onStart={handleStartInventory}
          onClose={() => setShowInventoryIntro(false)}
        />
      )}
      {showInventoryLevelModal && (
        <InventoryLevelModal
          onSelectLevel={handleSelectInventoryLevel}
          onClose={() => setShowInventoryLevelModal(false)}
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
      {showRegistrationModal && (
        <RegistrationModal
          onClose={() => setShowRegistrationModal(false)}
          onRegister={handleRegister}
        />
      )}
      {showLogoutConfirm && (
        <LogoutConfirmationModal
          onConfirm={confirmLogout}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
      {showClearDataConfirm && (
        <ClearDataConfirmationModal
          onConfirm={confirmClearData}
          onCancel={() => setShowClearDataConfirm(false)}
        />
      )}
      {showAddToHomeScreenModal && (
        <AddToHomeScreenModal onClose={() => setShowAddToHomeScreenModal(false)} />
      )}
    </div>
  );
};

export default App;
