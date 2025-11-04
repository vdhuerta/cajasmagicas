// FIX: Corrected the React import. The alias 'a' was invalid.
import React from 'react';
import { speakText } from './utils/tts';
import { GameLevel, ClassificationRule, Notification, Achievement, ActivityLogEntry, ActivityLogType, InventoryGameDifficulty, UserProfile, DienesBlockType, PerformanceLog, SeriationChallengeType } from './types';
// FIX: Corrected typo from ALL_ACHIEVEMENTS to ALL_ACHIEVEMENTS.
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
import { TreasureChestIcon } from './components/icons/TreasureChestIcon';
import { supabase } from './services/supabase';
import { Session, RealtimeChannel } from '@supabase/supabase-js';
import { CogIcon } from './components/icons/CogIcon';
import { CuisenaireIcon } from './components/icons/CuisenaireIcon';
import { StairsIcon } from './components/icons/StairsIcon';
import { SnakeIcon } from './components/icons/SnakeIcon';

// Lazy load components for better performance
// FIX: Replaced invalid alias 'a' with 'React'. This fix is applied to all React hooks and components below.
const ClassificationGame = React.lazy(() => import('./components/ClassificationGame'));
const MatchingGame = React.lazy(() => import('./components/MatchingGame'));
const OddOneOutGame = React.lazy(() => import('./components/OddOneOutGame'));
const VennDiagramGame = React.lazy(() => import('./components/VennDiagramGame'));
const InventoryGame = React.lazy(() => import('./components/InventoryGame'));
const TreasureSortGame = React.lazy(() => import('./components/TreasureSortGame'));
const SeriationGame = React.lazy(() => import('./components/SeriationGame'));
const HiddenStepGame = React.lazy(() => import('./components/HiddenStepGame'));
const ColorSnakeGame = React.lazy(() => import('./components/ColorSnakeGame'));
const Achievements = React.lazy(() => import('./components/Achievements'));
const Menu = React.lazy(() => import('./components/Menu'));
const ClassificationLevelModal = React.lazy(() => import('./components/ClassificationLevelModal'));
const InventoryLevelModal = React.lazy(() => import('./components/InventoryLevelModal'));
const TeachersGuide = React.lazy(() => import('./components/TeachersGuide'));
const NotificationsLog = React.lazy(() => import('./components/NotificationsLog'));
const RegistrationModal = React.lazy(() => import('./components/RegistrationModal'));
const LogoutConfirmationModal = React.lazy(() => import('./components/LogoutConfirmationModal'));
const ClearDataConfirmationModal = React.lazy(() => import('./components/ClearDataConfirmationModal'));
const AddToHomeScreenModal = React.lazy(() => import('./components/AddToHomeScreenModal'));
const Ranking = React.lazy(() => import('./components/Ranking'));
const GameIntroModal = React.lazy(() => import('./components/GameIntroModal'));
const PerformanceDashboard = React.lazy(() => import('./components/PerformanceDashboard'));
const AdminPanel = React.lazy(() => import('./components/AdminPanel'));


type Game = 'home' | 'classification-games' | 'classification' | 'matching' | 'odd-one-out' | 'achievements' | 'venn-diagram' | 'inventory' | 'treasure-sort' | 'seriation-games' | 'seriation' | 'hidden-step' | 'color-snake';

const GameLoading: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full text-center">
    <p className="text-xl text-slate-600 animate-pulse">Cargando juego...</p>
  </div>
);

const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const App: React.FC = () => {
  const [activeGame, setActiveGame] = React.useState<Game>('home');
  const [showClassificationModal, setShowClassificationModal] = React.useState(false);
  const [introGameKey, setIntroGameKey] = React.useState<string | null>(null);

  const [showInventoryLevelModal, setShowInventoryLevelModal] = React.useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = React.useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);
  const [showClearDataConfirm, setShowClearDataConfirm] = React.useState(false);
  const [showAddToHomeScreenModal, setShowAddToHomeScreenModal] = React.useState(false);
  const [showRanking, setShowRanking] = React.useState(false);
  const [showAdminPanel, setShowAdminPanel] = React.useState(false);

  const [showTeachersGuide, setShowTeachersGuide] = React.useState(false);
  const [currentLevel, setCurrentLevel] = React.useState<GameLevel | null>(null);
  const [currentInventoryLevel, setCurrentInventoryLevel] = React.useState<InventoryGameDifficulty | null>(null);
  const [activeSeriationChallenge, setActiveSeriationChallenge] = React.useState<SeriationChallengeType | null>(null);

  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isLogOpen, setIsLogOpen] = React.useState(false);
  
  const [allUsers, setAllUsers] = React.useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = React.useState<UserProfile | null>(null);
  const [initialModalView, setInitialModalView] = React.useState<'login' | 'register'>('login');
  
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [activityLog, setActivityLog] = React.useState<ActivityLogEntry[]>([]);
  
  const [showPerformanceDashboard, setShowPerformanceDashboard] = React.useState(false);
  const [dashboardLogs, setDashboardLogs] = React.useState<PerformanceLog[]>([]);
  const [isFetchingDashboard, setIsFetchingDashboard] = React.useState(false);

  // New state for user's completed activities
  const [completedActivities, setCompletedActivities] = React.useState<Set<string>>(new Set());

  const unseenLogsCount = activityLog.filter(log => !log.seen).length;
  
  const navigate = async (game: Game | 'ranking') => {
    setIsMenuOpen(false); // Close menu immediately for better UX
    if (game === 'ranking') {
        if (!supabase) return;

        const { data: users, error } = await supabase
          .from('usuarios')
          .select('id, firstName, lastName, career, score')
          .order('score', { ascending: false })
          .limit(20); // Changed from 50 to 20
        
        if (error) {
          console.error("Error fetching ranking:", error.message);
          // Don't show the modal if there's an error.
        } else {
          setAllUsers(users as UserProfile[]);
          setShowRanking(true); // Only show modal on success
        }
        logActivity('Viendo la Tabla de Clasificación', 'system');
        return;
    }
    
    setActiveGame(game);
    if (game === 'home') {
      setCurrentLevel(null);
      setCurrentInventoryLevel(null);
      logActivity('Navegando a la página de Inicio', 'system');
    } else if (game === 'achievements') {
      logActivity('Viendo el Salón de Logros', 'system');
    } else if (game === 'classification-games' || game === 'seriation-games') {
        setCurrentLevel(null);
        setCurrentInventoryLevel(null);
        logActivity(`Navegando a los juegos de ${game === 'seriation-games' ? 'seriación' : 'clasificación'}`, 'system');
    }
  };

  const fetchUserProfile = React.useCallback(async (session: Session) => {
    if (!supabase) return;

    try {
        const { data: dbProfile, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', session.user.id)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error("Error fetching user profile (likely RLS issue):", error.message);
            const rlsErrorMessage = "Error al cargar el perfil. Esto se debe a políticas de seguridad (RLS) incorrectas en la tabla 'usuarios'. Revisa la consola para obtener el script SQL de corrección.";
            logActivity(rlsErrorMessage, 'system');
            console.info(`-- SCRIPT SQL PARA CORREGIR RLS EN 'usuarios' --
-- 1. Habilitar RLS
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
-- 2. Permitir a los usuarios leer su propio perfil
CREATE POLICY "Users can read their own profile" ON public.usuarios FOR SELECT USING (auth.uid() = id);
-- 3. Permitir a los usuarios actualizar su propio perfil
CREATE POLICY "Users can update their own profile" ON public.usuarios FOR UPDATE USING (auth.uid() = id);`);
            
            // Fallback to a default user object to avoid crashing the app
            setCurrentUser({
                id: session.user.id,
                email: session.user.email || '',
                firstName: session.user.user_metadata?.firstName || 'Usuario',
                lastName: session.user.user_metadata?.lastName || '',
                career: session.user.user_metadata?.career || 'Educación Parvularia',
                score: 0,
                unlockedAchievements: {},
            });

        } else if (dbProfile) {
            setCurrentUser({
                id: session.user.id,
                email: session.user.email || '',
                firstName: dbProfile.firstName || 'Explorador',
                lastName: dbProfile.lastName || '',
                career: dbProfile.career || 'Educación Parvularia',
                score: dbProfile.score ?? 0,
                unlockedAchievements: dbProfile.unlockedAchievements || {},
            });
        } else {
            console.warn(`No DB profile for ${session.user.id}. Using base profile.`);
            setCurrentUser({
                id: session.user.id,
                email: session.user.email || '',
                firstName: session.user.user_metadata?.firstName || 'Explorador',
                lastName: session.user.user_metadata?.lastName || '',
                career: session.user.user_metadata?.career || 'Educación Parvularia',
                score: 0,
                unlockedAchievements: {},
            });
        }
    } catch (e: any) {
        console.error("A critical error occurred while fetching user profile:", e.message);
        setCurrentUser(null);
    }
  }, []);
  
  
  // Fetch user's completed activities from performance logs when user changes
  React.useEffect(() => {
    const fetchCompletedActivities = async () => {
        if (!supabase || !currentUser) {
            setCompletedActivities(new Set());
            return;
        }

        const { data, error } = await supabase
            .from('performance_logs')
            .select('level_name')
            .eq('user_id', currentUser.id);

        if (error) {
            console.error("Error fetching completed activities:", error.message);
        } else {
            const completedSet = new Set(data.map(log => log.level_name));
            setCompletedActivities(completedSet);
        }
    };

    fetchCompletedActivities();
  }, [currentUser]);


  React.useEffect(() => {
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          fetchUserProfile(session);
        } else {
          setCurrentUser(null);
        }
      });

      return () => {
        subscription?.unsubscribe();
      };
    }
  }, [fetchUserProfile]);

  // Announce user presence when logged in
  React.useEffect(() => {
    if (!supabase || !currentUser) return;

    const channel: RealtimeChannel = supabase.channel('online-users', {
      config: {
        presence: {
          key: currentUser.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        channel.track({ user_id: currentUser.id, name: currentUser.firstName });
      })
      .subscribe();

    // Cleanup function to untrack user on component unmount or user change
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser]); // This effect depends on the current user


  React.useEffect(() => {
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
  
  React.useEffect(() => {
    const logKey = currentUser ? `activityLog_${currentUser.id}` : 'activityLog_guest';
    if (activityLog.length > 0) {
      localStorage.setItem(logKey, JSON.stringify(activityLog));
    }
  }, [activityLog, currentUser]);

  React.useEffect(() => {
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

    // FIX: The original error was that logActivity was called with 3 arguments,
    // but the prop type in child components only expected 2. While the fix is in
    // the child components' prop types, this is the call that triggered the error.
    // FIX: Modified the call to use 2 arguments to resolve the type error.
    // The points are now included in the message to preserve the information.
    logActivity(`${message} (+${points} puntos)`, 'win');

    const newScore = (currentUser.score || 0) + points;
    
    const { error } = await supabase
      .from('usuarios')
      .update({ score: newScore })
      .eq('id', currentUser.id);

    if (error) {
      console.error("Error updating score:", error.message);
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
    
    const { error } = await supabase
      .from('usuarios')
      .update({ unlockedAchievements: newUnlocked })
      .eq('id', currentUser.id);

    if (error) {
        console.error("Error unlocking achievement:", error.message);
    } else {
        setCurrentUser(prev => prev ? { ...prev, unlockedAchievements: newUnlocked } : null);
    }

    const newNotification: Notification = {
      id: Date.now(),
      message: `¡Logro desbloqueado: ${achievement.name}!`,
      achievementId: achievement.id,
    };
    setNotifications(prev => [...prev, newNotification]);
    logActivity(`Logro desbloqueado: ${achievement.name}`, 'achievement');
  };
  
    const logPerformance = async (data: Omit<PerformanceLog, 'user_id' | 'id' | 'created_at'>) => {
        if (!supabase || !currentUser) return;

        const { error } = await supabase.from('performance_logs').insert([
            { ...data, user_id: currentUser.id }
        ]);

        if (error) {
            console.error("Error logging performance data:", error.message);
            const userFriendlyError = `Error al guardar tu progreso. Esto puede deberse a un problema con las Políticas de Seguridad (RLS) en tu tabla 'performance_logs'. Por favor, verifica tu configuración en Supabase. Error: ${error.message}`;
            logActivity(userFriendlyError, 'system');

             if (error.message.includes('Could not find the table')) {
                console.error("Error al registrar rendimiento: La tabla 'performance_logs' no existe en la base de datos. Por favor, créala usando el Editor SQL de Supabase para activar el Plan de Refuerzo.");
            }
        } else {
            // FIX: Corrected property access from `data.levelName` to `data.level_name` to match the PerformanceLog type.
            logActivity(`Progreso del nivel '${data.level_name}' guardado correctamente.`, 'system');
            // Optimistically update the completed set for immediate UI feedback
            setCompletedActivities(prev => new Set(prev).add(data.level_name));
        }
    };

    const handleOpenDashboard = async () => {
        setIsMenuOpen(false);
        if (!supabase || !currentUser) return;

        setIsFetchingDashboard(true);
        logActivity('Cargando Panel de Desempeño...', 'system');

        const { data, error } = await supabase
            .from('performance_logs')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching performance logs:", error.message);
            const rlsErrorMessage = `Error al obtener datos de desempeño. Revisa que la tabla 'performance_logs' exista y que las políticas de seguridad (RLS) permitan la lectura (SELECT). Error: ${error.message}`;
            logActivity(rlsErrorMessage, 'system');
            setIsFetchingDashboard(false);
            return;
        }

        // We now always open the dashboard and let the component decide what to show.
        setDashboardLogs(data as PerformanceLog[] ?? []);
        setShowPerformanceDashboard(true);
        setIsFetchingDashboard(false);
    };
  
  const handleStartGame = (game: Game) => {
    setIntroGameKey(null);
    setActiveGame(game);
    const gameNameMap: Record<Game, string> = {
      'matching': 'Juego de Parejas',
      'odd-one-out': 'El Duende Despistado',
      'venn-diagram': 'El Cruce Mágico',
      'treasure-sort': 'El Baúl de los Tesoros',
      'hidden-step': 'El Peldaño Escondido',
      'color-snake': 'La Serpiente de Colores',
      'home': 'Inicio',
      'classification-games': 'Juegos de Clasificación',
      'classification': 'Clasificación',
      'achievements': 'Logros',
      'inventory': 'Inventario',
      'seriation-games': 'Juegos de Seriación',
      'seriation': 'Seriación',
    };
    if (gameNameMap[game]) {
      logActivity(`Iniciado ${gameNameMap[game]}`, 'game');
    }
  };

   const handleStartSeriationGame = (challengeType: SeriationChallengeType) => {
      setIntroGameKey(null);
      setActiveSeriationChallenge(challengeType);
      setActiveGame('seriation');
      const gameNameMap: Record<SeriationChallengeType, string> = {
          'ascending': 'La Escalera Creciente',
          'descending': 'La Escalera Inversa',
          'abc-pattern': 'El Muro Tricolor',
          'growth-pattern': 'Saltos de Gigante',
      };
      logActivity(`Iniciado ${gameNameMap[challengeType]}`, 'game');
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
        id: 'classification_expert',
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
    setShowLogoutConfirm(false);
    if (!supabase) return;

    logActivity('Cerrando sesión...', 'system');
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error("Error signing out:", error.message);
      logActivity(`Error al intentar cerrar sesión: ${error.message}`, 'system');
    }
    navigate('home');
  };
  
  const handleClearData = () => {
    setIsMenuOpen(false);
    setShowClearDataConfirm(true);
  };
  
  const confirmClearData = async () => {
    if (!supabase || !currentUser) return;

    // 1. Attempt to delete all performance logs.
    const { error: deleteError } = await supabase
        .from('performance_logs')
        .delete()
        .eq('user_id', currentUser.id);

    if (deleteError) {
        console.error("Error clearing performance logs:", deleteError.message);
        const rlsErrorMessage = `Error al limpiar historial. Esto se debe a que falta un permiso en la base de datos (RLS) para 'DELETE' en la tabla 'performance_logs'. Revisa la consola para obtener el script SQL de corrección.`;
        logActivity(rlsErrorMessage, 'system');
        console.info(`-- SCRIPT SQL PARA CORREGIR PERMISO DE BORRADO --
-- 1. Habilitar RLS (si no lo está ya)
ALTER TABLE public.performance_logs ENABLE ROW LEVEL SECURITY;
-- 2. Permitir a los usuarios borrar sus propios registros
DROP POLICY IF EXISTS "Allow users to delete their own logs" ON public.performance_logs;
CREATE POLICY "Allow users to delete their own logs" ON public.performance_logs FOR DELETE USING (auth.uid() = user_id);`);
        setShowClearDataConfirm(false);
        return;
    }

    // 2. Reset the user's main profile (score and achievements).
    const clearedProfile = {
        score: 0,
        unlockedAchievements: {},
    };

    const { error: updateError } = await supabase
      .from('usuarios')
      .update(clearedProfile)
      .eq('id', currentUser.id);

    if (updateError) {
      console.error("Error clearing user profile data:", updateError.message);
      logActivity(`Error al reiniciar el perfil: ${updateError.message}`, 'system');
    } else {
      // 3. Update local state to reflect the changes immediately.
      setCurrentUser(prev => prev ? { ...prev, ...clearedProfile } : null);
      setCompletedActivities(new Set()); // Also clear local completed activities
    }
    
    // 4. Clear the local activity log from localStorage.
    const logKey = `activityLog_${currentUser.id}`;
    localStorage.removeItem(logKey);

    // 5. Reset the activity log in the state with a fresh welcome message.
    const welcomeMessage: ActivityLogEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      message: '¡Datos limpiados! Empezando una nueva aventura en el Bosque Mágico.',
      type: 'system',
      seen: true,
    };
    setActivityLog([welcomeMessage]);
    
    // 6. Finalize UI changes.
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
    'treasure-sort': {
      title: "El Baúl de los Tesoros",
      story: "¡Una ardilla ha encontrado un baúl lleno de tesoros de los duendes! Hay botones, cucharas y calcetines. ¡Pero está todo mezclado! ¿Puedes ayudarla a ordenarlo todo?",
      instructions: "Primero, elige cómo quieres ordenar los tesoros usando los botones de arriba. ¿Por color? ¿Por tipo? Luego, arrastra cada tesoro a su caja correcta. ¡Puedes cambiar la regla cuando quieras para un nuevo desafío!",
      buttonText: "¡A ordenar!",
      Icon: TreasureChestIcon,
      theme: { text: 'text-stone-800', buttonBg: 'bg-stone-500', buttonHoverBg: 'hover:bg-stone-600', iconText: 'text-stone-500', bg: 'bg-stone-50', audioHover: 'hover:bg-stone-100', audioText: 'text-stone-700' },
      onStart: () => handleStartGame('treasure-sort'),
    },
    'seriation_ascending': {
      title: "La Escalera Creciente",
      story: "¡Vamos a construir una escalera para que los duendes puedan subir a los árboles! Tenemos que ordenar las regletas de la más pequeña a la más grande.",
      instructions: "Observa la secuencia de regletas. Continúa la escalera arrastrando las dos siguientes regletas en orden de tamaño a los espacios vacíos. ¡Construyamos hacia arriba!",
      buttonText: "¡A construir!",
      Icon: StairsIcon,
      theme: { text: 'text-sky-800', buttonBg: 'bg-sky-500', buttonHoverBg: 'hover:bg-sky-600', iconText: 'text-sky-500', bg: 'bg-sky-50', audioHover: 'hover:bg-sky-100', audioText: 'text-sky-700' },
      onStart: () => handleStartSeriationGame('ascending'),
    },
    'seriation_descending': {
      title: "La Escalera Inversa",
      story: "¡Ahora bajemos de los árboles! Para eso, necesitamos construir una escalera que vaya desde la regleta más grande hasta la más pequeña.",
      instructions: "Observa la secuencia de regletas. Continúa la escalera arrastrando las dos siguientes regletas en orden de tamaño, pero esta vez ¡hacia abajo!",
      buttonText: "¡Vamos a bajar!",
      Icon: StairsIcon,
      theme: { text: 'text-indigo-800', buttonBg: 'bg-indigo-500', buttonHoverBg: 'hover:bg-indigo-600', iconText: 'text-indigo-500', bg: 'bg-indigo-50', audioHover: 'hover:bg-indigo-100', audioText: 'text-indigo-700' },
      onStart: () => handleStartSeriationGame('descending'),
    },
    'seriation_abc': {
      title: "El Muro Tricolor",
      story: "Los duendes están decorando el bosque con un muro de colores que se repiten. ¡Han empezado un patrón, pero necesitan tu ayuda para continuarlo!",
      instructions: "Observa la secuencia de regletas. Encuentra el patrón de tres que se repite (ABC, ABC...). Luego, arrastra las dos regletas que siguen en la secuencia a los espacios vacíos.",
      buttonText: "¡A decorar!",
      Icon: CuisenaireIcon,
      theme: { text: 'text-rose-800', buttonBg: 'bg-rose-500', buttonHoverBg: 'hover:bg-rose-600', iconText: 'text-rose-500', bg: 'bg-rose-50', audioHover: 'hover:bg-rose-100', audioText: 'text-rose-700' },
      onStart: () => handleStartSeriationGame('abc-pattern'),
    },
    'seriation_growth': {
      title: "Saltos de Gigante",
      story: "¡Un gigante ha dejado sus huellas en el bosque! Sus pasos no son de uno en uno, sino que dan grandes saltos. ¿Puedes adivinar cómo salta?",
      instructions: "Mira las regletas. No crecen de uno en uno. Descubre la regla (por ejemplo, 'de dos en dos') y arrastra las siguientes dos regletas que continúan el patrón de saltos.",
      buttonText: "¡A saltar!",
      Icon: CuisenaireIcon,
      theme: { text: 'text-emerald-800', buttonBg: 'bg-emerald-500', buttonHoverBg: 'hover:bg-emerald-600', iconText: 'text-emerald-500', bg: 'bg-emerald-50', audioHover: 'hover:bg-emerald-100', audioText: 'text-emerald-700' },
      onStart: () => handleStartSeriationGame('growth-pattern'),
    },
    'seriation_hidden_step': {
      title: "El Peldaño Escondido",
      story: "¡Oh, no! Mientras construían una escalera, los duendes se han dado cuenta de que falta un peldaño justo en el medio. ¿Puedes ayudarlos a encontrar la pieza que encaja perfectamente?",
      instructions: "Observa con mucha atención la secuencia de la escalera. Fíjate en las piezas de antes y después del hueco para descubrir cuál falta. ¡Arrastra la regleta correcta al espacio vacío!",
      buttonText: "¡A reparar!",
      Icon: StairsIcon,
      theme: { text: 'text-orange-800', buttonBg: 'bg-orange-500', buttonHoverBg: 'hover:bg-orange-600', iconText: 'text-orange-500', bg: 'bg-orange-50', audioHover: 'hover:bg-orange-100', audioText: 'text-orange-700' },
      onStart: () => handleStartGame('hidden-step'),
    },
    'seriation_color_snake': {
      title: "La Serpiente de Colores",
      story: "Una serpiente mágica está creciendo en el bosque, ¡pero necesita tu ayuda para completar su patrón de colores! Su cuerpo sigue una secuencia especial.",
      instructions: "Descubre el patrón de colores de la serpiente (puede ser AAB, AABB...). Luego, arrastra los siguientes dos segmentos para ayudarla a crecer. ¡Hazla tan larga como puedas!",
      buttonText: "¡A crecer!",
      Icon: SnakeIcon,
      theme: { text: 'text-purple-800', buttonBg: 'bg-purple-500', buttonHoverBg: 'hover:bg-purple-600', iconText: 'text-purple-500', bg: 'bg-purple-50', audioHover: 'hover:bg-purple-100', audioText: 'text-purple-700' },
      onStart: () => handleStartGame('color-snake'),
    },
  };

  const renderGame = () => {
    switch (activeGame) {
      case 'classification':
        return currentLevel && <ClassificationGame gameLevel={currentLevel} onGoHome={handleChooseClassificationLevelAgain} onUnlockAchievement={unlockAchievement} logActivity={logActivity} addScore={addScore} completedActivities={completedActivities} logPerformance={logPerformance} />;
      case 'matching':
        return <MatchingGame onGoHome={() => setActiveGame('classification-games')} onUnlockAchievement={unlockAchievement} logActivity={logActivity} addScore={addScore} completedActivities={completedActivities} logPerformance={logPerformance} />;
      case 'odd-one-out':
        return <OddOneOutGame onGoHome={() => setActiveGame('classification-games')} onUnlockAchievement={unlockAchievement} logActivity={logActivity} addScore={addScore} completedActivities={completedActivities} logPerformance={logPerformance} />;
      case 'venn-diagram':
        return <VennDiagramGame onGoHome={() => setActiveGame('classification-games')} onUnlockAchievement={unlockAchievement} logActivity={logActivity} addScore={addScore} completedActivities={completedActivities} logPerformance={logPerformance} />;
      case 'inventory':
          return currentInventoryLevel && <InventoryGame difficulty={currentInventoryLevel} onGoHome={handleChooseInventoryLevelAgain} onUnlockAchievement={unlockAchievement} logActivity={logActivity} addScore={addScore} completedActivities={completedActivities} logPerformance={logPerformance} />;
      case 'treasure-sort':
          return <TreasureSortGame onGoHome={() => setActiveGame('classification-games')} onUnlockAchievement={unlockAchievement} logActivity={logActivity} addScore={addScore} completedActivities={completedActivities} logPerformance={logPerformance} />;
      case 'seriation':
        return activeSeriationChallenge && <SeriationGame challengeType={activeSeriationChallenge} onGoHome={() => setActiveGame('seriation-games')} onUnlockAchievement={unlockAchievement} logActivity={logActivity} addScore={addScore} completedActivities={completedActivities} logPerformance={logPerformance} />;
      case 'hidden-step':
        return <HiddenStepGame onGoHome={() => setActiveGame('seriation-games')} onUnlockAchievement={unlockAchievement} logActivity={logActivity} addScore={addScore} completedActivities={completedActivities} logPerformance={logPerformance} />;
      case 'color-snake':
        return <ColorSnakeGame onGoHome={() => setActiveGame('seriation-games')} onUnlockAchievement={unlockAchievement} logActivity={logActivity} addScore={addScore} completedActivities={completedActivities} logPerformance={logPerformance} />;
      case 'achievements':
        return <Achievements unlockedAchievements={currentUser?.unlockedAchievements || {}} />;
      case 'seriation-games':
        const isAscendingCompleted = completedActivities.has('seriation_ascending');
        const isDescendingCompleted = completedActivities.has('seriation_descending');
        const isAbcCompleted = completedActivities.has('seriation_abc-pattern');
        const isGrowthCompleted = completedActivities.has('seriation_growth-pattern');
        const isHiddenStepCompleted = completedActivities.has('hidden_step_game');
        const isColorSnakeCompleted = completedActivities.has('color_snake_game');
        return (
          <div className="flex flex-col items-center justify-center h-full text-center">
             <h1 className="text-5xl font-bold text-sky-700 mb-4">Juegos de Seriación</h1>
             <p className="text-xl text-slate-600 max-w-2xl md:max-w-4xl mb-12">¡Aprende a ordenar objetos en secuencias lógicas!</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <button onClick={() => setIntroGameKey('seriation_ascending')} className={`relative px-8 py-4 text-white rounded-xl shadow-lg transition-transform transform hover:scale-105 ${isAscendingCompleted ? 'bg-slate-400 hover:bg-slate-500' : 'bg-sky-400 hover:bg-sky-500'}`}>
                  {isAscendingCompleted && <CheckCircleIcon className="absolute top-2 right-2 w-6 h-6 text-white/80" />}
                  <div className="flex items-center justify-center gap-3">
                    <StairsIcon className="w-7 h-7" />
                    <span className="font-bold">La Escalera Creciente</span>
                  </div>
              </button>
               <button onClick={() => setIntroGameKey('seriation_descending')} className={`relative px-8 py-4 text-white rounded-xl shadow-lg transition-transform transform hover:scale-105 ${isDescendingCompleted ? 'bg-slate-400 hover:bg-slate-500' : 'bg-indigo-400 hover:bg-indigo-500'}`}>
                  {isDescendingCompleted && <CheckCircleIcon className="absolute top-2 right-2 w-6 h-6 text-white/80" />}
                  <div className="flex items-center justify-center gap-3">
                    <StairsIcon className="w-7 h-7" />
                    <span className="font-bold">La Escalera Inversa</span>
                  </div>
              </button>
               <button onClick={() => setIntroGameKey('seriation_abc')} className={`relative px-8 py-4 text-white rounded-xl shadow-lg transition-transform transform hover:scale-105 ${isAbcCompleted ? 'bg-slate-400 hover:bg-slate-500' : 'bg-rose-400 hover:bg-rose-500'}`}>
                  {isAbcCompleted && <CheckCircleIcon className="absolute top-2 right-2 w-6 h-6 text-white/80" />}
                  <div className="flex items-center justify-center gap-3">
                    <CuisenaireIcon className="w-7 h-7" />
                    <span className="font-bold">El Muro Tricolor</span>
                  </div>
              </button>
              <button onClick={() => setIntroGameKey('seriation_growth')} className={`relative px-8 py-4 text-white rounded-xl shadow-lg transition-transform transform hover:scale-105 ${isGrowthCompleted ? 'bg-slate-400 hover:bg-slate-500' : 'bg-emerald-400 hover:bg-emerald-500'}`}>
                  {isGrowthCompleted && <CheckCircleIcon className="absolute top-2 right-2 w-6 h-6 text-white/80" />}
                  <div className="flex items-center justify-center gap-3">
                    <CuisenaireIcon className="w-7 h-7" />
                    <span className="font-bold">Saltos de Gigante</span>
                  </div>
              </button>
               <button onClick={() => setIntroGameKey('seriation_hidden_step')} className={`relative px-8 py-4 text-white rounded-xl shadow-lg transition-transform transform hover:scale-105 ${isHiddenStepCompleted ? 'bg-slate-400 hover:bg-slate-500' : 'bg-orange-400 hover:bg-orange-500'}`}>
                  {isHiddenStepCompleted && <CheckCircleIcon className="absolute top-2 right-2 w-6 h-6 text-white/80" />}
                  <div className="flex items-center justify-center gap-3">
                    <StairsIcon className="w-7 h-7" />
                    <span className="font-bold">El Peldaño Escondido</span>
                  </div>
              </button>
               <button onClick={() => setIntroGameKey('seriation_color_snake')} className={`relative px-8 py-4 text-white rounded-xl shadow-lg transition-transform transform hover:scale-105 ${isColorSnakeCompleted ? 'bg-slate-400 hover:bg-slate-500' : 'bg-purple-400 hover:bg-purple-500'}`}>
                  {isColorSnakeCompleted && <CheckCircleIcon className="absolute top-2 right-2 w-6 h-6 text-white/80" />}
                  <div className="flex items-center justify-center gap-3">
                    <SnakeIcon className="w-7 h-7" />
                    <span className="font-bold">La Serpiente de Colores</span>
                  </div>
              </button>
            </div>
          </div>
        );
      case 'classification-games':
        const welcomeTitle = "Juegos de Clasificación";
        const welcomeText = "¡Ayuda a los duendes a ordenar sus figuras mágicas usando diferentes reglas!";
        
        const isMatchingCompleted = completedActivities.has('matching_game');
        const isOddOneOutCompleted = completedActivities.has('odd_one_out_game');
        const isVennCompleted = completedActivities.has('venn_diagram');
        const isTreasureSortCompleted = completedActivities.has('treasure_sort_game');

        return (
          <div className="flex flex-col items-center justify-center h-full text-center">
             <h1 className="text-5xl font-bold text-sky-700 mb-4">{welcomeTitle}</h1>
             <p className="text-xl text-slate-600 max-w-2xl md:max-w-4xl mb-12">{welcomeText}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <button
                onClick={() => setIntroGameKey('matching')}
                className={`relative px-8 py-4 text-white rounded-xl shadow-lg transition-transform transform hover:scale-105 ${
                    isMatchingCompleted
                    ? 'bg-slate-400 hover:bg-slate-500'
                    : 'bg-amber-400 hover:bg-amber-500'
                }`}
              >
                {isMatchingCompleted && <CheckCircleIcon className="absolute top-2 right-2 w-6 h-6 text-white/80" />}
                <div className="flex items-center justify-center gap-3">
                  <PairsIcon className="w-7 h-7" />
                  <span className="font-bold">Juego de Parejas</span>
                </div>
                <span className="block text-sm font-normal opacity-90 mt-1">1 Nivel</span>
              </button>
              <button
                onClick={() => setIntroGameKey('odd-one-out')}
                className={`relative px-8 py-4 text-white rounded-xl shadow-lg transition-transform transform hover:scale-105 ${
                    isOddOneOutCompleted
                    ? 'bg-slate-400 hover:bg-slate-500'
                    : 'bg-teal-400 hover:bg-teal-500'
                }`}
              >
                {isOddOneOutCompleted && <CheckCircleIcon className="absolute top-2 right-2 w-6 h-6 text-white/80" />}
                <div className="flex items-center justify-center gap-3">
                  <MagnifyingGlassIcon className="w-7 h-7" />
                  <span className="font-bold">El Duende Despistado</span>
                </div>
                <span className="block text-sm font-normal opacity-90 mt-1">1 Nivel</span>
              </button>
              <button
                onClick={() => setIntroGameKey('venn-diagram')}
                className={`relative px-8 py-4 text-white rounded-xl shadow-lg transition-transform transform hover:scale-105 ${
                    isVennCompleted
                    ? 'bg-slate-400 hover:bg-slate-500'
                    : 'bg-cyan-400 hover:bg-cyan-500'
                }`}
              >
                {isVennCompleted && <CheckCircleIcon className="absolute top-2 right-2 w-6 h-6 text-white/80" />}
                <div className="flex items-center justify-center gap-3">
                  <VennDiagramIcon className="w-7 h-7" />
                  <span className="font-bold">El Cruce Mágico</span>
                </div>
                <span className="block text-sm font-normal opacity-90 mt-1">1 Nivel</span>
              </button>
              <button
                onClick={() => setIntroGameKey('inventory')}
                className="relative px-8 py-4 bg-lime-500 text-white rounded-xl shadow-lg transition-transform transform hover:scale-105 hover:bg-lime-600"
              >
                <div className="flex items-center justify-center gap-3">
                  <ClipboardListIcon className="w-7 h-7" />
                  <span className="font-bold">El Inventario del Duende</span>
                </div>
                <span className="block text-sm font-normal opacity-90 mt-1">3 Niveles</span>
              </button>
              <button
                onClick={() => setShowClassificationModal(true)}
                className="relative px-8 py-4 bg-rose-400 text-white rounded-xl shadow-lg transition-transform transform hover:scale-105 hover:bg-rose-500"
              >
                <div className="flex items-center justify-center gap-3">
                  <ClassificationIcon className="w-7 h-7" />
                  <span className="font-bold">Bloques Lógicos</span>
                </div>
                <span className="block text-sm font-normal opacity-90 mt-1">4 Niveles + Experto</span>
              </button>
               <button
                onClick={() => setIntroGameKey('treasure-sort')}
                className={`relative px-8 py-4 text-white rounded-xl shadow-lg transition-transform transform hover:scale-105 ${
                    isTreasureSortCompleted
                    ? 'bg-slate-400 hover:bg-slate-500'
                    : 'bg-stone-400 hover:bg-stone-500'
                }`}
              >
                {isTreasureSortCompleted && <CheckCircleIcon className="absolute top-2 right-2 w-6 h-6 text-white/80" />}
                <div className="flex items-center justify-center gap-3">
                  <TreasureChestIcon className="w-7 h-7" />
                  <span className="font-bold">El Baúl de los Tesoros</span>
                </div>
                <span className="block text-sm font-normal opacity-90 mt-1">Niveles Dinámicos</span>
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
                <div 
                    onClick={() => setActiveGame('classification-games')}
                    className="p-8 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer"
                >
                    <h2 className="text-3xl font-bold text-rose-600 mb-3">Clasificación</h2>
                    <p className="text-slate-600">Aprende a agrupar objetos por sus características como color, forma y tamaño.</p>
                </div>
                 <div
                    onClick={() => setActiveGame('seriation-games')}
                    className="p-8 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer"
                 >
                    <h2 className="text-3xl font-bold text-sky-600 mb-3">Seriación</h2>
                    <p className="text-slate-600">Ordena objetos en una secuencia lógica, como del más pequeño al más grande.</p>
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

  let isCurrentIntroGameCompleted = false;
  if (introGameKey) {
      if (introGameKey === 'matching') isCurrentIntroGameCompleted = completedActivities.has('matching_game');
      if (introGameKey === 'odd-one-out') isCurrentIntroGameCompleted = completedActivities.has('odd_one_out_game');
      if (introGameKey === 'venn-diagram') isCurrentIntroGameCompleted = completedActivities.has('venn_diagram');
  }

  return (
    <div className="min-h-screen bg-sky-50 text-slate-800 p-4 md:p-8 relative isolate">
       <div 
        className="absolute inset-0 bg-cover bg-center -z-10 opacity-20" 
        style={{ 
          backgroundImage: "url('https://raw.githubusercontent.com/vdhuerta/assets-aplications/main/generated-image%20(15).jpg')",
        }}
      ></div>
       {isFetchingDashboard && (
            <div className="fixed inset-0 bg-slate-800 bg-opacity-60 flex flex-col items-center justify-center z-[100] text-white">
                <svg className="animate-spin h-10 w-10 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-xl font-semibold">Analizando datos de desempeño...</p>
            </div>
        )}
      <NotificationContainer notifications={notifications} setNotifications={setNotifications} />
      <header className="w-full flex justify-between items-center pb-4">
        <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('home')}
              className="p-3 bg-white text-slate-700 rounded-full shadow-sm hover:bg-sky-100 transition"
              aria-label="Ir a la página de inicio"
              title="Ir a la página de inicio"
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
              onClick={() => setShowAdminPanel(true)}
              className="p-3 bg-white text-slate-700 rounded-full shadow-sm hover:bg-sky-100 transition"
              aria-label="Panel de Administrador"
              title="Panel de Administrador"
            >
              <CogIcon />
            </button>
            <button
              onClick={() => setShowTeachersGuide(true)}
              className="p-3 bg-white text-slate-700 rounded-full shadow-sm hover:bg-sky-100 transition"
              aria-label="Guía para Profesores"
              title="Guía para Profesores"
            >
              <BookOpenIcon />
            </button>
            <button
              onClick={() => setShowAddToHomeScreenModal(true)}
              className="p-3 bg-white text-slate-700 rounded-full shadow-sm hover:bg-sky-100 transition"
              aria-label="Instalar en tu dispositivo"
              title="Instalar en tu dispositivo"
            >
              <InstallIcon />
            </button>
             <button
              onClick={handleOpenLog}
              className="relative p-3 bg-white text-slate-700 rounded-full shadow-sm hover:bg-sky-100 transition"
              aria-label="Registro de actividad"
              title="Registro de actividad"
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
                    title="Cerrar sesión"
                >
                    <LogoutIcon />
                </button>
            ) : (
                <button
                    onClick={() => handleOpenAuthModal('login')}
                    className="p-3 bg-white text-slate-700 rounded-full shadow-sm hover:bg-sky-100 transition"
                    aria-label="Iniciar sesión o crear cuenta"
                    title="Iniciar sesión o crear cuenta"
                >
                    <UserIcon />
                </button>
            )}
            <div className="relative">
              <button
                  onClick={() => setIsMenuOpen(prev => !prev)}
                  className="p-3 bg-white rounded-full shadow-md hover:bg-sky-100 transition"
                  aria-label="Abrir menú"
                  title="Abrir menú"
              >
                  <HamburgerMenuIcon />
              </button>
              {isMenuOpen && <React.Suspense fallback={null}><Menu onNavigate={navigate} onClearData={handleClearData} user={currentUser} onOpenDashboard={handleOpenDashboard} /></React.Suspense>}
            </div>
        </div>
      </header>
      <div className="w-full border-b-2 border-sky-300 mb-6"></div>
      <main className="w-full h-[calc(100vh-140px)]">
        <React.Suspense fallback={<GameLoading />}>
          {renderGame()}
        </React.Suspense>
      </main>
      {showClassificationModal && (
        <React.Suspense fallback={null}>
          <ClassificationLevelModal 
            onSelectLevel={handleSelectLevel}
            onStartExpertLevel={handleStartExpertLevel}
            onClose={() => setShowClassificationModal(false)}
            completedLevels={completedActivities}
            user={currentUser}
          />
        </React.Suspense>
      )}
      {currentIntroContent && (
        <React.Suspense fallback={null}>
          <GameIntroModal
            {...currentIntroContent}
            isCompleted={isCurrentIntroGameCompleted}
            onClose={() => setIntroGameKey(null)}
          />
        </React.Suspense>
      )}
      {showInventoryLevelModal && (
        <React.Suspense fallback={null}>
          <InventoryLevelModal
            onSelectLevel={handleSelectInventoryLevel}
            onClose={() => setShowInventoryLevelModal(false)}
            completedLevels={completedActivities}
            user={currentUser}
          />
        </React.Suspense>
      )}
      {showTeachersGuide && (
        <React.Suspense fallback={null}>
          <TeachersGuide onClose={() => setShowTeachersGuide(false)} />
        </React.Suspense>
      )}
      <React.Suspense fallback={null}>
        <NotificationsLog
          isOpen={isLogOpen}
          onClose={() => setIsLogOpen(false)}
          logs={activityLog}
          onClear={handleClearLog}
        />
      </React.Suspense>
      {showRegistrationModal && (
        <React.Suspense fallback={null}>
          <RegistrationModal
            onClose={() => setShowRegistrationModal(false)}
            logActivity={logActivity}
            initialView={initialModalView}
          />
        </React.Suspense>
      )}
      {showLogoutConfirm && (
        <React.Suspense fallback={null}>
          <LogoutConfirmationModal
            onConfirm={confirmLogout}
            onCancel={() => setShowLogoutConfirm(false)}
          />
        </React.Suspense>
      )}
      {showClearDataConfirm && (
        <React.Suspense fallback={null}>
          <ClearDataConfirmationModal
            onConfirm={confirmClearData}
            onCancel={() => setShowClearDataConfirm(false)}
          />
        </React.Suspense>
      )}
      {showAddToHomeScreenModal && (
        <React.Suspense fallback={null}>
          <AddToHomeScreenModal onClose={() => setShowAddToHomeScreenModal(false)} />
        </React.Suspense>
      )}
      {showRanking && (
        <React.Suspense fallback={null}>
          <Ranking
            users={allUsers}
            currentUser={currentUser}
            onClose={() => setShowRanking(false)}
          />
        </React.Suspense>
      )}
      {showPerformanceDashboard && (
            <React.Suspense fallback={null}>
                <PerformanceDashboard
                    isOpen={showPerformanceDashboard}
                    onClose={() => setShowPerformanceDashboard(false)}
                    user={currentUser}
                    performanceLogs={dashboardLogs}
                />
            </React.Suspense>
        )}
       {showAdminPanel && (
          <React.Suspense fallback={null}>
              <AdminPanel onClose={() => setShowAdminPanel(false)} />
          </React.Suspense>
       )}
    </div>
  );
};

export default App;
