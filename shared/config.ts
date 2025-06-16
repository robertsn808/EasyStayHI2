import { z } from "zod";

// Environment schema
const envSchema = z.object({
  // Server configuration
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.string().regex(/^\d+$/).transform(Number).default("5000"),
  HOST: z.string().default("0.0.0.0"),
  
  // Database configuration
  DATABASE_URL: z.string().url("Invalid database URL"),
  DB_POOL_MIN: z.string().regex(/^\d+$/).transform(Number).default("2"),
  DB_POOL_MAX: z.string().regex(/^\d+$/).transform(Number).default("10"),
  DB_TIMEOUT: z.string().regex(/^\d+$/).transform(Number).default("30000"),
  
  // Session configuration
  SESSION_SECRET: z.string().min(32, "Session secret must be at least 32 characters"),
  SESSION_MAX_AGE: z.string().regex(/^\d+$/).transform(Number).default("86400000"), // 24 hours
  SESSION_SECURE: z.string().transform(val => val === "true").default("false"),
  
  // Authentication configuration
  JWT_SECRET: z.string().min(32, "JWT secret must be at least 32 characters").optional(),
  JWT_EXPIRES_IN: z.string().default("24h"),
  ADMIN_USERNAME: z.string().min(3, "Admin username too short").default("admin"),
  ADMIN_PASSWORD: z.string().min(8, "Admin password too short").default("password123"),
  
  // Security configuration
  RATE_LIMIT_WINDOW: z.string().regex(/^\d+$/).transform(Number).default("900000"), // 15 minutes
  RATE_LIMIT_MAX: z.string().regex(/^\d+$/).transform(Number).default("100"),
  BCRYPT_ROUNDS: z.string().regex(/^\d+$/).transform(Number).default("12"),
  
  // External services
  RAPID_API_KEY: z.string().optional(),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  SENDGRID_API_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  
  // Logging configuration
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error", "fatal"]).default("info"),
  LOG_FORMAT: z.enum(["json", "text"]).default("json"),
  LOG_FILE_ENABLED: z.string().transform(val => val === "true").default("false"),
  LOG_DATABASE_ENABLED: z.string().transform(val => val === "true").default("false"),
  
  // File upload configuration
  MAX_FILE_SIZE: z.string().regex(/^\d+$/).transform(Number).default("10485760"), // 10MB
  ALLOWED_FILE_TYPES: z.string().default("image/jpeg,image/png,image/gif,application/pdf"),
  UPLOAD_DIR: z.string().default("uploads"),
  
  // Application configuration
  BASE_URL: z.string().url().default("http://localhost:5000"),
  FRONTEND_URL: z.string().url().default("http://localhost:5173"),
  CORS_ORIGINS: z.string().default("http://localhost:5173,http://localhost:3000"),
  
  // Feature flags
  ENABLE_ANALYTICS: z.string().transform(val => val === "true").default("false"),
  ENABLE_MAINTENANCE_MODE: z.string().transform(val => val === "true").default("false"),
  ENABLE_RATE_LIMITING: z.string().transform(val => val === "true").default("true"),
  ENABLE_REQUEST_LOGGING: z.string().transform(val => val === "true").default("true"),
  
  // Performance configuration
  CACHE_TTL: z.string().regex(/^\d+$/).transform(Number).default("300000"), // 5 minutes
  REQUEST_TIMEOUT: z.string().regex(/^\d+$/).transform(Number).default("30000"), // 30 seconds
  MAX_CONCURRENT_REQUESTS: z.string().regex(/^\d+$/).transform(Number).default("100"),
});

// Parse and validate environment variables
function loadConfig() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Configuration validation failed:");
      error.errors.forEach(err => {
        console.error(`  ${err.path.join(".")}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
}

export const config = loadConfig();

// Type inference
export type Config = z.infer<typeof envSchema>;

// Configuration sections
export const serverConfig = {
  nodeEnv: config.NODE_ENV,
  port: config.PORT,
  host: config.HOST,
  baseUrl: config.BASE_URL,
  frontendUrl: config.FRONTEND_URL,
  corsOrigins: config.CORS_ORIGINS.split(","),
  requestTimeout: config.REQUEST_TIMEOUT,
  maxConcurrentRequests: config.MAX_CONCURRENT_REQUESTS,
};

export const databaseConfig = {
  url: config.DATABASE_URL,
  poolMin: config.DB_POOL_MIN,
  poolMax: config.DB_POOL_MAX,
  timeout: config.DB_TIMEOUT,
};

export const authConfig = {
  sessionSecret: config.SESSION_SECRET,
  sessionMaxAge: config.SESSION_MAX_AGE,
  sessionSecure: config.SESSION_SECURE,
  jwtSecret: config.JWT_SECRET,
  jwtExpiresIn: config.JWT_EXPIRES_IN,
  adminUsername: config.ADMIN_USERNAME,
  adminPassword: config.ADMIN_PASSWORD,
  bcryptRounds: config.BCRYPT_ROUNDS,
};

export const securityConfig = {
  rateLimitWindow: config.RATE_LIMIT_WINDOW,
  rateLimitMax: config.RATE_LIMIT_MAX,
  enableRateLimiting: config.ENABLE_RATE_LIMITING,
};

export const loggingConfig = {
  level: config.LOG_LEVEL,
  format: config.LOG_FORMAT,
  fileEnabled: config.LOG_FILE_ENABLED,
  databaseEnabled: config.LOG_DATABASE_ENABLED,
  enableRequestLogging: config.ENABLE_REQUEST_LOGGING,
};

export const uploadConfig = {
  maxFileSize: config.MAX_FILE_SIZE,
  allowedFileTypes: config.ALLOWED_FILE_TYPES.split(","),
  uploadDir: config.UPLOAD_DIR,
};

export const externalServicesConfig = {
  rapidApiKey: config.RAPID_API_KEY,
  twilio: {
    accountSid: config.TWILIO_ACCOUNT_SID,
    authToken: config.TWILIO_AUTH_TOKEN,
    phoneNumber: config.TWILIO_PHONE_NUMBER,
  },
  sendgrid: {
    apiKey: config.SENDGRID_API_KEY,
  },
  stripe: {
    secretKey: config.STRIPE_SECRET_KEY,
  },
};

export const featureFlags = {
  analytics: config.ENABLE_ANALYTICS,
  maintenanceMode: config.ENABLE_MAINTENANCE_MODE,
  rateLimiting: config.ENABLE_RATE_LIMITING,
  requestLogging: config.ENABLE_REQUEST_LOGGING,
};

export const performanceConfig = {
  cacheTtl: config.CACHE_TTL,
  requestTimeout: config.REQUEST_TIMEOUT,
  maxConcurrentRequests: config.MAX_CONCURRENT_REQUESTS,
};

// Environment helpers
export const isDevelopment = () => config.NODE_ENV === "development";
export const isProduction = () => config.NODE_ENV === "production";
export const isTest = () => config.NODE_ENV === "test";

// Configuration validation helpers
export const validateRequiredServices = () => {
  const missing: string[] = [];
  
  if (!config.DATABASE_URL) {
    missing.push("DATABASE_URL");
  }
  
  if (!config.SESSION_SECRET) {
    missing.push("SESSION_SECRET");
  }
  
  if (missing.length > 0) {
    throw new Error(`Missing required configuration: ${missing.join(", ")}`);
  }
};

// Runtime configuration updates (for feature flags)
export class RuntimeConfig {
  private static flags: Record<string, boolean> = { ...featureFlags };
  
  static getFlag(name: string): boolean {
    return this.flags[name] ?? false;
  }
  
  static setFlag(name: string, value: boolean): void {
    this.flags[name] = value;
  }
  
  static getAllFlags(): Record<string, boolean> {
    return { ...this.flags };
  }
  
  static resetFlags(): void {
    this.flags = { ...featureFlags };
  }
}

// Configuration monitoring
export const configHealth = {
  database: () => !!config.DATABASE_URL,
  session: () => !!config.SESSION_SECRET && config.SESSION_SECRET.length >= 32,
  logging: () => ["debug", "info", "warn", "error", "fatal"].includes(config.LOG_LEVEL),
  security: () => config.BCRYPT_ROUNDS >= 10 && config.BCRYPT_ROUNDS <= 15,
};

export const getConfigHealth = () => {
  const health: Record<string, boolean> = {};
  
  for (const [key, check] of Object.entries(configHealth)) {
    try {
      health[key] = check();
    } catch (error) {
      health[key] = false;
    }
  }
  
  return health;
};

export default config;