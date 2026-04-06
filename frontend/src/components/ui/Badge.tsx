import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  className = '', 
  variant = 'default',
  size = 'md',
}) => {
  const baseClasses = 'inline-flex items-center rounded-full font-semibold tracking-tight';

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
  };
  
  const variantClasses = {
    default: 'bg-slate-100 text-slate-700 border border-slate-200',
    secondary: 'bg-brand-50 text-brand-700 border border-brand-100',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border border-amber-100',
    error: 'bg-red-50 text-red-700 border border-red-100',
  };

  return (
    <span className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};