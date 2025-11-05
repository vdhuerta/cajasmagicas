import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { UserProfile } from '../types';
import * as adminService from '../services/adminService';
import AdminPasswordModal from './AdminPasswordModal';
import UserDetailsModal from './UserDetailsModal';
import EditUserModal from './EditUserModal';
import { CloseIcon } from './icons/CloseIcon';
import { CogIcon } from './icons/CogIcon';
import { MagnifyingGlassIcon } from './icons/MagnifyingGlassIcon';
// FIX: Changed named import to default import for PencilIcon.
import PencilIcon from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';
import { supabase } from '../services/supabase';
import EnvelopeIcon from './icons/EnvelopeIcon';

const EmailUserModal = lazy(() => import('./EmailUserModal'));


interface AdminPanelProps {
    onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    
    const [detailsModalUser, setDetailsModalUser] = useState<UserProfile | null>(null);
    const [editModalUser, setEditModalUser] = useState<UserProfile | null>(null);
    const [deleteConfirmUser, setDeleteConfirmUser] = useState<UserProfile | null>(null);
    const [emailModalUser, setEmailModalUser] = useState<UserProfile | null>(null);


    useEffect(() => {
        if (isAuthenticated) {
            fetchUsers();
        }
    }, [isAuthenticated]);

    const fetchUsers = async () => {
        setIsLoading(true);
        setError('');
        try {
            const data = await adminService.getAllUsers();
            setUsers(data);
        } catch (err: any) {
            setError(`Error al cargar los usuarios: ${err.message}`);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleUserUpdated = (updatedUser: UserProfile) => {
        setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
    };

    const handleDeleteUser = async () => {
        if (!deleteConfirmUser) return;
        
        try {
            // Write operations still go through the secure serverless function.
            await adminService.deleteUser(deleteConfirmUser.id);
            setUsers(prevUsers => prevUsers.filter(u => u.id !== deleteConfirmUser.id));
            setDeleteConfirmUser(null);
        } catch (err: any) {
             setError(`Error al eliminar el usuario: ${err.message}`);
        }
    };

    const filteredUsers = useMemo(() => {
        return users.filter(user =>
            user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

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

                <div className="p-4 flex-shrink-0 border-b border-slate-200">
                     <div className="flex items-center justify-between gap-4">
                        <div className="relative flex-grow">
                            <input
                                type="text"
                                placeholder="Buscar por nombre o correo..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500"
                            />
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        </div>
                        <div className="flex items-center gap-4 ml-4 text-sm text-slate-500 flex-shrink-0">
                            <p>
                                Total de Registros: <span className="font-bold text-slate-700">{users.length}</span>
                            </p>
                        </div>
                    </div>
                    {error && <p className="text-red-600 text-sm mt-2 text-center bg-red-50 p-2 rounded-md">{error}</p>}
                </div>
                
                <main className="flex-grow overflow-y-auto px-4 py-4">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full"><p className="text-slate-500 animate-pulse">Cargando usuarios...</p></div>
                    ) : (
                        <div className="space-y-2">
                            {filteredUsers.map(user => (
                                <div key={user.id} className="bg-white p-3 rounded-lg shadow-sm flex items-center gap-4">
                                    <div className="flex-grow">
                                        <p className="font-bold text-slate-800">{user.firstName} {user.lastName}</p>
                                        <p className="text-sm text-slate-500">{user.email}</p>
                                        <p className="text-sm text-sky-600 font-semibold">{user.score.toLocaleString('es-ES')} puntos</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setEmailModalUser(user)} className="p-2 text-slate-500 hover:text-green-700 hover:bg-green-100 rounded-md transition" title="Enviar Mensaje"><EnvelopeIcon className="w-5 h-5" /></button>
                                        <button onClick={() => setDetailsModalUser(user)} className="p-2 text-slate-500 hover:text-sky-700 hover:bg-sky-100 rounded-md transition" title="Ver Detalles"><MagnifyingGlassIcon className="w-5 h-5" /></button>
                                        <button onClick={() => setEditModalUser(user)} className="p-2 text-slate-500 hover:text-amber-700 hover:bg-amber-100 rounded-md transition" title="Editar Usuario"><PencilIcon className="w-5 h-5" /></button>
                                        <button onClick={() => setDeleteConfirmUser(user)} className="p-2 text-slate-500 hover:text-red-700 hover:bg-red-100 rounded-md transition" title="Eliminar Usuario"><TrashIcon className="w-5 h-5" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
            
            {detailsModalUser && <UserDetailsModal user={detailsModalUser} onClose={() => setDetailsModalUser(null)} />}
            {editModalUser && <EditUserModal user={editModalUser} onClose={() => setEditModalUser(null)} onUserUpdated={handleUserUpdated} />}
            {emailModalUser && <Suspense fallback={null}><EmailUserModal user={emailModalUser} onClose={() => setEmailModalUser(null)} /></Suspense>}

            {deleteConfirmUser && (
                <div className="fixed inset-0 bg-slate-800 bg-opacity-70 flex items-center justify-center z-[60]">
                    <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-sm">
                        <h3 className="text-xl font-bold text-slate-800">¿Estás seguro?</h3>
                        <p className="text-slate-600 my-4">Estás a punto de eliminar a <strong className="font-semibold">{deleteConfirmUser.firstName} {deleteConfirmUser.lastName}</strong>. Esta acción es irreversible y borrará al usuario y todos sus datos.</p>
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