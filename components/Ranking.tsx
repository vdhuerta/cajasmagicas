import React from 'react';
import { UserProfile } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { SeriationIcon } from './icons/SeriationIcon';

interface RankingProps {
  users: UserProfile[];
  currentUser: UserProfile | null;
  onClose: () => void;
}

const Ranking: React.FC<RankingProps> = ({ users, currentUser, onClose }) => {
  
  const getRankColor = (rank: number) => {
      if (rank === 1) return 'text-amber-500 bg-amber-100'; // Gold
      if (rank === 2) return 'text-slate-500 bg-slate-200'; // Silver
      if (rank === 3) return 'text-amber-700 bg-amber-200'; // Bronze
      return 'text-slate-600 bg-slate-100';
  };

  const anonymizeName = (name: string): string => {
    if (!name || name.length <= 1) return name || '';
    return name.charAt(0) + '*'.repeat(name.length - 1);
  };
  
  // Detect if the specially added current user is present
  const currentUserOutOfRank = users.find(u => u.id === currentUser?.id && u.rank && u.rank > users.length -1);

  return (
    <div className="fixed inset-0 bg-slate-800 bg-opacity-60 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-lg h-[80vh] flex flex-col relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-800 transition z-10" aria-label="Cerrar"><CloseIcon /></button>
        
        <div className="text-center mb-4">
            <SeriationIcon className="w-12 h-12 mx-auto text-sky-600 mb-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-sky-800">Tabla de Clasificación</h2>
        </div>
        
        <div className="flex-grow overflow-y-auto pr-2">
            <ul className="space-y-3">
                {users.map((user, index) => {
                    if (user.id === currentUserOutOfRank?.id) return null; // Don't render it in the main list
                    
                    const isCurrentUser = user.id === currentUser?.id;
                    const rank = user.rank || index + 1;
                    return (
                        <li key={user.id} className={`flex items-center p-3 rounded-lg transition-all ${isCurrentUser ? 'bg-sky-100 border-2 border-sky-400 scale-105' : 'bg-white shadow-sm'}`}>
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${getRankColor(rank)}`}>
                                {rank}
                            </div>
                            <div className="ml-4 flex-grow">
                                <p className="font-bold text-slate-800">{anonymizeName(user.firstName)} {anonymizeName(user.lastName)}</p>
                                <p className="text-sm text-slate-500">{user.career}</p>
                            </div>
                            <div className="font-bold text-xl text-sky-700">
                                {user.score.toLocaleString('es-ES')} pts
                            </div>
                        </li>
                    );
                })}

                {currentUserOutOfRank && (
                    <>
                        <li className="text-center text-slate-400 font-bold text-2xl tracking-widest">...</li>
                        <li className="flex items-center p-3 rounded-lg bg-sky-100 border-2 border-sky-400 scale-105">
                             <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${getRankColor(currentUserOutOfRank.rank!)}`}>
                                {currentUserOutOfRank.rank}
                            </div>
                            <div className="ml-4 flex-grow">
                                <p className="font-bold text-slate-800">{anonymizeName(currentUserOutOfRank.firstName)} {anonymizeName(currentUserOutOfRank.lastName)}</p>
                                <p className="text-sm text-slate-500">{currentUserOutOfRank.career}</p>
                            </div>
                            <div className="font-bold text-xl text-sky-700">
                                {currentUserOutOfRank.score.toLocaleString('es-ES')} pts
                            </div>
                        </li>
                    </>
                )}

                 {users.length === 0 && (
                    <div className="text-center text-slate-500 pt-10">
                        <p>¡Aún no hay nadie en la clasificación!</p>
                        <p>Regístrate y juega para ser el primero.</p>
                    </div>
                 )}
            </ul>
        </div>
      </div>
       <style>{`@keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }`}</style>
    </div>
  );
};

export default Ranking;