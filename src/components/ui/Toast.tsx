import { useState, useEffect } from 'react';
import { cn } from '../../lib/cn';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export interface ToastMsg { id: string; type: 'success'|'error'|'info'; message: string; }

let addToastRef: (msg: Omit<ToastMsg, 'id'>) => void = () => {};

export const toast = (msg: Omit<ToastMsg, 'id'>) => addToastRef(msg);

export const ToastContainer = () => {
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  useEffect(() => {
    addToastRef = (msg) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts(prev => [...prev, { ...msg, id }].slice(-3));
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none sm:top-4 sm:bottom-auto">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div 
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
              "pointer-events-auto flex items-center gap-3 px-4 py-3 rounded border shadow-lg bg-panel text-sm",
              t.type === 'success' ? 'border-success text-success' : '',
              t.type === 'error' ? 'border-danger text-danger' : '',
              t.type === 'info' ? 'border-border text-text' : ''
            )}
            role="status"
          >
            {t.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
            {t.type === 'error' && <AlertCircle className="w-5 h-5" />}
            {t.type === 'info' && <Info className="w-5 h-5 text-muted" />}
            <span className="text-text">{t.message}</span>
            <button onClick={() => setToasts(p => p.filter(x => x.id !== t.id))} className="text-muted hover:text-text ml-2">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
