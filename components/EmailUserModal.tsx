import React, { useState } from 'react';
import { UserProfile } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import * as emailService from '../services/emailService';
import EnvelopeIcon from './icons/EnvelopeIcon';

interface EmailUserModalProps {
    user: UserProfile;
    onClose: () => void;
}

const EmailUserModal: React.FC<EmailUserModalProps> = ({ user, onClose }) => {
    const [subject, setSubject] = useState(`Un mensaje sobre tu progreso en Cajas Mágicas`);
    const [body, setBody] = useState(`Hola ${user.firstName},\n\nHe notado que tu puntaje es un poco bajo últimamente. ¡No te desanimes! Sigue explorando y jugando en el Bosque Mágico, cada intento es una nueva oportunidad para aprender y mejorar.\n\n¡Confío en que puedes lograrlo!\n\nAtentamente,\nEl Guardián del Bosque`);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccessMessage('');
        try {
            await emailService.sendEmail({
                to: user.email,
                subject,
                body,
            });
            setSuccessMessage(`Correo enviado a ${user.email}.`);
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (err: any) {
            setError(`Error al enviar el correo: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-800 bg-opacity-70 flex items-center justify-center z-[70] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col animate-fade-in-up">
                <header className="p-4 border-b border-slate-200 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <EnvelopeIcon className="w-6 h-6 text-sky-600" />
                        <h3 className="text-xl font-bold text-slate-800">Enviar Mensaje a Usuario</h3>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-800 transition rounded-full hover:bg-slate-200" aria-label="Cerrar"><CloseIcon /></button>
                </header>
                
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Para:</label>
                            <p className="mt-1 text-slate-600 font-semibold">{user.firstName} {user.lastName} &lt;{user.email}&gt;</p>
                        </div>
                        <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-slate-700">Asunto</label>
                            <input
                                type="text"
                                id="subject"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="body" className="block text-sm font-medium text-slate-700">Mensaje</label>
                            <textarea
                                id="body"
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                rows={8}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                                required
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md border border-red-200">{error}</p>}
                        {successMessage && <p className="text-green-600 text-sm text-center bg-green-50 p-3 rounded-md border border-green-200">{successMessage}</p>}
                    </div>

                    <footer className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 transition">Cancelar</button>
                        <button type="submit" disabled={isLoading || !!successMessage} className="px-6 py-2 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 transition disabled:bg-slate-400">
                            {isLoading ? 'Enviando...' : 'Enviar Correo'}
                        </button>
                    </footer>
                </form>
            </div>
             <style>{`@keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }`}</style>
        </div>
    );
};

export default EmailUserModal;