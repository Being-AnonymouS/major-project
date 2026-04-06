export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: any;
  };
  message?: string;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: any;
}

export class ApiException extends Error {
  public code: string;
  public status: number;
  public details?: any;

  constructor(message: string, code: string, status: number, details?: any) {
    super(message);
    this.name = 'ApiException';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}