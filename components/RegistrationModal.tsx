
import React, { useState } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { CareerOption, ActivityLogType } from '../types';
import { supabase } from '../services/supabase';


interface RegistrationModalProps {
  onClose: () => void;
  logActivity: (message: string, type: ActivityLogType) => void;
  initialView: 'login' | 'register';
}

const careerOptions: CareerOption[] = [
    'Educación Parvularia',
    'Pedagogía en Educación Diferencial',
    'Pedagogía en Educación Básica'
];

// Función para traducir los errores comunes de Supabase al español.
const translateSupabaseError = (message: string): string => {
    if (message.includes('Invalid login credentials')) {
      return 'Credenciales inválidas. Por favor, revisa tu correo y contraseña.';
    }
    if (message.includes('User already registered') || message.includes('already be registered')) {
      return 'Ya existe una cuenta con este correo. Por favor, inicia sesión.';
    }
    if (message.includes('Password should be at least 6 characters')) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    }
    if (message.includes('Unable to validate email address: invalid format')) {
      return 'El formato del correo electrónico no es válido.';
    }
    if (message.includes('Email signups are disabled')) {
      return 'El registro de nuevos usuarios está deshabilitado en este momento.';
    }
    // Mensaje genérico para otros errores no esperados.
    return 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.';
};


const RegistrationModal: React.FC<RegistrationModalProps> = ({ onClose, logActivity, initialView }) => {
  const [isLogin, setIsLogin] = useState(initialView === 'login');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [career, setCareer] = useState<CareerOption>(careerOptions[0]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!supabase) {
        setError("Error de conexión: La base de datos no está configurada.");
        setLoading(false);
        return;
    }

    if (isLogin) {
      // Handle Login
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(translateSupabaseError(signInError.message));
      } else {
        logActivity(`Usuario ${email} ha iniciado sesión.`, 'system');
        onClose();
      }
    } else {
      // Handle Sign Up
      if (!firstName || !lastName) {
          setError('Nombres y apellidos son requeridos para crear una cuenta.');
          setLoading(false);
          return;
      }
      
      // The robust way: sign up the user and pass their profile data in the `options.data` field.
      // A database trigger (handle_new_user) will then securely create the profile.
      // This avoids client-side race conditions and respects Row Level Security policies.
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstName: firstName,
            lastName: lastName,
            career: career,
          }
        }
      });

      if (signUpError) {
        setError(translateSupabaseError(signUpError.message));
      } else {
        // With the trigger in place, the profile will be created automatically.
        // The onAuthStateChange listener in App.tsx will fetch the new profile.
        // For an instant login experience, "Email confirmation" must be disabled in Supabase settings.
        logActivity(`Nueva cuenta creada para ${firstName}. ¡Bienvenido!`, 'system');
        onClose();
      }
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-800 bg-opacity-60 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-800 transition z-10" aria-label="Cerrar"><CloseIcon /></button>
        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold text-sky-800">{isLogin ? 'Iniciar Sesión' : 'Crea tu Cuenta'}</h2>
          <p className="text-slate-600 mt-2">{isLogin ? '¡Qué bueno verte de nuevo!' : '¡Únete a la aventura del Bosque Mágico!'}</p>
        </div>
        
        <div className="flex justify-center mb-6">
            <div className="p-1 bg-slate-100 rounded-lg flex items-center space-x-1">
                <button onClick={() => setIsLogin(true)} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition ${isLogin ? 'bg-white shadow' : 'text-slate-600'}`}>Iniciar Sesión</button>
                <button onClick={() => setIsLogin(false)} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition ${!isLogin ? 'bg-white shadow' : 'text-slate-600'}`}>Crear Cuenta</button>
            </div>
        </div>
        
        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-slate-700">Nombres</label>
                <input type="text" id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" required={!isLogin} />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-slate-700">Apellidos</label>
                <input type="text" id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" required={!isLogin} />
              </div>
            </>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Correo Electrónico</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" required />
          </div>
           <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">Contraseña</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" placeholder="Mínimo 6 caracteres" required />
          </div>
          {!isLogin && (
            <div>
              <label htmlFor="career" className="block text-sm font-medium text-slate-700">Carrera</label>
              <select id="career" value={career} onChange={(e) => setCareer(e.target.value as CareerOption)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500">
                {careerOptions.map(option => (<option key={option} value={option}>{option}</option>))}
              </select>
            </div>
          )}
          {error && <p className="text-sm text-red-600 text-center bg-red-50 p-3 rounded-md">{error}</p>}
          <div>
            <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400">
              {loading ? 'Procesando...' : (isLogin ? 'Entrar' : 'Crear Cuenta')}
            </button>
          </div>
        </form>
      </div>
       <style>{`@keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }`}</style>
    </div>
  );
};

export default RegistrationModal;