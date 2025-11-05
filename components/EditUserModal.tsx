import React, { useState } from 'react';
import { UserProfile, CareerOption, SectionOption } from '../types';
import { updateUser } from '../services/adminService';
import { CloseIcon } from './icons/CloseIcon';

interface EditUserModalProps {
    user: UserProfile;
    onClose: () => void;
    onUserUpdated: (updatedUser: UserProfile) => void;
}

const careerOptions: CareerOption[] = [
    'Educación Parvularia',
    'Pedagogía en Educación Diferencial',
    'Pedagogía en Educación Básica'
];

const sectionOptions: SectionOption[] = [
    'Sección 1',
    'Sección 2',
    'Sección 3'
];

const EditUserModal: React.FC<EditUserModalProps> = ({ user, onClose, onUserUpdated }) => {
    const [formData, setFormData] = useState({
        firstName: user.firstName,
        lastName: user.lastName,
        career: user.career,
        section: user.section || 'Sección 1',
        score: user.score,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'score' ? parseInt(value) || 0 : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const updatedUser = await updateUser({
                id: user.id,
                ...formData
            });
            onUserUpdated(updatedUser);
            onClose();
        } catch (err: any) {
            setError(`Error al actualizar: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-800 bg-opacity-70 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col animate-fade-in-up">
                <header className="p-4 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-800">Editar Usuario</h3>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-800 transition rounded-full hover:bg-slate-200" aria-label="Cerrar"><CloseIcon /></button>
                </header>
                
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-slate-700">Nombres</label>
                                <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" />
                            </div>
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-slate-700">Apellidos</label>
                                <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Correo Electrónico</label>
                            <input type="email" id="email" value={user.email} disabled className="mt-1 block w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-md shadow-sm text-slate-500" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="career" className="block text-sm font-medium text-slate-700">Carrera</label>
                                <select id="career" name="career" value={formData.career} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500">
                                    {careerOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="section" className="block text-sm font-medium text-slate-700">Sección</label>
                                <select id="section" name="section" value={formData.section} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500">
                                    {sectionOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                        </div>
                         <div>
                            <label htmlFor="score" className="block text-sm font-medium text-slate-700">Puntaje</label>
                            <input type="number" id="score" name="score" value={formData.score} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" />
                        </div>
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    </div>

                    <footer className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 transition">Cancelar</button>
                        <button type="submit" disabled={isLoading} className="px-6 py-2 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 transition disabled:bg-slate-400">
                            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </footer>
                </form>
            </div>
            <style>{`@keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }`}</style>
        </div>
    );
};

export default EditUserModal;