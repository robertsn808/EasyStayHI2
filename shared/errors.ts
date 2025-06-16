import { z } from "zod";

// Error types
export enum ErrorCode {
  // Validation errors (4xx)
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_INPUT = "INVALID_INPUT",
  MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD",
  INVALID_FORMAT = "INVALID_FORMAT",
  
  // Authentication/Authorization errors (4xx)
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  INVALID_TOKEN = "INVALID_TOKEN",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  ACCESS_DENIED = "ACCESS_DENIED",
  
  // Resource errors (4xx)
  NOT_FOUND = "NOT_FOUND",
  DUPLICATE_RESOURCE = "DUPLICATE_RESOURCE",
  RESOURCE_CONFLICT = "RESOURCE_CONFLICT",
  RESOURCE_LOCKED = "RESOURCE_LOCKED",
  
  // Business logic errors (4xx)
  ROOM_NOT_AVAILABLE = "ROOM_NOT_AVAILABLE",
  BOOKING_CONFLICT = "BOOKING_CONFLICT",
  PAYMENT_FAILED = "PAYMENT_FAILED",
  INSUFFICIENT_BALANCE = "INSUFFICIENT_BALANCE",
  MAINTENANCE_IN_PROGRESS = "MAINTENANCE_IN_PROGRESS",
  
  // Server errors (5xx)
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR",
  CONFIGURATION_ERROR = "CONFIGURATION_ERROR",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
}

export interface ErrorDetails {
  code: ErrorCode;
  message: string;
  statusCode: number;
  details?: Record<string, any>;
  timestamp?: string;
  requestId?: string;
  field?: string;
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: Record<string, any>;
  public readonly timestamp: string;
  public readonly requestId?: string;
  public readonly field?: string;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number = 500,
    details?: Record<string, any>,
    requestId?: string,
    field?: string
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.requestId = requestId;
    this.field = field;

    // Ensure the prototype chain is correct
    Object.setPrototypeOf(this, AppError.prototype);
  }

  toJSON(): ErrorDetails {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp,
      requestId: this.requestId,
      field: this.field,
    };
  }
}

// Validation Error Handler
export class ValidationError extends AppError {
  constructor(
    message: string,
    field?: string,
    details?: Record<string, any>,
    requestId?: string
  ) {
    super(ErrorCode.VALIDATION_ERROR, message, 400, details, requestId, field);
    this.name = "ValidationError";
  }

  static fromZodError(error: z.ZodError, requestId?: string): ValidationError {
    const firstError = error.errors[0];
    const field = firstError.path.join(".");
    const message = `${field}: ${firstError.message}`;
    
    return new ValidationError(
      message,
      field,
      { zodErrors: error.errors },
      requestId
    );
  }
}

// Authentication Error
export class AuthenticationError extends AppError {
  constructor(
    message: string = "Authentication required",
    details?: Record<string, any>,
    requestId?: string
  ) {
    super(ErrorCode.UNAUTHORIZED, message, 401, details, requestId);
    this.name = "AuthenticationError";
  }
}

// Authorization Error
export class AuthorizationError extends AppError {
  constructor(
    message: string = "Access denied",
    details?: Record<string, any>,
    requestId?: string
  ) {
    super(ErrorCode.FORBIDDEN, message, 403, details, requestId);
    this.name = "AuthorizationError";
  }
}

// Resource Not Found Error
export class NotFoundError extends AppError {
  constructor(
    resource: string,
    identifier?: string | number,
    requestId?: string
  ) {
    const message = identifier 
      ? `${resource} with ID ${identifier} not found`
      : `${resource} not found`;
    
    super(ErrorCode.NOT_FOUND, message, 404, { resource, identifier }, requestId);
    this.name = "NotFoundError";
  }
}

// Database Error
export class DatabaseError extends AppError {
  constructor(
    message: string,
    originalError?: Error,
    requestId?: string
  ) {
    super(
      ErrorCode.DATABASE_ERROR,
      message,
      500,
      { originalError: originalError?.message, stack: originalError?.stack },
      requestId
    );
    this.name = "DatabaseError";
  }
}

// External Service Error
export class ExternalServiceError extends AppError {
  constructor(
    service: string,
    message: string,
    statusCode: number = 502,
    details?: Record<string, any>,
    requestId?: string
  ) {
    super(
      ErrorCode.EXTERNAL_SERVICE_ERROR,
      `${service}: ${message}`,
      statusCode,
      { service, ...details },
      requestId
    );
    this.name = "ExternalServiceError";
  }
}

// Business Logic Errors
export class BusinessError extends AppError {
  constructor(
    code: ErrorCode,
    message: string,
    details?: Record<string, any>,
    requestId?: string
  ) {
    super(code, message, 422, details, requestId);
    this.name = "BusinessError";
  }
}

// Rate Limit Error
export class RateLimitError extends AppError {
  constructor(
    limit: number,
    windowMs: number,
    requestId?: string
  ) {
    super(
      ErrorCode.RATE_LIMIT_EXCEEDED,
      `Rate limit exceeded: ${limit} requests per ${windowMs / 1000} seconds`,
      429,
      { limit, windowMs },
      requestId
    );
    this.name = "RateLimitError";
  }
}

// Error factory functions
export const createValidationError = (
  message: string,
  field?: string,
  requestId?: string
) => new ValidationError(message, field, undefined, requestId);

export const createNotFoundError = (
  resource: string,
  identifier?: string | number,
  requestId?: string
) => new NotFoundError(resource, identifier, requestId);

export const createDatabaseError = (
  message: string,
  originalError?: Error,
  requestId?: string
) => new DatabaseError(message, originalError, requestId);

export const createBusinessError = (
  code: ErrorCode,
  message: string,
  details?: Record<string, any>,
  requestId?: string
) => new BusinessError(code, message, details, requestId);

// Error response formatter
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    field?: string;
  };
  timestamp: string;
  requestId?: string;
}

export const formatErrorResponse = (error: AppError): ErrorResponse => ({
  success: false,
  error: {
    code: error.code,
    message: error.message,
    details: error.details,
    field: error.field,
  },
  timestamp: error.timestamp,
  requestId: error.requestId,
});

// Success response formatter
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  timestamp: string;
  requestId?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const formatSuccessResponse = <T>(
  data: T,
  requestId?: string,
  pagination?: SuccessResponse["pagination"]
): SuccessResponse<T> => ({
  success: true,
  data,
  timestamp: new Date().toISOString(),
  requestId,
  pagination,
});

// Async error handler wrapper
export const asyncHandler = <T extends any[], R>(
  fn: (...args: T) => Promise<R>
) => {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      // Handle Zod validation errors
      if (error instanceof z.ZodError) {
        throw ValidationError.fromZodError(error);
      }
      
      // Handle database errors
      if (error instanceof Error && error.message.includes("database")) {
        throw new DatabaseError(error.message, error);
      }
      
      // Default to internal server error
      throw new AppError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        error instanceof Error ? error.message : "An unexpected error occurred",
        500,
        { originalError: error instanceof Error ? error.stack : String(error) }
      );
    }
  };
};

// Error severity levels for logging
export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export const getErrorSeverity = (error: AppError): ErrorSeverity => {
  switch (error.code) {
    case ErrorCode.INTERNAL_SERVER_ERROR:
    case ErrorCode.DATABASE_ERROR:
    case ErrorCode.CONFIGURATION_ERROR:
      return ErrorSeverity.CRITICAL;
    
    case ErrorCode.EXTERNAL_SERVICE_ERROR:
    case ErrorCode.PAYMENT_FAILED:
    case ErrorCode.MAINTENANCE_IN_PROGRESS:
      return ErrorSeverity.HIGH;
    
    case ErrorCode.UNAUTHORIZED:
    case ErrorCode.FORBIDDEN:
    case ErrorCode.RATE_LIMIT_EXCEEDED:
    case ErrorCode.RESOURCE_CONFLICT:
      return ErrorSeverity.MEDIUM;
    
    default:
      return ErrorSeverity.LOW;
  }
};