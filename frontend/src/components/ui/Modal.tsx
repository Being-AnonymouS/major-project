import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
  };

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto" role="dialog" aria-modal="true" aria-label={title || 'Modal'}>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/45 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-3 sm:p-5">
        <div 
          className={`relative w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card transform transition-all`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-4 sm:px-6">
              <h3 className="font-display text-lg font-semibold text-slate-900">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close dialog"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          
          {/* Content */}
          <div className="max-h-[calc(90vh-4.5rem)] overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};