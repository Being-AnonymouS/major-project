import React from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select';
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: Array<{ value: string; label: string }>;
  rows?: number;
  className?: string;
  helpText?: string;
  autoComplete?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  required = false,
  disabled = false,
  options = [],
  rows = 3,
  className = '',
  helpText,
  autoComplete,
}) => {
  const baseInputClasses = `
    block w-full px-3.5 py-2.5 rounded-xl border bg-white/90 shadow-sm placeholder:text-slate-400
    focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
    disabled:bg-slate-100/70 disabled:text-slate-500 disabled:cursor-not-allowed
    ${error 
      ? 'border-red-300 text-red-900 placeholder:text-red-300 focus:ring-red-500 focus:border-red-500' 
      : 'border-slate-300/90 text-slate-900'
    }
  `;

  const renderInput = () => {
    if (type === 'select') {
      return (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          className={baseInputClasses}
          aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
          aria-invalid={error ? 'true' : 'false'}
        >
          <option value="">{placeholder || `Select ${label.toLowerCase()}`}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    if (type === 'textarea') {
      return (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          rows={rows}
          placeholder={placeholder}
          className={baseInputClasses}
          aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
          aria-invalid={error ? 'true' : 'false'}
        />
      );
    }

    return (
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={baseInputClasses}
        aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
        aria-invalid={error ? 'true' : 'false'}
      />
    );
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <label htmlFor={name} className="block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </label>
      
      {renderInput()}
      
      {error && (
        <p id={`${name}-error`} className="text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      )}
      
      {helpText && !error && (
        <p id={`${name}-help`} className="text-sm text-slate-500">
          {helpText}
        </p>
      )}
    </div>
  );
};

export default FormField;