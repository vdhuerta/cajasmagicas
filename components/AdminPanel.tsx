import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { UserProfile, PerformanceLog } from '../types';
import * as adminService from '../services/adminService';
import AdminPasswordModal from './AdminPasswordModal';
import UserDetailsModal from './UserDetailsModal';
import EditUserModal from './EditUserModal';
import { CloseIcon } from './icons/CloseIcon';
import { CogIcon } from './icons/CogIcon';
import PencilIcon from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';
import EnvelopeIcon from './icons/EnvelopeIcon';
import UserGroupIcon from './icons/UserGroupIcon';
import { TrendingUpIcon } from './icons/TrendingUpIcon';
import CalculatorIcon from './icons/CalculatorIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { MagnifyingGlassIcon } from './icons/MagnifyingGlassIcon';

const EmailUserModal = lazy(() => import('./EmailUserModal'));

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; children?: React.ReactNode }> = ({ title, value, icon, children }) => (
    <div className="bg-white p-4 rounded-lg shadow-md border flex flex-col">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm font-semibold text-slate-500">{title}</p>
                <p className="text-3xl font-bold text-sky-800">{value}</p>
            </div>
            <div className="p-2 bg-sky-100 rounded-lg text-sky-600">{icon}</div>
        </div>
        {children && <div className="mt-2 text-sm text-slate-600 flex-grow">{children}</div>}
    </div>
);


interface AdminPanelProps {
    onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [allLogs, setAllLogs] = useState<{ user_id: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [detailsModalUser, setDetailsModalUser] = useState<UserProfile | null>(null);
    const [editModalUser, setEditModalUser] = useState<UserProfile | null>(null);
    const [deleteConfirmUser, setDeleteConfirmUser] = useState<UserProfile | null>(null);
    const [emailModalUser, setEmailModalUser] = useState<UserProfile | null>(null);

    useEffect(() => {
        if (isAuthenticated) {
            fetchData();
        }
    }, [isAuthenticated]);

    const fetchData = async () => {
        setIsLoading(true);
        setError('');
        try {
            const { users: fetchedUsers, logs: fetchedLogs } = await adminService.getDashboardData();
            setUsers(fetchedUsers.sort((a, b) => a.firstName.localeCompare(b.firstName)));
            setAllLogs(fetchedLogs || []); // Handle null case if logs table is empty
        } catch (err: any) {
            setError(`Error al cargar datos: ${err.message}. Revisa la configuración de la función Netlify.`);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const dashboardStats = useMemo(() => {
        if (!users.length) return null;

        const activeUserIds = new Set(allLogs.map(log => log.user_id));
        const activeUsers = users.filter(u => activeUserIds.has(u.id)).length;

        const byCareer = users.reduce((acc, user) => {
            acc[user.career] = (acc[user.career] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const bySection = users.reduce((acc, user) => {
            const section = user.section || 'Sin sección';
            acc[section] = (acc[section] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        const totalScore = users.reduce((sum, u) => sum + u.score, 0);
        const averageScore = users.length > 0 ? Math.round(totalScore / users.length) : 0;

        return {
            total: users.length,
            active: activeUsers,
            inactive: users.length - activeUsers,
            byCareer,
            bySection,
            averageScore
        };
    }, [users, allLogs]);

    const handleSaveSuccess = (updatedUser: UserProfile) => {
        setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
        if (selectedUser?.id === updatedUser.id) {
            setSelectedUser(updatedUser);
        }
        setSuccessMessage('Usuario actualizado correctamente.');
        setTimeout(() => setSuccessMessage(''), 3000);
    };
    
    const handleUserSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const userId = e.target.value;
        const user = users.find(u => u.id === userId) || null;
        setSelectedUser(user);
    };

    const handleDeleteUser = async () => {
        if (!deleteConfirmUser) return;
        
        try {
            await adminService.deleteUser(deleteConfirmUser.id);
            setUsers(prevUsers => prevUsers.filter(u => u.id !== deleteConfirmUser.id));
            if (selectedUser?.id === deleteConfirmUser.id) {
                setSelectedUser(null);
            }
            setSuccessMessage(`Usuario "${deleteConfirmUser.firstName}" eliminado con éxito.`);
            setTimeout(() => setSuccessMessage(''), 3000);
            setDeleteConfirmUser(null);
        } catch (err: any) {
             setError(`Error al eliminar el usuario: ${err.message}`);
        }
    };

    if (!isAuthenticated) {
        return <AdminPasswordModal onSuccess={() => setIsAuthenticated(true)} onClose={onClose} />;
    }

    return (
        <div className="fixed inset-0 bg-slate-800 bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col relative animate-fade-in-up">
                <header className="p-4 border-b border-slate-200 flex-shrink-0 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <CogIcon className="w-8 h-8 text-sky-600" />
                        <h2 className="text-2xl font-bold text-sky-800">Panel de Administración</h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-800 transition rounded-full hover:bg-slate-200" aria-label="Cerrar">
                        <CloseIcon />
                    </button>
                </header>

                <main className="flex-grow overflow-y-auto px-4 py-4 space-y-6">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full"><p className="text-slate-500 animate-pulse">Cargando datos del panel...</p></div>
                    ) : error ? (
                        <p className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">{error}</p>
                    ) : dashboardStats ? (
                        <>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 mb-3 ml-1">Estadísticas Generales</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <StatCard title="Total Usuarios" value={dashboardStats.total} icon={<UserGroupIcon className="w-6 h-6" />} />
                                    <StatCard title="Puntaje Promedio" value={dashboardStats.averageScore.toLocaleString('es-ES')} icon={<CalculatorIcon className="w-6 h-6" />} />
                                    <StatCard title="Usuarios Activos" value={`${dashboardStats.active} / ${dashboardStats.total}`} icon={<TrendingUpIcon className="w-6 h-6" />}>
                                        <p>{dashboardStats.inactive} inactivos</p>
                                    </StatCard>
                                    <StatCard title="Por Carrera" value="" icon={<BookOpenIcon className="w-6 h-6" />}>
                                        <ul className="space-y-1">
                                            {Object.entries(dashboardStats.byCareer).map(([career, count]) => <li key={career} className="flex justify-between"><span>{career.replace('Pedagogía en ', 'P. en ')}:</span> <strong>{count}</strong></li>)}
                                        </ul>
                                    </StatCard>
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 mb-3 ml-1">Gestionar Usuario</h3>
                                 {successMessage && <p className="text-green-600 text-sm text-center bg-green-50 p-2 rounded-md mb-2">{successMessage}</p>}
                                <select onChange={handleUserSelect} value={selectedUser?.id || ''} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 bg-white">
                                    <option value="">-- Selecciona un usuario para gestionar --</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>{user.firstName} {user.lastName} ({user.email})</option>
                                    ))}
                                </select>

                                {selectedUser && (
                                    <div className="mt-4 p-4 bg-white rounded-lg shadow-md border animate-fade-in-up">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-lg text-slate-800">{selectedUser.firstName} {selectedUser.lastName}</h4>
                                                <p className="text-sm text-slate-500">{selectedUser.email}</p>
                                                <p className="text-sm text-sky-600 font-semibold">{selectedUser.score.toLocaleString('es-ES')} puntos</p>
                                            </div>
                                            <div className="flex items-center gap-1 flex-wrap justify-end">
                                                <button onClick={() => setDetailsModalUser(selectedUser)} className="p-2 text-slate-500 hover:text-sky-700 hover:bg-sky-100 rounded-md transition" title="Ver Detalles"><MagnifyingGlassIcon className="w-5 h-5" /></button>
                                                <button onClick={() => setEditModalUser(selectedUser)} className="p-2 text-slate-500 hover:text-amber-700 hover:bg-amber-100 rounded-md transition" title="Editar Usuario"><PencilIcon className="w-5 h-5" /></button>
                                                <button onClick={() => setEmailModalUser(selectedUser)} className="p-2 text-slate-500 hover:text-green-700 hover:bg-green-100 rounded-md transition" title="Enviar Mensaje"><EnvelopeIcon className="w-5 h-5" /></button>
                                                <button onClick={() => setDeleteConfirmUser(selectedUser)} className="p-2 text-slate-500 hover:text-red-700 hover:bg-red-100 rounded-md transition" title="Eliminar Usuario"><TrashIcon className="w-5 h-5" /></button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex justify-center items-center h-full"><p className="text-slate-500">No hay datos de usuarios para mostrar.</p></div>
                    )}
                </main>
            </div>
            
            {detailsModalUser && <UserDetailsModal user={detailsModalUser} onClose={() => setDetailsModalUser(null)} />}
            {editModalUser && <EditUserModal user={editModalUser} onClose={() => setEditModalUser(null)} onSaveSuccess={handleSaveSuccess} />}
            {emailModalUser && <Suspense fallback={null}><EmailUserModal user={emailModalUser} onClose={() => setEmailModalUser(null)} /></Suspense>}

            {deleteConfirmUser && (
                <div className="fixed inset-0 bg-slate-800 bg-opacity-70 flex items-center justify-center z-[60]">
                    <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-sm">
                        <h3 className="text-xl font-bold text-slate-800">¿Estás absolutamente seguro?</h3>
                        <p className="text-slate-600 my-4">
                            Estás a punto de eliminar al usuario <strong className="font-semibold">{deleteConfirmUser.firstName} {deleteConfirmUser.lastName}</strong>.
                            <br/><br/>
                            <strong className="text-red-600">ESTA ACCIÓN ES IRREVERSIBLE</strong> y eliminará permanentemente al usuario y TODOS sus registros de desempeño y progreso asociados a él.
                        </p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => setDeleteConfirmUser(null)} className="px-6 py-2 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300">Cancelar</button>
                            <button onClick={handleDeleteUser} className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700">Eliminar</button>
                        </div>
                    </div>
                </div>
            )}
             <style>{`@keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }`}</style>
        </div>
    );
};

export default AdminPanel;