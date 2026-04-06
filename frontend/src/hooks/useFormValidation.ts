import React, { useState, useCallback, useEffect } from 'react';

export interface ValidationRule<T> {
  field: keyof T;
  validate: (value: any, formData: T) => string | undefined | Promise<string | undefined>;
  debounceMs?: number; // For async validation debouncing
}

export interface UseFormValidationOptions<T> {
  initialValues: T;
  validationRules: ValidationRule<T>[];
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  debounceMs?: number;
}

export interface UseFormValidationReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  isValid: boolean;
  isValidating: boolean;
  touched: Partial<Record<keyof T, boolean>>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldError: (field: keyof T, error: string | undefined) => void;
  setErrors: (errors: Partial<Record<keyof T, string>>) => void;
  validateField: (field: keyof T) => Promise<boolean>;
  validateForm: () => Promise<boolean>;
  reset: () => void;
  clearErrors: () => void;
  getFieldProps: (field: keyof T) => {
    name: string;
    value: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    error: string | undefined;
    hasError: boolean;
  };
}

export function useFormValidation<T extends Record<string, any>>({
  initialValues,
  validationRules,
  validateOnChange = false,
  validateOnBlur = true,
  debounceMs = 300,
}: UseFormValidationOptions<T>): UseFormValidationReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isValidating, setIsValidating] = useState(false);
  const [validationTimeouts, setValidationTimeouts] = useState<Record<string, NodeJS.Timeout>>({});

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(validationTimeouts).forEach(timeout => clearTimeout(timeout));
    };
  }, [validationTimeouts]);

  const validateField = useCallback(async (field: keyof T): Promise<boolean> => {
    const rule = validationRules.find(r => r.field === field);
    if (!rule) return true;

    setIsValidating(true);

    try {
      const error = await rule.validate(values[field], values);
      setErrors(prev => ({ ...prev, [field]: error }));
      return !error;
    } catch (validationError) {
      console.error('Validation error:', validationError);
      setErrors(prev => ({ ...prev, [field]: 'Validation failed' }));
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [values, validationRules]);

  const validateForm = useCallback(async (): Promise<boolean> => {
    setIsValidating(true);
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isFormValid = true;

    try {
      // Validate all fields in parallel
      const validationPromises = validationRules.map(async (rule) => {
        try {
          const error = await rule.validate(values[rule.field], values);
          if (error) {
            newErrors[rule.field] = error;
            isFormValid = false;
          }
        } catch (validationError) {
          console.error(`Validation error for field ${String(rule.field)}:`, validationError);
          newErrors[rule.field] = 'Validation failed';
          isFormValid = false;
        }
      });

      await Promise.all(validationPromises);
      setErrors(newErrors);
      return isFormValid;
    } finally {
      setIsValidating(false);
    }
  }, [values, validationRules]);

  const debouncedValidateField = useCallback((field: keyof T, delay: number = debounceMs) => {
    // Clear existing timeout for this field
    if (validationTimeouts[String(field)]) {
      clearTimeout(validationTimeouts[String(field)]);
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      validateField(field);
      setValidationTimeouts(prev => {
        const newTimeouts = { ...prev };
        delete newTimeouts[String(field)];
        return newTimeouts;
      });
    }, delay);

    setValidationTimeouts(prev => ({ ...prev, [String(field)]: timeout }));
  }, [validateField, debounceMs, validationTimeouts]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let processedValue: any = value;

    // Handle different input types
    if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      processedValue = value === '' ? '' : Number(value);
    }

    setValues(prev => ({ ...prev, [name]: processedValue }));
    
    // Clear error when user starts typing
    if (errors[name as keyof T]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }

    // Validate on change if enabled
    if (validateOnChange && touched[name as keyof T]) {
      const rule = validationRules.find(r => r.field === name);
      const delay = rule?.debounceMs ?? debounceMs;
      debouncedValidateField(name as keyof T, delay);
    }
  }, [errors, touched, validateOnChange, validationRules, debounceMs, debouncedValidateField]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate field on blur if enabled
    if (validateOnBlur) {
      validateField(name as keyof T);
    }
  }, [validateOnBlur, validateField]);

  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Clear error when value is set programmatically
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const setFieldError = useCallback((field: keyof T, error: string | undefined) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsValidating(false);
    // Clear all validation timeouts
    Object.values(validationTimeouts).forEach(timeout => clearTimeout(timeout));
    setValidationTimeouts({});
  }, [initialValues, validationTimeouts]);

  const getFieldProps = useCallback((field: keyof T) => {
    return {
      name: String(field),
      value: values[field] ?? '',
      onChange: handleChange,
      onBlur: handleBlur,
      error: errors[field],
      hasError: Boolean(errors[field]),
    };
  }, [values, errors, handleChange, handleBlur]);

  // Calculate if form is valid (no errors and not currently validating)
  const isValid = Object.keys(errors).length === 0 && !isValidating;

  return {
    values,
    errors,
    isValid,
    isValidating,
    touched,
    handleChange,
    handleBlur,
    setFieldValue,
    setFieldError,
    setErrors,
    validateField,
    validateForm,
    reset,
    clearErrors,
    getFieldProps,
  };
}