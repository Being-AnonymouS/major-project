import React, { useState } from 'react';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { useFormValidation } from '../hooks/useFormValidation';
import { validationRules } from '../utils/validation';
import { ApiException } from '../types/api';
import { FormField } from './ui/FormField';
import { Button } from './ui/Button';
import { LoadingSpinner } from './ui/LoadingSpinner';

interface DemoFormData {
  email: string;
  password: string;
  name: string;
}

export const ErrorHandlingDemo: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { handleError, handleApiError, handleFormError } = useErrorHandler();

  const {
    values,
    errors,
    isValid,
    isValidating,
    handleChange,
    handleBlur,
    validateForm,
    setErrors,
    reset,
  } = useFormValidation<DemoFormData>({
    initialValues: {
      email: '',
      password: '',
      name: '',
    },
    validationRules: [
      {
        field: 'email',
        validate: (value) => {
          const required = validationRules.required('Email')(value);
          if (required) return required;
          return validationRules.email(value);
        },
      },
      {
        field: 'password',
        validate: validationRules.password,
      },
      {
        field: 'name',
        validate: validationRules.name,
      },
    ],
    validateOnBlur: true,
  });

  const simulateNetworkError = () => {
    const networkError = new ApiException(
      'Network connection failed',
      'NETWORK_ERROR',
      0
    );
    handleApiError(networkError);
  };

  const simulateValidationError = () => {
    const validationError = new ApiException(
      'Validation failed',
      'VALIDATION_ERROR',
      400,
      ['Email is already taken', 'Password is too weak']
    );
    const fieldErrors = handleFormError(validationError);
    setErrors(fieldErrors);
  };

  const simulateServerError = () => {
    const serverError = new ApiException(
      'Internal server error',
      'SERVER_ERROR',
      500
    );
    handleApiError(serverError);
  };

  const simulateRateLimitError = () => {
    const rateLimitError = new ApiException(
      'Too many requests',
      'RATE_LIMITED',
      429
    );
    handleApiError(rateLimitError);
  };

  const simulateGenericError = () => {
    const genericError = new Error('Something went wrong');
    handleError(genericError);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    
    try {
      const isFormValid = await validateForm();
      
      if (!isFormValid) {
        handleError(new Error('Please fix the form errors before submitting'), {
          showToast: true,
        });
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate success
      handleError(new Error('Form submitted successfully!'), {
        showToast: true,
      });
      
      reset();
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Error Handling & Validation Demo
      </h2>
      
      <div className="space-y-6">
        {/* Form Section */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Form Validation Demo
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              label="Email"
              name="email"
              type="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.email}
              placeholder="Enter your email"
              required
            />
            
            <FormField
              label="Password"
              name="password"
              type="password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.password}
              placeholder="Enter your password"
              required
              helpText="Must contain uppercase, lowercase, number, and special character"
            />
            
            <FormField
              label="Name"
              name="name"
              type="text"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.name}
              placeholder="Enter your full name"
              required
            />
            
            <Button
              type="submit"
              disabled={!isValid || isValidating || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Submitting...
                </>
              ) : (
                'Submit Form'
              )}
            </Button>
          </form>
        </div>

        {/* Error Simulation Section */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Error Simulation Demo
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              onClick={simulateNetworkError}
              variant="outline"
              className="text-sm"
            >
              Network Error
            </Button>
            
            <Button
              onClick={simulateValidationError}
              variant="outline"
              className="text-sm"
            >
              Validation Error
            </Button>
            
            <Button
              onClick={simulateServerError}
              variant="outline"
              className="text-sm"
            >
              Server Error
            </Button>
            
            <Button
              onClick={simulateRateLimitError}
              variant="outline"
              className="text-sm"
            >
              Rate Limit Error
            </Button>
            
            <Button
              onClick={simulateGenericError}
              variant="outline"
              className="text-sm"
            >
              Generic Error
            </Button>
            
            <Button
              onClick={() => {
                throw new Error('Component Error');
              }}
              variant="outline"
              className="text-sm"
            >
              Component Error
            </Button>
          </div>
        </div>

        {/* Status Section */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Form Status
          </h3>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Valid:</span>{' '}
              <span className={isValid ? 'text-green-600' : 'text-red-600'}>
                {isValid ? 'Yes' : 'No'}
              </span>
            </div>
            
            <div>
              <span className="font-medium">Validating:</span>{' '}
              <span className={isValidating ? 'text-yellow-600' : 'text-gray-600'}>
                {isValidating ? 'Yes' : 'No'}
              </span>
            </div>
            
            <div>
              <span className="font-medium">Errors:</span>{' '}
              <span className="text-red-600">
                {Object.keys(errors).length}
              </span>
            </div>
            
            <div>
              <span className="font-medium">Loading:</span>{' '}
              <span className={isLoading ? 'text-blue-600' : 'text-gray-600'}>
                {isLoading ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorHandlingDemo;