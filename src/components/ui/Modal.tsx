import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

export const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: ReactNode }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <dialog ref={dialogRef} onClose={onClose} className={cn("bg-panel text-text rounded-modal border border-border p-6 shadow max-w-md w-full backdrop:bg-bg/80 backdrop:backdrop-blur-sm focus:outline-none")}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-mono font-bold">{title}</h2>
        <button onClick={onClose} className="text-muted hover:text-text focus-ring rounded p-1">&times;</button>
      </div>
      <div>{children}</div>
    </dialog>
  );
};
