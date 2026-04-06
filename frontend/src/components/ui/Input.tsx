import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}) => {
  const generatedId = React.useId();
  const inputId = id || generatedId;
  const hintId = error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-semibold text-slate-700"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={hintId}
        className={`
          block w-full rounded-xl border bg-white/90 px-3.5 py-2.5 text-slate-800 shadow-sm transition-colors duration-200
          placeholder:text-slate-400
          focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
          disabled:cursor-not-allowed disabled:bg-slate-100/70 disabled:text-slate-500
          ${error 
            ? 'border-red-300 text-red-900 placeholder:text-red-300 focus:ring-red-500 focus:border-red-500' 
            : 'border-slate-300/90'
          }
          ${className}
        `}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-sm font-medium text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="text-sm text-slate-500">{helperText}</p>
      )}
    </div>
  );
};