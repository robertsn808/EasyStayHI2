import { ErrorSeverity, AppError, getErrorSeverity } from "./errors";

// Log levels
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

// Log entry structure
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  requestId?: string;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  duration?: number;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
    severity?: ErrorSeverity;
  };
}

// Logger configuration
export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  enableDatabase: boolean;
  format: "json" | "text";
  maxFileSize: number;
  maxFiles: number;
  includeStack: boolean;
}

// Default configuration
const defaultConfig: LoggerConfig = {
  level: process.env.NODE_ENV === "production" ? LogLevel.INFO : LogLevel.DEBUG,
  enableConsole: true,
  enableFile: process.env.NODE_ENV === "production",
  enableDatabase: false,
  format: process.env.NODE_ENV === "production" ? "json" : "text",
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
  includeStack: process.env.NODE_ENV !== "production",
};

class Logger {
  private config: LoggerConfig;
  private context: Record<string, any> = {};

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  // Set global context that will be included in all logs
  setContext(context: Record<string, any>): void {
    this.context = { ...this.context, ...context };
  }

  // Clear context
  clearContext(): void {
    this.context = {};
  }

  // Create child logger with additional context
  child(context: Record<string, any>): Logger {
    const childLogger = new Logger(this.config);
    childLogger.setContext({ ...this.context, ...context });
    return childLogger;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level;
  }

  private formatMessage(level: LogLevel, message: string, context?: Record<string, any>): string {
    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];

    if (this.config.format === "json") {
      const logEntry: LogEntry = {
        timestamp,
        level,
        message,
        context: { ...this.context, ...context },
      };
      return JSON.stringify(logEntry);
    } else {
      const contextStr = context ? ` ${JSON.stringify({ ...this.context, ...context })}` : "";
      return `[${timestamp}] ${levelName}: ${message}${contextStr}`;
    }
  }

  private writeLog(level: LogLevel, message: string, context?: Record<string, any>): void {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, context);

    if (this.config.enableConsole) {
      this.writeToConsole(level, formattedMessage);
    }

    if (this.config.enableFile) {
      this.writeToFile(formattedMessage);
    }

    if (this.config.enableDatabase) {
      this.writeToDatabase(level, message, context);
    }
  }

  private writeToConsole(level: LogLevel, message: string): void {
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(message);
        break;
      case LogLevel.INFO:
        console.info(message);
        break;
      case LogLevel.WARN:
        console.warn(message);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(message);
        break;
    }
  }

  private writeToFile(message: string): void {
    // In a real implementation, this would write to rotating log files
    // For now, we'll use console as a placeholder
    if (process.env.NODE_ENV === "production") {
      console.log(message);
    }
  }

  private async writeToDatabase(level: LogLevel, message: string, context?: Record<string, any>): Promise<void> {
    // In a real implementation, this would write to a database table
    // For now, we'll skip this to avoid dependencies
  }

  // Core logging methods
  debug(message: string, context?: Record<string, any>): void {
    this.writeLog(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.writeLog(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.writeLog(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error | AppError, context?: Record<string, any>): void {
    const errorContext = error ? this.formatError(error) : {};
    this.writeLog(LogLevel.ERROR, message, { ...context, ...errorContext });
  }

  fatal(message: string, error?: Error | AppError, context?: Record<string, any>): void {
    const errorContext = error ? this.formatError(error) : {};
    this.writeLog(LogLevel.FATAL, message, { ...context, ...errorContext });
  }

  private formatError(error: Error | AppError): { error: LogEntry["error"] } {
    const errorInfo: LogEntry["error"] = {
      name: error.name,
      message: error.message,
    };

    if (this.config.includeStack && error.stack) {
      errorInfo.stack = error.stack;
    }

    if (error instanceof AppError) {
      errorInfo.code = error.code;
      errorInfo.severity = getErrorSeverity(error);
    }

    return { error: errorInfo };
  }

  // HTTP request logging
  logRequest(req: any, res: any, duration: number): void {
    const context = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get("User-Agent"),
      ipAddress: req.ip || req.connection.remoteAddress,
      requestId: req.requestId,
      userId: req.user?.id,
    };

    const message = `${req.method} ${req.url} ${res.statusCode} - ${duration}ms`;
    
    if (res.statusCode >= 500) {
      this.error(message, undefined, context);
    } else if (res.statusCode >= 400) {
      this.warn(message, context);
    } else {
      this.info(message, context);
    }
  }

  // Database operation logging
  logDatabaseOperation(operation: string, table: string, duration: number, success: boolean, error?: Error): void {
    const context = {
      operation,
      table,
      duration,
      success,
    };

    const message = `Database ${operation} on ${table} - ${duration}ms`;

    if (!success && error) {
      this.error(message, error, context);
    } else {
      this.debug(message, context);
    }
  }

  // Security event logging
  logSecurityEvent(event: string, details: Record<string, any>): void {
    this.warn(`Security Event: ${event}`, details);
  }

  // Performance logging
  logPerformance(operation: string, duration: number, metadata?: Record<string, any>): void {
    const context = {
      operation,
      duration,
      ...metadata,
    };

    if (duration > 5000) { // Log slow operations (>5s)
      this.warn(`Slow operation: ${operation} - ${duration}ms`, context);
    } else if (duration > 1000) { // Log moderate operations (>1s)
      this.info(`Operation: ${operation} - ${duration}ms`, context);
    } else {
      this.debug(`Operation: ${operation} - ${duration}ms`, context);
    }
  }

  // Business event logging
  logBusinessEvent(event: string, details: Record<string, any>): void {
    this.info(`Business Event: ${event}`, details);
  }
}

// Create default logger instance
export const logger = new Logger();

// Performance monitoring decorator
export function logPerformance(operation: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const start = Date.now();
      const requestId = args[0]?.requestId || "unknown";
      
      try {
        const result = await originalMethod.apply(this, args);
        const duration = Date.now() - start;
        
        logger.logPerformance(`${target.constructor.name}.${propertyKey}`, duration, {
          operation,
          requestId,
          success: true,
        });
        
        return result;
      } catch (error) {
        const duration = Date.now() - start;
        
        logger.logPerformance(`${target.constructor.name}.${propertyKey}`, duration, {
          operation,
          requestId,
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
        
        throw error;
      }
    };

    return descriptor;
  };
}

// Request ID middleware helper
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Structured logging for specific domains
export const auditLogger = logger.child({ domain: "audit" });
export const securityLogger = logger.child({ domain: "security" });
export const performanceLogger = logger.child({ domain: "performance" });
export const businessLogger = logger.child({ domain: "business" });

export default logger;