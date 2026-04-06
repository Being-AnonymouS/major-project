// Common validation functions
export const validationRules = {
  required: (fieldName: string) => (value: any) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return `${fieldName} is required`;
    }
    if (Array.isArray(value) && value.length === 0) {
      return `${fieldName} is required`;
    }
    return undefined;
  },

  email: (value: string) => {
    if (!value) return undefined; // Let required handle empty values
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return undefined;
  },

  minLength: (min: number, fieldName: string) => (value: string) => {
    if (!value) return undefined; // Let required handle empty values
    if (value.length < min) {
      return `${fieldName} must be at least ${min} characters`;
    }
    return undefined;
  },

  maxLength: (max: number, fieldName: string) => (value: string) => {
    if (!value) return undefined; // Let required handle empty values
    if (value.length > max) {
      return `${fieldName} must be no more than ${max} characters`;
    }
    return undefined;
  },

  password: (value: string) => {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter';
    if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter';
    if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number';
    if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(value)) {
      return 'Password must contain at least one special character';
    }
    return undefined;
  },

  confirmPassword: (password: string) => (confirmPassword: string) => {
    if (!confirmPassword) return 'Please confirm your password';
    if (password !== confirmPassword) return 'Passwords do not match';
    return undefined;
  },

  name: (value: string) => {
    if (!value || !value.trim()) return 'Name is required';
    if (value.trim().length < 2) return 'Name must be at least 2 characters';
    if (value.trim().length > 50) return 'Name must be no more than 50 characters';
    if (!/^[a-zA-Z\s'-]+$/.test(value.trim())) {
      return 'Name can only contain letters, spaces, hyphens, and apostrophes';
    }
    return undefined;
  },

  role: (value: string) => {
    if (!value) return 'Please select your role';
    if (!['MENTOR', 'MENTEE'].includes(value)) return 'Please select a valid role';
    return undefined;
  },

  expertise: (value: string) => {
    if (!value || value.trim() === '') {
      return 'Please select at least one area of expertise';
    }
    const skills = value.split(',').map(s => s.trim()).filter(s => s);
    if (skills.length === 0) {
      return 'Please select at least one area of expertise';
    }
    if (skills.length > 10) {
      return 'Please select no more than 10 areas of expertise';
    }
    return undefined;
  },

  bio: (value: string) => {
    if (!value) return undefined; // Bio is optional
    if (value.length < 10) return 'Bio must be at least 10 characters';
    if (value.length > 500) return 'Bio must be no more than 500 characters';
    return undefined;
  },

  yearsExperience: (value: number) => {
    if (value === undefined || value === null) return 'Years of experience is required';
    if (typeof value !== 'number' || isNaN(value)) return 'Years of experience must be a number';
    if (value < 0) return 'Years of experience cannot be negative';
    if (value > 50) return 'Years of experience cannot exceed 50 years';
    return undefined;
  },

  institute: (value: string) => {
    if (!value || !value.trim()) return 'Institute/University is required';
    if (value.trim().length < 2) return 'Institute name must be at least 2 characters';
    if (value.trim().length > 100) return 'Institute name must be no more than 100 characters';
    return undefined;
  },

  course: (value: string) => {
    if (!value || !value.trim()) return 'Course/Program is required';
    if (value.trim().length < 2) return 'Course name must be at least 2 characters';
    if (value.trim().length > 100) return 'Course name must be no more than 100 characters';
    return undefined;
  },

  goals: (value: string) => {
    if (!value || !value.trim()) return 'Goals are required';
    if (value.trim().length < 10) return 'Goals must be at least 10 characters';
    if (value.trim().length > 500) return 'Goals must be no more than 500 characters';
    return undefined;
  },

  rating: (value: number) => {
    if (value === undefined || value === null) return 'Rating is required';
    if (typeof value !== 'number' || isNaN(value)) return 'Rating must be a number';
    if (!Number.isInteger(value)) return 'Rating must be a whole number';
    if (value < 1 || value > 5) return 'Rating must be between 1 and 5';
    return undefined;
  },

  comments: (value: string) => {
    if (!value) return undefined; // Comments are optional
    if (value.length > 500) return 'Comments must be no more than 500 characters';
    return undefined;
  },

  message: (value: string) => {
    if (!value || !value.trim()) return 'Message is required';
    if (value.trim().length < 1) return 'Message cannot be empty';
    if (value.trim().length > 1000) return 'Message must be no more than 1000 characters';
    return undefined;
  },

  url: (value: string) => {
    if (!value) return undefined; // Let required handle empty values
    try {
      new URL(value);
      return undefined;
    } catch {
      return 'Please enter a valid URL';
    }
  },

  phone: (value: string) => {
    if (!value) return undefined; // Let required handle empty values
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
      return 'Please enter a valid phone number';
    }
    return undefined;
  },

  date: (value: string | Date) => {
    if (!value) return undefined; // Let required handle empty values
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return 'Please enter a valid date';
    }
    return undefined;
  },

  futureDate: (value: string | Date) => {
    if (!value) return undefined; // Let required handle empty values
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return 'Please enter a valid date';
    }
    if (date <= new Date()) {
      return 'Date must be in the future';
    }
    return undefined;
  },

  pastDate: (value: string | Date) => {
    if (!value) return undefined; // Let required handle empty values
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return 'Please enter a valid date';
    }
    if (date >= new Date()) {
      return 'Date must be in the past';
    }
    return undefined;
  },
};

// Combine multiple validation rules
export const combineValidators = (...validators: Array<(value: any) => string | undefined>) => {
  return (value: any) => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) return error;
    }
    return undefined;
  };
};

// Validate form data against schema
export type ValidationSchema<T> = {
  [K in keyof T]?: (value: T[K], formData: T) => string | undefined;
};

export const validateFormData = <T extends Record<string, any>>(
  data: T,
  schema: ValidationSchema<T>
): { isValid: boolean; errors: Partial<Record<keyof T, string>> } => {
  const errors: Partial<Record<keyof T, string>> = {};

  Object.keys(schema).forEach(key => {
    const validator = schema[key as keyof T];
    if (validator) {
      const error = validator(data[key as keyof T], data);
      if (error) {
        errors[key as keyof T] = error;
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};