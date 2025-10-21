
import React, { useState } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { User, CareerOption } from '../types';

interface RegistrationModalProps {
  onClose: () => void;
  onRegister: (user: User) => void;
}

const careerOptions: CareerOption[] = [
    'Educación Parvularia',
    'Pedagogía en Educación Diferencial',
    'Pedagogía en Educación Básica'
];

const RegistrationModal: React.FC<RegistrationModalProps> = ({ onClose, onRegister }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [career, setCareer] = useState<CareerOption>(careerOptions[0]);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !career) {
      setError('Por favor, completa todos los campos.');
      return;
    }
    // Simple email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
        setError('Por favor, introduce un correo electrónico válido.');
        return;
    }
    setError('');
    onRegister({ firstName, lastName, email, career });
  };

  return (
    <div className="fixed inset-0 bg-slate-800 bg-opacity-60 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-800 transition z-10" aria-label="Cerrar"><CloseIcon /></button>
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-sky-800">Crea tu Cuenta</h2>
          <p className="text-slate-600 mt-2">¡Únete a la aventura del Bosque Mágico!</p>
        </div>
        
        <div className="mb-6 p-3 bg-sky-50 border border-sky-200 rounded-lg text-center">
          <p className="text-sm text-sky-800">
            Al crear una cuenta, guardaremos tu progreso, desbloquearás logros y podrás acceder a recompensas especiales. ¡Tu aventura será única!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-slate-700">Nombres</label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
              required
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-slate-700">Apellidos</label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
              required
            />
          </div>
          <div>
            <label htmlFor="career" className="block text-sm font-medium text-slate-700">Carrera</label>
            <select
              id="career"
              value={career}
              onChange={(e) => setCareer(e.target.value as CareerOption)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
            >
              {careerOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
            >
              Registrarse
            </button>
          </div>
        </form>
      </div>
       <style>{`@keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }`}</style>
    </div>
  );
};

export default RegistrationModal;
