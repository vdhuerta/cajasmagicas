

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { speakText } from './utils/tts';
import { GameLevel, ClassificationRule, Notification, Achievement, ActivityLogEntry, ActivityLogType, InventoryGameDifficulty, UserProfile, DienesBlockType } from './types';
import { GAME_LEVELS, TRANSLATIONS, ALL_ACHIEVEMENTS } from './constants';
import { HamburgerMenuIcon } from './components/icons/HamburgerMenuIcon';
import NotificationContainer from './components/NotificationContainer';
import { BookOpenIcon } from './components/icons/BookOpenIcon';
import { BellIcon } from './components/icons/BellIcon';
import { HomeIcon } from './components/icons/HomeIcon';
import { UserIcon } from './components/icons/UserIcon';
import { LogoutIcon } from './components/icons/LogoutIcon';
import { MagnifyingGlassIcon } from './components/icons/MagnifyingGlassIcon';
import { ClassificationIcon } from './components/icons/ClassificationIcon';
import { InstallIcon } from './components/icons/InstallIcon';
import { PairsIcon } from './components/icons/PairsIcon';
import { VennDiagramIcon } from './components/icons/VennDiagramIcon';
import { ClipboardListIcon } from './components/icons/ClipboardListIcon';
import { supabase } from './services/supabase';

// Lazy load components for better performance
const ClassificationGame = lazy(() => import('./components/ClassificationGame'));
const MatchingGame = lazy(() => import('./components/MatchingGame'));
const OddOneOutGame = lazy(() => import('./components/OddOneOutGame'));
const VennDiagramGame = lazy(() => import('./components/VennDiagramGame'));
const InventoryGame = lazy(() => import('./components/InventoryGame'));
const Achievements = lazy(() => import('./components/Achievements'));
const Menu = lazy(() => import('./components/Menu'));
const ClassificationLevelModal = lazy(() => import('./components/ClassificationLevelModal'));
const InventoryLevelModal = lazy(() => import('./components/InventoryLevelModal'));
const TeachersGuide = lazy(() => import('./components/TeachersGuide'));
const NotificationsLog = lazy(() => import('./components/NotificationsLog'));
const RegistrationModal = lazy(() => import('./components/RegistrationModal'));
const LogoutConfirmationModal = lazy(() => import('./components/LogoutConfirmationModal'));
const ClearDataConfirmationModal = lazy(() => import('./components/ClearDataConfirmationModal'));
const AddToHomeScreenModal = lazy(() => import('./components/AddToHomeScreenModal'));
const Ranking = lazy(() => import('./components/Ranking'));
const GameIntroModal = lazy(() => import('./components/GameIntroModal'));

type Game = 'home' | 'classification-games' | 'classification' | 'matching' | 'odd-one-out' | 'achievements' | 'venn-diagram' | 'inventory';

const GameLoading: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full text-center">
    <p className="text-xl text-slate-600 animate-pulse">Cargando juego...</p>
  </div>
);

const App: React.FC = () => {
  const [activeGame, setActiveGame] = useState<Game>('home');
  const [showClassificationModal, setShowClassificationModal] = useState(false);
  const [introGameKey, setIntroGameKey] = useState<Game | null>(null);

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
  const [initialModalView, setInitialModalView] = useState<'login' | 'register'>('login');
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  
  const unseenLogsCount = activityLog.filter(log => !log.seen).length;
  
  useEffect(() => {
    // Failsafe timer to catch hangs in the entire auth process
    const authTimeout = setTimeout(() => {
        console.warn("Authentication check timed out after 10 seconds. Loading in guest mode.");
        setAuthLoading(false);
    }, 10000);

    if (!supabase) {
        console.warn("Supabase client not available. Running in local mode.");
        clearTimeout(authTimeout);
        setAuthLoading(false);
        return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        try {
            if (session?.user) {
                let profile: any | null = null;
                let lastError: any = null;

                // Retry logic to fetch profile, which might be needed due to replication delay after signup
                for (let i = 0; i < 4; i++) {
                    const { data, error } = await supabase
                        .from('usuarios')
                        .select('*')
                        .eq('id', session.user.id);
                    
                    if (data && data.length > 0) {
                        profile = data[0];
                        lastError = null;
                        break; 
                    }

                    lastError = error;
                    // Wait with increasing delay before retrying
                    if (i < 3) {
                        await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)));
                    }
                }

                if (profile) {
                    const userProfile: UserProfile = {
                        id: profile.id,
                        email: profile.email,
                        firstName: profile.firstName || 'Explorador',
                        lastName: profile.lastName || '',
                        career: profile.career || 'Educación Parvularia',
                        score: profile.score ?? 0,
                        unlockedAchievements: profile.unlockedAchievements || {},
                        completed_levels: profile.completed_levels || {},
                    };
                    setCurrentUser(userProfile);
                } else {
                    const errorMessage = lastError ? lastError.message : "Profile not found after multiple attempts.";
                    console.error("Failed to fetch user profile:", errorMessage);
                    setCurrentUser(null); // Ensure user is null if profile fetch fails
                }
            } else {
                // No user session found
                setCurrentUser(null);
            }
        } catch (e) {
            console.error("A critical error occurred during the authentication process:", e);
            setCurrentUser(null); // Reset user state on critical error
        } finally {
            // This block is guaranteed to execute once the try/catch is done.
            clearTimeout(authTimeout); // The process finished, so we can clear the failsafe timer.
            setAuthLoading(false);   // And we hide the loading screen.
        }
    });

    // Cleanup function for when the component unmounts
    return () => {
        subscription?.unsubscribe();
        clearTimeout(authTimeout);
    };
}, []);

  useEffect(() => {
    const logKey = currentUser ? `activityLog_${currentUser.id}` : 'activityLog_guest';
    const savedLog = localStorage.getItem(logKey);
    if (savedLog) {
      setActivityLog(JSON.parse(savedLog));
    } else {
      const welcomeMessage: ActivityLogEntry = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          message: '¡Bienvenido al Bosque Mágico!',
          type: 'system',
          seen: true,
      };
      setActivityLog([welcomeMessage]);
    }
  }, [currentUser]);
  
  useEffect(() => {
    const logKey = currentUser ? `activityLog_${currentUser.id}` : 'activityLog_guest';
    if (activityLog.length > 0) {
      localStorage.setItem(logKey, JSON.stringify(activityLog));
    }
  }, [activityLog, currentUser]);

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

    const newScore = (currentUser.score || 0) + points;
    
    const { error } = await supabase
      .from('usuarios')
      .update({ score: newScore })
      .eq('id', currentUser.id);

    if (error) {
      console.error("Error updating score:", error);
    } else {
      setCurrentUser(prev => prev ? { ...prev, score: newScore } : null);
    }
    
    const newNotification: Notification = {
      id: Date.now(),
      message: `¡Has ganado ${points} puntos!`,
      achievementId: 'points_earned',
    };
    setNotifications(prev => [...prev, newNotification]);
  };

  const unlockAchievement = async (achievementId: string) => {
    if (!supabase || !currentUser || (currentUser.unlockedAchievements && currentUser.unlockedAchievements[achievementId])) return;

    const achievement = ALL_ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return;

    const newUnlocked = { ...(currentUser.unlockedAchievements || {}), [achievementId]: true };
    setCurrentUser(prev => prev ? { ...prev, unlockedAchievements: newUnlocked } : null);

    const { error } = await supabase
      .from('usuarios')
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
      if (!supabase || !currentUser || (currentUser.completed_levels && currentUser.completed_levels[levelName])) return;

      const newCompleted = { ...(currentUser.completed_levels || {}), [levelName]: true };
      setCurrentUser(prev => prev ? { ...prev, completed_levels: newCompleted } : null);
      
      const { error } = await supabase
        .from('usuarios')
        .update({ completed_levels: newCompleted })
        .eq('id', currentUser.id);
      
      if (error) console.error("Error completing level:", error);
  };
  
  const handleStartGame = (game: Game) => {
    setIntroGameKey(null);
    setActiveGame(game);
    const gameNameMap = {
      'matching': 'Juego de Parejas',
      'odd-one-out': 'El Duende Despistado',
      'venn-diagram': 'El Cruce Mágico',
    };
    if (gameNameMap[game as keyof typeof gameNameMap]) {
      logActivity(`Iniciado ${gameNameMap[game as keyof typeof gameNameMap]}`, 'game');
    }
  };

  const handleStartInventory = () => {
      setIntroGameKey(null);
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
  
  const handleOpenAuthModal = (view: 'login' | 'register') => {
    setInitialModalView(view);
    setShowRegistrationModal(true);
  };

  const navigate = async (game: Game | 'ranking') => {
    if (game === 'ranking') {
        if (!supabase) return;
        const { data: users, error } = await supabase
          .from('usuarios')
          .select('id, firstName, lastName, career, score')
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
    } else if (game === 'classification-games') {
        setCurrentLevel(null);
        setCurrentInventoryLevel(null);
        logActivity('Navegando a los juegos de clasificación', 'system');
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
        completed_levels: {}
    };
    
    const { error } = await supabase
      .from('usuarios')
      .update(clearedProfile)
      .eq('id', currentUser.id);

    if (error) {
      console.error("Error clearing data:", error);
    } else {
      setCurrentUser(prev => prev ? { ...prev, ...clearedProfile } : null);
    }
    
    const logKey = currentUser ? `activityLog_${currentUser.id}` : 'activityLog_guest';
    localStorage.removeItem(logKey);

    const welcomeMessage: ActivityLogEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      message: '¡Bienvenido al Bosque Mágico!',
      type: 'system',
      seen: true,
    };
    setActivityLog([welcomeMessage]);
    
    setShowClearDataConfirm(false);
    navigate('home');
    logActivity('Todos los datos de tu cuenta han sido limpiados.', 'system');
  };
  
  const introContentMap = {
    'matching': {
      title: "El Desafío de la Memoria del Bosque",
      story: "¡Los duendes traviesos han vuelto a hacer de las suyas! Han escondido las figuras mágicas bajo un manto de hojas encantadas. ¡Solo un explorador con una memoria de elefante puede encontrar todas las parejas y poner orden!",
      instructions: "Tu misión es simple: voltea dos hojas a la vez para encontrar las figuras que son idénticas. ¡Concéntrate y recuerda dónde se esconde cada una!",
      buttonText: "¡Estoy listo!",
      Icon: PairsIcon,
      theme: { text: 'text-amber-800', buttonBg: 'bg-amber-500', buttonHoverBg: 'hover:bg-amber-600', iconText: 'text-amber-500', bg: 'bg-amber-50', audioHover: 'hover:bg-amber-100', audioText: 'text-amber-700' },
      onStart: () => handleStartGame('matching'),
    },
    'odd-one-out': {
      title: "El Duende Despistado",
      story: "¡Oh, no! Un duende un poco despistado ha mezclado todas las figuras mágicas mientras jugaba. En cada grupo que te muestre, ha colado una figura que no debería estar ahí.",
      instructions: "Tu misión es encontrar al 'impostor'. Observa con atención el consejo del duende y haz clic en la única figura que no sigue la regla. ¡Demuestra tu ojo de águila!",
      buttonText: "¡A investigar!",
      Icon: MagnifyingGlassIcon,
      theme: { text: 'text-teal-800', buttonBg: 'bg-teal-500', buttonHoverBg: 'hover:bg-teal-600', iconText: 'text-teal-500', bg: 'bg-teal-50', audioHover: 'hover:bg-teal-100', audioText: 'text-teal-700' },
      onStart: () => handleStartGame('odd-one-out'),
    },
    'venn-diagram': {
      title: "El Cruce Mágico",
      story: "Dos arroyos mágicos fluyen por el bosque. Uno es el 'Arroyo de las Formas Circulares' y el otro es el 'Arroyo de las Cosas Azules'. ¡Donde se cruzan, forman una poza mágica!",
      instructions: "Tu misión es arrastrar cada figura a su lugar correcto. Algunas van a un arroyo, otras al otro, ¡y las más especiales van justo en la poza donde se juntan los dos!",
      buttonText: "¡Vamos a explorar!",
      Icon: VennDiagramIcon,
      theme: { text: 'text-cyan-800', buttonBg: 'bg-cyan-500', buttonHoverBg: 'hover:bg-cyan-600', iconText: 'text-cyan-500', bg: 'bg-cyan-50', audioHover: 'hover:bg-cyan-100', audioText: 'text-cyan-700' },
      onStart: () => handleStartGame('venn-diagram'),
    },
     'inventory': {
      title: "El Inventario del Duende",
      story: "Un duende artesano muy ocupado necesita tu ayuda. Está construyendo inventos mágicos, ¡pero se le han mezclado todas las piezas! No puede empezar a construir hasta que tenga el número exacto de cada componente.",
      instructions: "Tu misión es leer con atención el pedido del duende. Luego, busca en el montón las figuras que te pide, cuéntalas con cuidado y arrástralas a su cesta. ¡La precisión es la clave!",
      buttonText: "¡A trabajar!",
      Icon: ClipboardListIcon,
      theme: { text: 'text-lime-800', buttonBg: 'bg-lime-500', buttonHoverBg: 'hover:bg-lime-600', iconText: 'text-lime-500', bg: 'bg-lime-50', audioHover: 'hover:bg-lime-100', audioText: 'text-lime-700' },
      onStart: handleStartInventory,
    },
  };

  const renderGame = () => {
    switch (activeGame) {
      case 'classification':
        return currentLevel && <ClassificationGame gameLevel={currentLevel} onGoHome={handleChooseClassificationLevelAgain} onUnlockAchievement={unlockAchievement} logActivity={logActivity} onLevelComplete={handleLevelComplete} addScore={addScore} completedLevels={currentUser?.completed_levels || {}} />;
      case 'matching':
        return <MatchingGame onGoHome={() => setActiveGame('classification-games')} onUnlockAchievement={unlockAchievement} logActivity={logActivity} addScore={addScore} onLevelComplete={handleLevelComplete} completedLevels={currentUser?.completed_levels || {}} />;
      case 'odd-one-out':
        return <OddOneOutGame onGoHome={() => setActiveGame('classification-games')} onUnlockAchievement={unlockAchievement} logActivity={logActivity} addScore={addScore} onLevelComplete={handleLevelComplete} completedLevels={currentUser?.completed_levels || {}} />;
      case 'venn-diagram':
        return <VennDiagramGame onGoHome={() => setActiveGame('classification-games')} onUnlockAchievement={unlockAchievement} logActivity={logActivity} addScore={addScore} completedLevels={currentUser?.completed_levels || {}} onLevelComplete={handleLevelComplete} />;
      case 'inventory':
          return currentInventoryLevel && <InventoryGame difficulty={currentInventoryLevel} onGoHome={handleChooseInventoryLevelAgain} onUnlockAchievement={unlockAchievement} logActivity={logActivity} addScore={addScore} onLevelComplete={handleLevelComplete} completedLevels={currentUser?.completed_levels || {}} />;
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
                onClick={() => setIntroGameKey('matching')}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-amber-400 text-white font-bold rounded-xl shadow-lg transition-transform transform hover:scale-105 hover:bg-amber-500"
              >
                <PairsIcon className="w-7 h-7" />
                <span>Juego de Parejas</span>
              </button>
              <button
                onClick={() => setIntroGameKey('odd-one-out')}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-teal-400 text-white font-bold rounded-xl shadow-lg transition-transform transform hover:scale-105 hover:bg-teal-500"
              >
                <MagnifyingGlassIcon className="w-7 h-7" />
                <span>El Duende Despistado</span>
              </button>
              <button
                onClick={() => setIntroGameKey('venn-diagram')}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-cyan-400 text-white font-bold rounded-xl shadow-lg transition-transform transform hover:scale-105 hover:bg-cyan-500"
              >
                <VennDiagramIcon className="w-7 h-7" />
                <span>El Cruce Mágico</span>
              </button>
              <button
                onClick={() => setIntroGameKey('inventory')}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-lime-500 text-white font-bold rounded-xl shadow-lg transition-transform transform hover:scale-105 hover:bg-lime-600"
              >
                <ClipboardListIcon className="w-7 h-7" />
                <span>El Inventario del Duende</span>
              </button>
              <button
                onClick={() => setShowClassificationModal(true)}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-rose-400 text-white font-bold rounded-xl shadow-lg transition-transform transform hover:scale-105 hover:bg-rose-500"
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

  const currentIntroContent = introGameKey ? introContentMap[introGameKey as keyof typeof introContentMap] : null;

  return (
    <div className="min-h-screen bg-sky-50 text-slate-800 p-4 md:p-8 relative isolate">
       <div 
        className="absolute inset-0 bg-cover bg-center -z-10 opacity-20" 
        style={{ 
          backgroundImage: "url('https://raw.githubusercontent.com/vdhuerta/assets-aplications/main/bosque_fondo.jpg')",
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
            {currentUser ? (
                <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="p-3 bg-white text-slate-700 rounded-full shadow-sm hover:bg-rose-100 transition"
                    aria-label="Cerrar sesión"
                >
                    <LogoutIcon />
                </button>
            ) : (
                <button
                    onClick={() => handleOpenAuthModal('login')}
                    className="p-3 bg-white text-slate-700 rounded-full shadow-sm hover:bg-sky-100 transition"
                    aria-label="Iniciar sesión o crear cuenta"
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
              {isMenuOpen && <Suspense fallback={null}><Menu onNavigate={navigate} onClearData={handleClearData} user={currentUser} /></Suspense>}
            </div>
        </div>
      </header>
      <div className="w-full border-b-2 border-sky-300 mb-6"></div>
      <main className="w-full h-[calc(100vh-140px)]">
        <Suspense fallback={<GameLoading />}>
          {renderGame()}
        </Suspense>
      </main>
      {showClassificationModal && (
        <Suspense fallback={null}>
          <ClassificationLevelModal 
            onSelectLevel={handleSelectLevel}
            onStartExpertLevel={handleStartExpertLevel}
            onClose={() => setShowClassificationModal(false)}
            completedLevels={currentUser?.completed_levels || {}}
            user={currentUser}
          />
        </Suspense>
      )}
      {currentIntroContent && (
        <Suspense fallback={null}>
          <GameIntroModal
            {...currentIntroContent}
            onClose={() => setIntroGameKey(null)}
          />
        </Suspense>
      )}
      {showInventoryLevelModal && (
        <Suspense fallback={null}>
          <InventoryLevelModal
            onSelectLevel={handleSelectInventoryLevel}
            onClose={() => setShowInventoryLevelModal(false)}
            completedLevels={currentUser?.completed_levels || {}}
            user={currentUser}
          />
        </Suspense>
      )}
      {showTeachersGuide && (
        <Suspense fallback={null}>
          <TeachersGuide onClose={() => setShowTeachersGuide(false)} />
        </Suspense>
      )}
      <Suspense fallback={null}>
        <NotificationsLog
          isOpen={isLogOpen}
          onClose={() => setIsLogOpen(false)}
          logs={activityLog}
          onClear={handleClearLog}
        />
      </Suspense>
      {showRegistrationModal && (
        <Suspense fallback={null}>
          <RegistrationModal
            onClose={() => setShowRegistrationModal(false)}
            logActivity={logActivity}
            initialView={initialModalView}
          />
        </Suspense>
      )}
      {showLogoutConfirm && (
        <Suspense fallback={null}>
          <LogoutConfirmationModal
            onConfirm={confirmLogout}
            onCancel={() => setShowLogoutConfirm(false)}
          />
        </Suspense>
      )}
      {showClearDataConfirm && (
        <Suspense fallback={null}>
          <ClearDataConfirmationModal
            onConfirm={confirmClearData}
            onCancel={() => setShowClearDataConfirm(false)}
          />
        </Suspense>
      )}
      {showAddToHomeScreenModal && (
        <Suspense fallback={null}>
          <AddToHomeScreenModal onClose={() => setShowAddToHomeScreenModal(false)} />
        </Suspense>
      )}
      {showRanking && (
        <Suspense fallback={null}>
          <Ranking
            users={allUsers}
            currentUser={currentUser}
            onClose={() => setShowRanking(false)}
          />
        </Suspense>
      )}
    </div>
  );
};

export default App;