import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  helperText,
  options,
  placeholder,
  className = '',
  id,
  ...props
}) => {
  const generatedId = React.useId();
  const selectId = id || generatedId;
  const hintId = error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-semibold text-slate-700"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        aria-invalid={Boolean(error)}
        aria-describedby={hintId}
        className={`
          block w-full rounded-xl border bg-white/90 px-3.5 py-2.5 text-slate-800 shadow-sm transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
          disabled:cursor-not-allowed disabled:bg-slate-100/70 disabled:text-slate-500
          ${error 
            ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' 
            : 'border-slate-300/90'
          }
          ${className}
        `}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${selectId}-error`} className="text-sm font-medium text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p id={`${selectId}-helper`} className="text-sm text-slate-500">{helperText}</p>
      )}
    </div>
  );
};