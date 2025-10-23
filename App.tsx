
import React, { useState, useEffect } from 'react';
import ClassificationGame from './components/ClassificationGame';
import MatchingGame from './components/MatchingGame';
import { speakText } from './utils/tts';
import ClassificationLevelModal from './components/ClassificationLevelModal';
import { GameLevel, ClassificationRule, Notification, Achievement, ActivityLogEntry, ActivityLogType, InventoryGameDifficulty, UserProfile, DienesBlockType } from './types';
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
import Ranking from './components/Ranking';
import { supabase } from './services/supabase';


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
  const [showRanking, setShowRanking] = useState(false);

  const [showTeachersGuide, setShowTeachersGuide] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<GameLevel | null>(null);
  const [currentInventoryLevel, setCurrentInventoryLevel] = useState<InventoryGameDifficulty | null>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLogOpen, setIsLogOpen] = useState(false);
  
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  
  const unseenLogsCount = activityLog.filter(log => !log.seen).length;
  
  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setAuthLoading(true);
      if (session?.user) {
        const { data: userProfile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (error) {
          console.error("Error fetching user profile:", error);
          setCurrentUser(null);
        } else {
          setCurrentUser(userProfile as UserProfile);
        }
      } else {
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Cargar el registro de actividad desde localStorage (se mantiene simple)
    const savedLog = localStorage.getItem('activityLog');
    if (savedLog) {
      setActivityLog(JSON.parse(savedLog));
    } else {
      logActivity('¡Bienvenido al Bosque Mágico!', 'system');
    }
  }, []);
  
  useEffect(() => {
      // Guardar el registro de actividad en localStorage
      localStorage.setItem('activityLog', JSON.stringify(activityLog));
  }, [activityLog]);

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
            draggedElement = draggable;
            draggedBlockData = draggable.getAttribute('data-block');
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
            draggedElement.style.opacity = '1';
            draggedElement.style.transform = 'scale(1)';
            draggedElement.style.zIndex = '';
            const touch = event.changedTouches[0];
            const dropTarget = getDropTarget(touch.clientX, touch.clientY);
            if (dropTarget && draggedBlockData) {
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

  const logActivity = (message: string, type: ActivityLogType, pointsEarned?: number) => {
      const newEntry: ActivityLogEntry = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          message,
          type,
          seen: isLogOpen,
          pointsEarned,
      };
      setActivityLog(prev => [newEntry, ...prev]);
  };

  const addScore = async (points: number, message: string) => {
    if (!supabase || !currentUser || points <= 0) return;

    logActivity(message, 'win', points);

    const newScore = currentUser.score + points;
    setCurrentUser(prev => prev ? { ...prev, score: newScore } : null);

    const { error } = await supabase.rpc('increment_score', { 
        user_id_in: currentUser.id, 
        points_in: points 
    });
    if (error) console.error("Error updating score:", error);
    
    const newNotification: Notification = {
      id: Date.now(),
      message: `¡Has ganado ${points} puntos!`,
      achievementId: 'points_earned',
    };
    setNotifications(prev => [...prev, newNotification]);
  };

  const unlockAchievement = async (achievementId: string) => {
    if (!supabase || !currentUser || currentUser.unlockedAchievements[achievementId]) return;

    const achievement = ALL_ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return;

    const newUnlocked = { ...currentUser.unlockedAchievements, [achievementId]: true };
    setCurrentUser(prev => prev ? { ...prev, unlockedAchievements: newUnlocked } : null);

    const { error } = await supabase
      .from('users')
      .update({ unlockedAchievements: newUnlocked })
      .eq('id', currentUser.id);

    if (error) console.error("Error unlocking achievement:", error);

    const newNotification: Notification = {
      id: Date.now(),
      message: `¡Logro desbloqueado: ${achievement.name}!`,
      achievementId: achievement.id,
    };
    setNotifications(prev => [...prev, newNotification]);
    logActivity(`Logro desbloqueado: ${achievement.name}`, 'achievement');
  };
  
  const handleLevelComplete = async (levelName: string) => {
      if (!supabase || !currentUser || currentUser.completedLevels[levelName]) return;

      const newCompleted = { ...currentUser.completedLevels, [levelName]: true };
      setCurrentUser(prev => prev ? { ...prev, completedLevels: newCompleted } : null);
      
      const { error } = await supabase
        .from('users')
        .update({ completedLevels: newCompleted })
        .eq('id', currentUser.id);
      
      if (error) console.error("Error completing level:", error);
  };

  const handlePlayClassification = () => setShowClassificationModal(true);
  const handlePlayMatching = () => setShowMatchingIntro(true);
  
  const handleStartMatching = () => {
    setShowMatchingIntro(false);
    setActiveGame('matching');
    logActivity('Iniciado el Juego de Parejas', 'game');
  };

  const handlePlayOddOneOut = () => setShowOddOneOutIntro(true);
  const handleStartOddOneOut = () => {
    setShowOddOneOutIntro(false);
    setActiveGame('odd-one-out');
    logActivity('Iniciado El Duende Despistado', 'game');
  };

  const handlePlayVennDiagram = () => setShowVennDiagramIntro(true);
  const handleStartVennDiagram = () => {
    setShowVennDiagramIntro(false);
    setActiveGame('venn-diagram');
    logActivity('Iniciado El Cruce Mágico', 'game');
  };

  const handlePlayInventory = () => setShowInventoryIntro(true);
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

  const navigate = async (game: Game | 'ranking') => {
    if (game === 'ranking') {
        if (!supabase) return;
        const { data: users, error } = await supabase
          .from('users')
          .select('*')
          .order('score', { ascending: false })
          .limit(50);
        
        if (error) {
          console.error("Error fetching ranking:", error);
        } else {
          setAllUsers(users as UserProfile[]);
        }
        setShowRanking(true);
        setIsMenuOpen(false);
        logActivity('Viendo la Tabla de Clasificación', 'system');
        return;
    }
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
  
  const confirmLogout = async () => {
    if (!supabase) return;
    logActivity(`Usuario ${currentUser?.firstName} ha cerrado sesión.`, 'system');
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Error signing out:", error);
    setCurrentUser(null);
    setShowLogoutConfirm(false);
  };
  
  const handleClearData = () => {
    setIsMenuOpen(false);
    setShowClearDataConfirm(true);
  };

  const confirmClearData = async () => {
    if (!supabase || !currentUser) return;

    const clearedProfile = {
        score: 0,
        unlockedAchievements: {},
        completedLevels: {}
    };
    
    const { error } = await supabase
      .from('users')
      .update(clearedProfile)
      .eq('id', currentUser.id);

    if (error) {
      console.error("Error clearing data:", error);
    } else {
      setCurrentUser(prev => prev ? { ...prev, ...clearedProfile } : null);
    }
    
    const welcomeMessage: ActivityLogEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      message: '¡Bienvenido al Bosque Mágico!',
      type: 'system',
      seen: true,
    };
    setActivityLog([welcomeMessage]);
    localStorage.removeItem('activityLog');
    setShowClearDataConfirm(false);
    navigate('home');
    logActivity('Todos los datos de tu cuenta han sido limpiados.', 'system');
  };

  const renderGame = () => {
    switch (activeGame) {
      case 'classification':
        return currentLevel && <ClassificationGame gameLevel={currentLevel} onGoHome={handleChooseClassificationLevelAgain} onUnlockAchievement={unlockAchievement} logActivity={logActivity} onLevelComplete={handleLevelComplete} addScore={addScore} completedLevels={currentUser?.completedLevels || {}} />;
      case 'matching':
        return <MatchingGame onGoHome={() => navigate('home')} onUnlockAchievement={unlockAchievement} logActivity={logActivity} addScore={addScore} />;
      case 'odd-one-out':
        return <OddOneOutGame onGoHome={() => navigate('home')} onUnlockAchievement={unlockAchievement} logActivity={logActivity} addScore={addScore} />;
      case 'venn-diagram':
        return <VennDiagramGame onGoHome={() => navigate('home')} onUnlockAchievement={unlockAchievement} logActivity={logActivity} addScore={addScore} completedLevels={currentUser?.completedLevels || {}} onLevelComplete={handleLevelComplete} />;
      case 'inventory':
          return currentInventoryLevel && <InventoryGame difficulty={currentInventoryLevel} onGoHome={handleChooseInventoryLevelAgain} onUnlockAchievement={unlockAchievement} logActivity={logActivity} addScore={addScore} />;
      case 'achievements':
        return <Achievements unlockedAchievements={currentUser?.unlockedAchievements || {}} />;
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
        if (authLoading) {
          return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-xl text-slate-600 animate-pulse">Cargando Bosque Mágico...</p>
            </div>
          );
        }
        return (
          <div className="flex flex-col items-center justify-center h-full text-center">
             <h1 className="text-5xl font-bold text-sky-700 mb-4">¡Bienvenido al Bosque Mágico!</h1>
             <p className="text-xl text-slate-600 max-w-2xl md:max-w-4xl mb-12">Explora y aprende los secretos para pensar como un matemático.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div 
                    onClick={() => setActiveGame('classification-games')}
                    className="p-8 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer"
                >
                    <h2 className="text-3xl font-bold text-rose-600 mb-3">Clasificación</h2>
                    <p className="text-slate-600">Aprende a agrupar objetos por sus características como color, forma y tamaño.</p>
                </div>
                 <div className="p-8 bg-white/50 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-lg opacity-60 cursor-not-allowed">
                    <h2 className="text-3xl font-bold text-sky-600 mb-3">Seriación</h2>
                    <p className="text-slate-600">Ordena objetos en una secuencia lógica, como del más pequeño al más grande.</p>
                    <span className="inline-block mt-4 px-3 py-1 bg-sky-200 text-sky-800 text-sm font-semibold rounded-full">Próximamente</span>
                </div>
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
            {currentUser && (
                <div className="hidden sm:flex items-center gap-2 text-xl font-semibold text-rose-600">
                    <span>¡Hola, {currentUser.firstName}!</span>
                    <span className="px-3 py-1 bg-rose-100 text-rose-700 text-sm rounded-full">{currentUser.score.toLocaleString('es-ES')} pts</span>
                </div>
            )}
        </div>
        <div className="flex items-center gap-2 md:gap-4">
            {!supabase && (
                <div className="hidden sm:flex items-center gap-2 text-sm font-semibold text-amber-700 bg-amber-100 px-3 py-1 rounded-full" title="La conexión con la base de datos no está configurada. El progreso no se guardará.">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                    <span>Modo Local</span>
                </div>
            )}
            <button
              onClick={() => setShowTeachersGuide(true)}
              className="p-3 bg-white text-slate-700 rounded-full shadow-sm hover:bg-sky-100 transition"
              aria-label="Guía para Profesores"
            >
              <BookOpenIcon />
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
            {supabase && (currentUser ? (
                <button
                    onClick={() => setShowLogoutConfirm(true)}
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
            ))}
            <div className="relative">
              <button
                  onClick={() => setIsMenuOpen(prev => !prev)}
                  className="p-3 bg-white rounded-full shadow-md hover:bg-sky-100 transition"
                  aria-label="Abrir menú"
              >
                  <HamburgerMenuIcon />
              </button>
              {isMenuOpen && <Menu onNavigate={navigate} onClearData={handleClearData} user={currentUser} />}
            </div>
        </div>
      </header>
      <div className="w-full border-b-2 border-sky-300 mb-6"></div>
      <main className="w-full h-[calc(100vh-140px)]">
        {renderGame()}
      </main>
      {showClassificationModal && (
        <ClassificationLevelModal 
          onSelectLevel={handleSelectLevel}
          onStartExpertLevel={handleStartExpertLevel}
          onClose={() => setShowClassificationModal(false)}
          completedLevels={currentUser?.completedLevels || {}}
          user={currentUser}
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
          logActivity={logActivity}
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
      {showRanking && (
        <Ranking
          users={allUsers}
          currentUser={currentUser}
          onClose={() => setShowRanking(false)}
        />
      )}
    </div>
  );
};

export default App;
