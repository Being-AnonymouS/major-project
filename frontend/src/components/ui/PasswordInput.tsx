import React, { useState } from 'react';

// Simple eye icons as SVG components
const EyeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

const EyeSlashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
    />
  </svg>
);

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || `password-input-${Math.random().toString(36).substr(2, 9)}`;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          type={showPassword ? 'text' : 'password'}
          className={`
            block w-full px-3 py-2 pr-10 border rounded-md shadow-sm placeholder-gray-400 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${error 
              ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300'
            }
            ${className}
          `}
          {...props}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
          onClick={togglePasswordVisibility}
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeSlashIcon 
              className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" 
              aria-hidden="true"
            />
          ) : (
            <EyeIcon 
              className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" 
              aria-hidden="true"
            />
          )}
          <span className="sr-only">
            {showPassword ? 'Hide password' : 'Show password'}
          </span>
        </button>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};
