import React, { useEffect } from 'react';
import { Notification } from '../types';
import { StarIcon } from './icons/StarIcon';

interface NotificationToastProps {
  notification: Notification;
  onDismiss: (id: number) => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(notification.id);
    }, 4000); // Notification stays for 4 seconds

    return () => clearTimeout(timer);
  }, [notification.id, onDismiss]);

  return (
    <div className="bg-white rounded-xl shadow-2xl p-4 flex items-center gap-4 animate-fade-in-right max-w-sm">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center">
        <StarIcon className="w-6 h-6 text-white" />
      </div>
      <p className="text-slate-700 font-semibold">{notification.message}</p>
      <button onClick={() => onDismiss(notification.id)} className="ml-auto text-slate-400 hover:text-slate-600">&times;</button>
    </div>
  );
};


interface NotificationContainerProps {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

const NotificationContainer: React.FC<NotificationContainerProps> = ({ notifications, setNotifications }) => {
  const handleDismiss = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="fixed top-24 right-4 md:right-8 z-50 space-y-3">
      {notifications.map(notification => (
        <NotificationToast key={notification.id} notification={notification} onDismiss={handleDismiss} />
      ))}
       <style>{`
        @keyframes fade-in-right { 
          from { opacity: 0; transform: translateX(20px); } 
          to { opacity: 1; transform: translateX(0); } 
        } 
        .animate-fade-in-right { animation: fade-in-right 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default NotificationContainer;