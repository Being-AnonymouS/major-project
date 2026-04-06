import { useCallback, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import { errorService, ErrorHandlerOptions } from '../services/errorService';
import { ApiException } from '../types/api';

export interface UseErrorHandlerReturn {
  handleError: (error: Error | ApiException | unknown, options?: ErrorHandlerOptions) => string;
  handleApiError: (error: ApiException, options?: ErrorHandlerOptions) => string;
  handleFormError: (error: ApiException) => Record<string, string>;
  isRetryableError: (error: ApiException) => boolean;
  getRetryDelay: (error: ApiException, attempt: number) => number;
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const { error: showErrorToast } = useToast();

  // Set up the toast handler in the error service
  useEffect(() => {
    errorService.setToastHandler(showErrorToast);
  }, [showErrorToast]);

  const handleError = useCallback((
    error: Error | ApiException | unknown,
    options?: ErrorHandlerOptions
  ): string => {
    return errorService.handleError(error, options);
  }, []);

  const handleApiError = useCallback((
    error: ApiException,
    options?: ErrorHandlerOptions
  ): string => {
    return errorService.handleApiError(error, options);
  }, []);

  const handleFormError = useCallback((error: ApiException): Record<string, string> => {
    return errorService.handleFormError(error);
  }, []);

  const isRetryableError = useCallback((error: ApiException): boolean => {
    return errorService.isRetryableError(error);
  }, []);

  const getRetryDelay = useCallback((error: ApiException, attempt: number): number => {
    return errorService.getRetryDelay(error, attempt);
  }, []);

  return {
    handleError,
    handleApiError,
    handleFormError,
    isRetryableError,
    getRetryDelay,
  };
};

export default useErrorHandler;