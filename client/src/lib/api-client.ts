import { z } from "zod";

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
    field?: string;
  };
  timestamp: string;
  requestId?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ApiError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, any>;
  public readonly field?: string;
  public readonly requestId?: string;

  constructor(
    code: string,
    message: string,
    statusCode: number,
    details?: Record<string, any>,
    field?: string,
    requestId?: string
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.field = field;
    this.requestId = requestId;
  }

  static fromResponse(response: ApiResponse, statusCode: number): ApiError {
    return new ApiError(
      response.error?.code || "UNKNOWN_ERROR",
      response.error?.message || "An unknown error occurred",
      statusCode,
      response.error?.details,
      response.error?.field,
      response.requestId
    );
  }
}

// Request configuration
export interface RequestConfig {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  validateResponse?: boolean;
}

class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private defaultTimeout: number;

  constructor(baseUrl: string = "/api") {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      "Content-Type": "application/json",
    };
    this.defaultTimeout = 30000; // 30 seconds
  }

  // Set default headers
  setHeaders(headers: Record<string, string>): void {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
  }

  // Remove header
  removeHeader(key: string): void {
    delete this.defaultHeaders[key];
  }

  // Set authentication token
  setAuthToken(token: string): void {
    this.setHeaders({ Authorization: `Bearer ${token}` });
  }

  // Remove authentication
  clearAuth(): void {
    this.removeHeader("Authorization");
  }

  // Sleep utility for retries
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Make HTTP request with comprehensive error handling and retries
  async request<T = any>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = "GET",
      headers = {},
      body,
      timeout = this.defaultTimeout,
      retries = 3,
      retryDelay = 1000,
      validateResponse = true,
    } = config;

    const url = `${this.baseUrl}${endpoint}`;
    const requestHeaders = { ...this.defaultHeaders, ...headers };

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, {
          method,
          headers: requestHeaders,
          body: method !== "GET" && body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Parse response
        let responseData: ApiResponse<T>;
        const contentType = response.headers.get("content-type");
        
        if (contentType && contentType.includes("application/json")) {
          responseData = await response.json();
        } else {
          // Handle non-JSON responses
          const text = await response.text();
          responseData = {
            success: response.ok,
            data: text as T,
            timestamp: new Date().toISOString(),
          };
        }

        // Handle HTTP errors
        if (!response.ok) {
          throw ApiError.fromResponse(responseData, response.status);
        }

        // Validate response structure if enabled
        if (validateResponse && !this.isValidApiResponse(responseData)) {
          throw new ApiError(
            "INVALID_RESPONSE",
            "Invalid response format from server",
            response.status
          );
        }

        return responseData;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on certain errors
        if (error instanceof ApiError && !this.shouldRetry(error.statusCode)) {
          throw error;
        }

        // Don't retry on abort (timeout)
        if (error instanceof Error && error.name === "AbortError") {
          throw new ApiError(
            "REQUEST_TIMEOUT",
            `Request timeout after ${timeout}ms`,
            408
          );
        }

        // If this is the last attempt, throw the error
        if (attempt === retries) {
          if (error instanceof ApiError) {
            throw error;
          }
          throw new ApiError(
            "NETWORK_ERROR",
            `Network error: ${error instanceof Error ? error.message : String(error)}`,
            0
          );
        }

        // Wait before retrying (exponential backoff)
        await this.sleep(retryDelay * Math.pow(2, attempt));
      }
    }

    // This should never be reached, but TypeScript requires it
    throw lastError || new ApiError("UNKNOWN_ERROR", "Unknown error occurred", 500);
  }

  // Check if status code should trigger a retry
  private shouldRetry(statusCode: number): boolean {
    // Retry on server errors and rate limiting
    return statusCode >= 500 || statusCode === 429 || statusCode === 408;
  }

  // Validate API response structure
  private isValidApiResponse(response: any): response is ApiResponse {
    return (
      typeof response === "object" &&
      response !== null &&
      typeof response.success === "boolean" &&
      typeof response.timestamp === "string"
    );
  }

  // Convenience methods for different HTTP verbs
  async get<T = any>(endpoint: string, config?: Omit<RequestConfig, "method">): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: "GET" });
  }

  async post<T = any>(endpoint: string, data?: any, config?: Omit<RequestConfig, "method" | "body">): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: "POST", body: data });
  }

  async put<T = any>(endpoint: string, data?: any, config?: Omit<RequestConfig, "method" | "body">): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: "PUT", body: data });
  }

  async patch<T = any>(endpoint: string, data?: any, config?: Omit<RequestConfig, "method" | "body">): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: "PATCH", body: data });
  }

  async delete<T = any>(endpoint: string, config?: Omit<RequestConfig, "method">): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: "DELETE" });
  }

  // Upload file with progress tracking
  async uploadFile<T = any>(
    endpoint: string,
    file: File,
    options: {
      onProgress?: (progress: number) => void;
      additionalData?: Record<string, any>;
    } = {}
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append("file", file);

    if (options.additionalData) {
      Object.entries(options.additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Progress tracking
      if (options.onProgress) {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100;
            options.onProgress!(progress);
          }
        });
      }

      // Handle response
      xhr.addEventListener("load", () => {
        try {
          const response: ApiResponse<T> = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(response);
          } else {
            reject(ApiError.fromResponse(response, xhr.status));
          }
        } catch (error) {
          reject(new ApiError(
            "PARSE_ERROR",
            "Failed to parse upload response",
            xhr.status
          ));
        }
      });

      // Handle network errors
      xhr.addEventListener("error", () => {
        reject(new ApiError(
          "UPLOAD_ERROR",
          "Upload failed due to network error",
          0
        ));
      });

      // Handle timeout
      xhr.addEventListener("timeout", () => {
        reject(new ApiError(
          "UPLOAD_TIMEOUT",
          "Upload timeout",
          408
        ));
      });

      // Set headers (except Content-Type for FormData)
      Object.entries(this.defaultHeaders).forEach(([key, value]) => {
        if (key.toLowerCase() !== "content-type") {
          xhr.setRequestHeader(key, value);
        }
      });

      xhr.timeout = this.defaultTimeout;
      xhr.open("POST", `${this.baseUrl}${endpoint}`);
      xhr.send(formData);
    });
  }
}

// Create default instance
export const apiClient = new ApiClient();

// Query helpers for React Query integration
export const createQueryFn = <T>(endpoint: string, config?: RequestConfig) => {
  return async (): Promise<T> => {
    const response = await apiClient.get<T>(endpoint, config);
    if (!response.success) {
      throw ApiError.fromResponse(response, 400);
    }
    return response.data!;
  };
};

export const createMutationFn = <TData, TVariables>(
  endpoint: string | ((variables: TVariables) => string),
  method: "POST" | "PUT" | "PATCH" | "DELETE" = "POST"
) => {
  return async (variables: TVariables): Promise<TData> => {
    const url = typeof endpoint === "function" ? endpoint(variables) : endpoint;
    const response = await apiClient.request<TData>(url, {
      method,
      body: method !== "DELETE" ? variables : undefined,
    });
    
    if (!response.success) {
      throw ApiError.fromResponse(response, 400);
    }
    
    return response.data!;
  };
};

// Validation helpers
export const validateAndTransform = <T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context?: string
): T => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      const field = firstError.path.join(".");
      throw new ApiError(
        "VALIDATION_ERROR",
        `${context ? `${context}: ` : ""}${field}: ${firstError.message}`,
        400,
        { zodErrors: error.errors },
        field
      );
    }
    throw error;
  }
};

export default apiClient;