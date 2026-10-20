import React, { useEffect, useState } from 'react';
import { CheckCircle2, Info, AlertCircle } from 'lucide-react';
import { ToastEventDetail } from '../lib/toast';

export const Toast: React.FC = () => {
  const [toast, setToast] = useState<ToastEventDetail | null>(null);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent<ToastEventDetail>;
      if (customEvent.detail) {
        setToast(customEvent.detail);
      }
    };

    window.addEventListener('app-toast', handleToast);
    return () => {
      window.removeEventListener('app-toast', handleToast);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, toast.duration || 2600);

    return () => clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-slide-up px-4 max-w-sm w-full">
      <div className="flex items-center space-x-2.5 px-4 py-3 rounded-2xl bg-zinc-900/95 text-white shadow-2xl backdrop-blur-md border border-zinc-700 text-xs sm:text-sm font-semibold pointer-events-auto">
        {toast.type === 'error' ? (
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
        ) : toast.type === 'info' ? (
          <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        )}
        <span className="flex-1 leading-snug">{toast.message}</span>
      </div>
    </div>
  );
};
