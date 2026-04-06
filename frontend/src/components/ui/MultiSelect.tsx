import React, { useState, useRef, useEffect } from 'react';

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  label?: string;
  options: MultiSelectOption[];
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  maxSelections?: number;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select options...',
  error,
  helperText,
  maxSelections,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !value.includes(option.value)
  );

  const handleToggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue));
    } else {
      if (maxSelections && value.length >= maxSelections) {
        return; // Don't add if max selections reached
      }
      onChange([...value, optionValue]);
    }
  };

  const handleRemoveOption = (optionValue: string) => {
    onChange(value.filter(v => v !== optionValue));
  };

  const getSelectedLabels = () => {
    return value.map(v => options.find(opt => opt.value === v)?.label).filter(Boolean);
  };

  return (
    <div className="w-full" ref={dropdownRef}>
      {label && (
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">
          {label}
        </label>
      )}
      
      <div className="relative">
        {/* Selected items display */}
        <div
          className={`
            min-h-[46px] w-full cursor-pointer rounded-xl border bg-white/90 px-3.5 py-2.5 shadow-sm
            transition-colors duration-200
            focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500
            ${error 
              ? 'border-red-300 focus-within:ring-red-500 focus-within:border-red-500' 
              : 'border-slate-300/90'
            }
          `}
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) {
              setTimeout(() => inputRef.current?.focus(), 0);
            }
          }}
        >
          <div className="flex flex-wrap gap-1">
            {value.length === 0 && !isOpen && (
              <span className="text-sm text-slate-400">{placeholder}</span>
            )}
            
            {getSelectedLabels().map((label, index) => (
              <span
                key={value[index]}
                className="inline-flex items-center rounded-lg border border-brand-100 bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-700"
              >
                {label}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveOption(value[index]);
                  }}
                  className="ml-1 text-brand-600 hover:text-brand-800"
                >
                  ×
                </button>
              </span>
            ))}
            
            {isOpen && (
              <input
                ref={inputRef}
                type="text"
                className="min-w-[120px] flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-20 mt-1.5 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white p-1 shadow-card">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-slate-500">
                {searchTerm ? 'No options found' : 'All options selected'}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100 focus:bg-slate-100 focus:outline-none"
                  onClick={() => handleToggleOption(option.value)}
                  disabled={!!(maxSelections && value.length >= maxSelections)}
                >
                  <span>{option.label}</span>
                  {maxSelections && value.length >= maxSelections && (
                    <span className="text-xs text-slate-400">Max reached</span>
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {maxSelections && (
        <p className="mt-1 text-xs text-slate-500">
          {value.length}/{maxSelections} selected
        </p>
      )}

      {error && (
        <p className="mt-1 text-sm font-medium text-red-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-slate-500">{helperText}</p>
      )}
    </div>
  );
};