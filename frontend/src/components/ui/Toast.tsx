import React from 'react';
import { Toast as ToastType, useToast } from '../../contexts/ToastContext';

interface ToastProps {
  toast: ToastType;
}

const Toast: React.FC<ToastProps> = ({ toast }) => {
  const { removeToast } = useToast();

  const getToastStyles = () => {
    const baseStyles = 'w-full rounded-2xl border bg-white/95 p-4 shadow-card backdrop-blur-sm transform transition-all duration-300 ease-out animate-slideInRight';
    
    switch (toast.type) {
      case 'success':
        return `${baseStyles} border-emerald-200`;
      case 'error':
        return `${baseStyles} border-red-200`;
      case 'warning':
        return `${baseStyles} border-amber-200`;
      case 'info':
        return `${baseStyles} border-brand-200`;
      default:
        return `${baseStyles} border-slate-200`;
    }
  };

  const getIconColor = () => {
    switch (toast.type) {
      case 'success':
        return 'text-emerald-500';
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-amber-500';
      case 'info':
        return 'text-brand-500';
      default:
        return 'text-slate-400';
    }
  };

  const getTextColor = () => {
    switch (toast.type) {
      case 'success':
        return 'text-emerald-900';
      case 'error':
        return 'text-red-900';
      case 'warning':
        return 'text-amber-900';
      case 'info':
        return 'text-brand-900';
      default:
        return 'text-slate-800';
    }
  };

  const getAccentStyle = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-emerald-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-amber-500';
      case 'info':
        return 'bg-brand-500';
      default:
        return 'bg-slate-400';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={getToastStyles()} style={{ minHeight: '68px' }} role="alert" aria-live="polite">
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 h-8 w-1 rounded-full ${getAccentStyle()}`} aria-hidden="true" />
        <div className={`flex-shrink-0 ${getIconColor()}`}>
          {getIcon()}
        </div>
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-semibold ${getTextColor()} leading-5`}>
            {toast.title}
          </p>
          {toast.message && (
            <p className={`mt-1 text-sm ${getTextColor()} opacity-90 leading-5`}>
              {toast.message}
            </p>
          )}
        </div>
        <div className="flex flex-shrink-0">
          <button
            className={`inline-flex rounded-full p-1 ${getTextColor()} hover:bg-slate-100/80 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500`}
            onClick={() => removeToast(toast.id)}
          >
            <span className="sr-only">Close</span>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 left-4 z-[9999] flex flex-col gap-3 pointer-events-none sm:left-auto sm:bottom-6 sm:right-6 sm:max-w-sm sm:min-w-[320px]">
      {toasts.map((toast, index) => (
        <div 
          key={toast.id} 
          className="pointer-events-auto"
          style={{ 
            zIndex: 9999 - index,
            marginBottom: index < toasts.length - 1 ? '6px' : '0'
          }}
        >
          <Toast toast={toast} />
        </div>
      ))}
    </div>
  );
};

export default Toast;