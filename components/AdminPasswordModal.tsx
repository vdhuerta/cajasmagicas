import React, { useState } from 'react';
import { CloseIcon } from './icons/CloseIcon';
// FIX: Changed named import to default import for KeyIcon.
import KeyIcon from './icons/KeyIcon';

interface AdminPasswordModalProps {
    onSuccess: () => void;
    onClose: () => void;
}

const ADMIN_PASSWORD = '070670';

const AdminPasswordModal: React.FC<AdminPasswordModalProps> = ({ onSuccess, onClose }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            onSuccess();
        } else {
            setError('Contraseña incorrecta.');
            setPassword('');
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-800 bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm relative animate-fade-in-up text-center">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-800 transition rounded-full hover:bg-slate-200" aria-label="Cerrar">
                    <CloseIcon />
                </button>
                
                <KeyIcon className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Acceso de Administrador</h2>
                <p className="text-slate-600 mb-6">Por favor, introduce la contraseña para continuar.</p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 text-center border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500"
                        autoFocus
                    />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button
                        type="submit"
                        className="w-full px-6 py-3 bg-sky-600 text-white font-bold rounded-lg shadow-md hover:bg-sky-700 transition"
                    >
                        Autenticar
                    </button>
                </form>
            </div>
            <style>{`@keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }`}</style>
        </div>
    );
};

export default AdminPasswordModal;