import React, { useEffect } from 'react';
import { X, Terminal } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-none overflow-y-auto font-mono">
      <div className={`terminal-card bg-black border-2 border-terminalAmber w-full ${maxWidthClass} overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-100 my-8`}>
        {/* Solid Bloomberg Terminal Amber Header Strip */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-terminalAmber text-black border-b border-black select-none">
          <div className="flex items-center space-x-2">
            <span className="bg-black text-terminalAmber px-1.5 py-0.2 font-black text-[10px]">
              MODAL://
            </span>
            <h3 className="text-xs font-black uppercase tracking-wider font-mono">
              {title}
            </h3>
          </div>

          {/* Retro Window Control Buttons */}
          <div className="flex items-center space-x-1">
            <button
              onClick={onClose}
              className="px-1.5 py-0.5 bg-black text-terminalAmber hover:bg-stockRed hover:text-white font-mono text-[10px] font-extrabold border border-black transition"
              title="Close [ESC]"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Window Content */}
        <div className="p-4 max-h-[80vh] overflow-y-auto bg-[#080808]">
          {children}
        </div>
      </div>
    </div>
  );
};
