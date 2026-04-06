import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useToast } from '../contexts/ToastContext';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

// Error boundary component class that can use toast context
class ToastErrorBoundaryClass extends Component<Props & { onError: (error: Error, errorInfo: ErrorInfo) => void }, State> {
  constructor(props: Props & { onError: (error: Error, errorInfo: ErrorInfo) => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error('Toast Error Boundary caught an error:', error, errorInfo);
    
    // Update state with error info
    this.setState({ errorInfo });
    
    // Call the error handler
    this.props.onError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Component Error
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>This component encountered an error and couldn't render properly.</p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
                  className="bg-red-100 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook-based wrapper component that uses toast context
const ToastErrorBoundaryWrapper: React.FC<Props> = ({ children, fallback }) => {
  const { error: showErrorToast } = useToast();

  const handleError = (error: Error, _errorInfo: ErrorInfo) => {
    // Show toast notification for errors
    showErrorToast(
      'Component Error',
      'A component encountered an error. Please try refreshing if the issue persists.'
    );

    // In production, you might want to send error reports to a service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error reporting service
      // errorReportingService.captureException(error, { extra: _errorInfo });
      console.error('Production error:', error);
    }
  };

  return (
    <ToastErrorBoundaryClass onError={handleError} fallback={fallback}>
      {children}
    </ToastErrorBoundaryClass>
  );
};

export const ToastErrorBoundary = ToastErrorBoundaryWrapper;

// Higher-order component for wrapping components with toast-aware error boundary
export const withToastErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  const WrappedComponent = (props: P) => (
    <ToastErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ToastErrorBoundary>
  );

  WrappedComponent.displayName = `withToastErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

export default ToastErrorBoundary;