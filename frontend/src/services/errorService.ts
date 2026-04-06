import { ApiException } from '../types/api';

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  fallbackMessage?: string;
}

export class ErrorService {
  private static instance: ErrorService;
  private toastHandler?: (title: string, message?: string) => void;

  private constructor() {}

  public static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }
    return ErrorService.instance;
  }

  public setToastHandler(handler: (title: string, message?: string) => void): void {
    this.toastHandler = handler;
  }

  public handleError(
    error: Error | ApiException | unknown,
    options: ErrorHandlerOptions = {}
  ): string {
    const {
      showToast = true,
      logError = true,
      fallbackMessage = 'An unexpected error occurred'
    } = options;

    let errorMessage = fallbackMessage;
    let errorTitle = 'Error';

    // Extract error information
    if (error instanceof ApiException) {
      errorMessage = error.message;
      errorTitle = this.getErrorTitle(error.code);
      
      if (logError) {
        console.error('API Error:', {
          message: error.message,
          code: error.code,
          status: error.status,
          details: error.details,
        });
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
      
      if (logError) {
        console.error('Application Error:', error);
      }
    } else if (typeof error === 'string') {
      errorMessage = error;
      
      if (logError) {
        console.error('String Error:', error);
      }
    } else {
      if (logError) {
        console.error('Unknown Error:', error);
      }
    }

    // Show toast notification if enabled and handler is available
    if (showToast && this.toastHandler) {
      this.toastHandler(errorTitle, errorMessage);
    }

    return errorMessage;
  }

  public handleApiError(error: ApiException, options: ErrorHandlerOptions = {}): string {
    const customOptions = {
      ...options,
      showToast: options.showToast !== false, // Default to true
    };

    // Handle specific error codes with custom messages
    switch (error.code) {
      case 'NETWORK_ERROR':
        return this.handleError(
          new Error('Please check your internet connection and try again'),
          customOptions
        );
      
      case 'TIMEOUT':
        return this.handleError(
          new Error('Request timed out. Please try again'),
          customOptions
        );
      
      case 'UNAUTHORIZED':
        return this.handleError(
          new Error('Please log in to continue'),
          { ...customOptions, showToast: false } // Don't show toast for auth errors
        );
      
      case 'FORBIDDEN':
        return this.handleError(
          new Error('You do not have permission to perform this action'),
          customOptions
        );
      
      case 'VALIDATION_ERROR':
        // For validation errors, we might want to handle them differently
        return this.handleError(error, customOptions);
      
      case 'RATE_LIMITED':
        return this.handleError(
          new Error('Too many requests. Please wait a moment and try again'),
          customOptions
        );
      
      case 'SERVER_ERROR':
      case 'BAD_GATEWAY':
      case 'SERVICE_UNAVAILABLE':
        return this.handleError(
          new Error('Server is temporarily unavailable. Please try again later'),
          customOptions
        );
      
      default:
        return this.handleError(error, customOptions);
    }
  }

  public handleFormError(error: ApiException): Record<string, string> {
    const fieldErrors: Record<string, string> = {};

    if (error.code === 'VALIDATION_ERROR' && error.details) {
      // Handle validation errors with field-specific messages
      if (Array.isArray(error.details)) {
        // Backend returns array of error messages
        error.details.forEach((detail: string) => {
          // Try to extract field name from error message
          const fieldMatch = detail.match(/^(\w+):\s*(.+)$/);
          if (fieldMatch) {
            fieldErrors[fieldMatch[1]] = fieldMatch[2];
          } else {
            // Generic error
            fieldErrors.general = detail;
          }
        });
      } else if (typeof error.details === 'object') {
        // Backend returns object with field names as keys
        Object.entries(error.details).forEach(([field, message]) => {
          fieldErrors[field] = String(message);
        });
      }
    }

    // If no field-specific errors, create a general error
    if (Object.keys(fieldErrors).length === 0) {
      fieldErrors.general = error.message;
    }

    return fieldErrors;
  }

  private getErrorTitle(errorCode: string): string {
    switch (errorCode) {
      case 'NETWORK_ERROR':
        return 'Connection Error';
      case 'TIMEOUT':
        return 'Request Timeout';
      case 'UNAUTHORIZED':
        return 'Authentication Required';
      case 'FORBIDDEN':
        return 'Access Denied';
      case 'NOT_FOUND':
        return 'Not Found';
      case 'VALIDATION_ERROR':
        return 'Validation Error';
      case 'CONFLICT_ERROR':
        return 'Conflict';
      case 'RATE_LIMITED':
        return 'Rate Limited';
      case 'SERVER_ERROR':
      case 'BAD_GATEWAY':
      case 'SERVICE_UNAVAILABLE':
        return 'Server Error';
      default:
        return 'Error';
    }
  }

  // Utility method to check if error is retryable
  public isRetryableError(error: ApiException): boolean {
    const retryableCodes = [
      'NETWORK_ERROR',
      'TIMEOUT',
      'SERVER_ERROR',
      'BAD_GATEWAY',
      'SERVICE_UNAVAILABLE',
      'GATEWAY_TIMEOUT'
    ];
    
    return retryableCodes.includes(error.code);
  }

  // Utility method to get retry delay based on error type
  public getRetryDelay(error: ApiException, attempt: number): number {
    const baseDelay = 1000; // 1 second
    const maxDelay = 30000; // 30 seconds

    switch (error.code) {
      case 'RATE_LIMITED':
        return Math.min(baseDelay * Math.pow(2, attempt + 2), maxDelay); // Longer delay for rate limits
      case 'NETWORK_ERROR':
      case 'TIMEOUT':
        return Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      default:
        return Math.min(baseDelay * Math.pow(1.5, attempt), maxDelay);
    }
  }
}

// Export singleton instance
export const errorService = ErrorService.getInstance();