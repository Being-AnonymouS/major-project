import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse, ApiException } from '../types/api';

interface RetryConfig {
  retries: number;
  retryDelay: number;
  retryCondition?: (error: AxiosError) => boolean;
}

interface RetryableAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

class ApiClient {
  private client: AxiosInstance;
  private defaultRetryConfig: RetryConfig = {
    retries: 3,
    retryDelay: 1000,
    retryCondition: (error: AxiosError) => {
      // Don't retry authentication failures (401) or client errors (4xx)
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        return false;
      }
      // Retry on network errors or 5xx server errors
      return !error.response || (error.response.status >= 500 && error.response.status < 600);
    },
  };

  constructor() {
    const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
    const resolvedBaseUrl = configuredApiUrl && configuredApiUrl.length > 0
      ? configuredApiUrl
      : '/api';

    this.client = axios.create({
      baseURL: resolvedBaseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling and token refresh
    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse<any>>) => {
        // Check for token refresh in response headers
        const newToken = response.headers['x-new-access-token'];
        if (newToken) {
          localStorage.setItem('token', newToken);
        }
        return response;
      },
      async (error: AxiosError<ApiResponse<any>>) => {
        const originalRequest = error.config as RetryableAxiosRequestConfig;

        // Check if this is a 401 error and we haven't already tried to refresh
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Try to refresh the token
            const newToken = await this.refreshToken();
            if (newToken) {
              // Update the authorization header and retry the request
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.client.request(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            if (!window.location.pathname.includes('/login') && 
                !window.location.pathname.includes('/register')) {
              window.location.replace('/login');
            }
            return Promise.reject(refreshError);
          }
        }

        return this.handleError(error);
      }
    );
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async retryRequest<T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    config: RetryConfig = this.defaultRetryConfig
  ): Promise<AxiosResponse<T>> {
    let lastError: AxiosError;

    for (let attempt = 0; attempt <= config.retries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error as AxiosError;

        // Don't retry if it's the last attempt or if retry condition is not met
        if (attempt === config.retries || !config.retryCondition?.(lastError)) {
          break;
        }

        // Wait before retrying with exponential backoff
        const delay = config.retryDelay * Math.pow(2, attempt);
        await this.delay(delay);
      }
    }

    throw lastError!;
  }

  private handleError(error: AxiosError<ApiResponse<any>>): Promise<never> {
    let message = 'An unexpected error occurred';
    let code = 'UNKNOWN_ERROR';
    let status = 500;

    if (error.response) {
      // Server responded with error status
      status = error.response.status;
      
      if (error.response.data?.error) {
        message = error.response.data.error.message;
        code = error.response.data.error.code;
      } else {
        switch (status) {
          case 401:
            message = error.response.data?.error?.message || 'Authentication required';
            code = error.response.data?.error?.code || 'UNAUTHORIZED';
            // Only clear token and redirect if this is NOT a login attempt and we're not already on auth pages
            if (!error.config?.url?.includes('/auth/login') && 
                !error.config?.url?.includes('/auth/register') &&
                !window.location.pathname.includes('/login') && 
                !window.location.pathname.includes('/register')) {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              // Use replace to avoid adding to history and prevent back button issues
              window.location.replace('/login');
            }
            break;
          case 403:
            message = 'Access forbidden';
            code = 'FORBIDDEN';
            break;
          case 404:
            message = 'Resource not found';
            code = 'NOT_FOUND';
            break;
          case 422:
            message = 'Validation error';
            code = 'VALIDATION_ERROR';
            break;
          case 429:
            message = 'Too many requests - please try again later';
            code = 'RATE_LIMITED';
            break;
          case 500:
            message = 'Internal server error';
            code = 'SERVER_ERROR';
            break;
          case 502:
            message = 'Service temporarily unavailable';
            code = 'BAD_GATEWAY';
            break;
          case 503:
            message = 'Service temporarily unavailable';
            code = 'SERVICE_UNAVAILABLE';
            break;
          case 504:
            message = 'Request timeout - please try again';
            code = 'GATEWAY_TIMEOUT';
            break;
        }
      }
    } else if (error.request) {
      // Network error
      if (error.code === 'ECONNABORTED') {
        message = 'Request timeout - please try again';
        code = 'TIMEOUT';
      } else {
        message = 'Network error - please check your connection';
        code = 'NETWORK_ERROR';
      }
      status = 0;
    } else {
      // Request setup error
      message = 'Request configuration error';
      code = 'REQUEST_ERROR';
    }

    const apiError = new ApiException(message, code, status, error.response?.data);
    return Promise.reject(apiError);
  }

  async get<T>(url: string, params?: any, retryConfig?: Partial<RetryConfig>): Promise<T> {
    const config = { ...this.defaultRetryConfig, ...retryConfig };
    const response = await this.retryRequest(
      () => this.client.get<ApiResponse<T>>(url, { params }),
      config
    );
    
    if (response.data.success && response.data.data !== undefined) {
      return response.data.data;
    }
    throw new ApiException(
      response.data.error?.message || 'Request failed',
      response.data.error?.code || 'REQUEST_FAILED',
      response.status
    );
  }

  async post<T>(url: string, data?: any, retryConfig?: Partial<RetryConfig>): Promise<T> {
    const config = { 
      ...this.defaultRetryConfig, 
      ...retryConfig,
      // Don't retry POST requests by default to avoid duplicate operations
      retries: retryConfig?.retries ?? 0
    };
    
    const response = await this.retryRequest(
      () => this.client.post<ApiResponse<T>>(url, data),
      config
    );
    
    if (response.data.success) {
      // For void operations (like logout), data can be null
      return response.data.data as T;
    }
    throw new ApiException(
      response.data.error?.message || 'Request failed',
      response.data.error?.code || 'REQUEST_FAILED',
      response.status
    );
  }

  async put<T>(url: string, data?: any, retryConfig?: Partial<RetryConfig>): Promise<T> {
    const config = { 
      ...this.defaultRetryConfig, 
      ...retryConfig,
      // Don't retry PUT requests by default to avoid duplicate operations
      retries: retryConfig?.retries ?? 0
    };
    
    const response = await this.retryRequest(
      () => this.client.put<ApiResponse<T>>(url, data),
      config
    );
    
    if (response.data.success && response.data.data !== undefined) {
      return response.data.data;
    }
    throw new ApiException(
      response.data.error?.message || 'Request failed',
      response.data.error?.code || 'REQUEST_FAILED',
      response.status
    );
  }

  async delete<T>(url: string, retryConfig?: Partial<RetryConfig>): Promise<T> {
    const config = { 
      ...this.defaultRetryConfig, 
      ...retryConfig,
      // Don't retry DELETE requests by default to avoid duplicate operations
      retries: retryConfig?.retries ?? 0
    };
    
    const response = await this.retryRequest(
      () => this.client.delete<ApiResponse<T>>(url),
      config
    );
    
    if (response.data.success && response.data.data !== undefined) {
      return response.data.data;
    }
    throw new ApiException(
      response.data.error?.message || 'Request failed',
      response.data.error?.code || 'REQUEST_FAILED',
      response.status
    );
  }

  // Method to check if the API is reachable
  async healthCheck(): Promise<boolean> {
    try {
      await this.get('/health', undefined, { retries: 1, retryDelay: 500 });
      return true;
    } catch {
      return false;
    }
  }

  // Method to refresh token
  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        return null;
      }

      const response = await this.client.post<ApiResponse<{ accessToken: string }>>('/auth/refresh', {
        refreshToken
      });

      if (response.data.success && response.data.data?.accessToken) {
        const newToken = response.data.data.accessToken;
        localStorage.setItem('token', newToken);
        return newToken;
      }
      return null;
    } catch (error) {
      console.error('Token refresh failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      return null;
    }
  }
}

export const apiClient = new ApiClient();