type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  service?: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  metadata?: Record<string, unknown>;
}

class Logger {
  private service: string;
  private isDevelopment: boolean;

  constructor(service: string = 'web') {
    this.service = service;
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private formatLog(level: LogLevel, message: string, error?: Error, metadata?: Record<string, unknown>): LogEntry {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      service: this.service,
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
      };
    }

    if (metadata) {
      entry.metadata = this.sanitizeMetadata(metadata);
    }

    return entry;
  }

  private sanitizeMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'jwt', 'apiKey', 'authorization'];

    for (const [key, value] of Object.entries(metadata)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some((sensitive) => lowerKey.includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeMetadata(value as Record<string, unknown>);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  private output(entry: LogEntry): void {
    if (this.isDevelopment) {
      // Pretty print in development
      const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.service}]`;
      if (entry.error) {
        console.error(`${prefix} ${entry.message}`, entry.error, entry.metadata || '');
      } else if (entry.level === 'error') {
        console.error(`${prefix} ${entry.message}`, entry.metadata || '');
      } else if (entry.level === 'warn') {
        console.warn(`${prefix} ${entry.message}`, entry.metadata || '');
      } else {
        console.log(`${prefix} ${entry.message}`, entry.metadata || '');
      }
    } else {
      // JSON output in production (for log aggregation)
      console.log(JSON.stringify(entry));
    }
  }

  debug(message: string, metadata?: Record<string, unknown>): void {
    if (this.isDevelopment) {
      this.output(this.formatLog('debug', message, undefined, metadata));
    }
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    this.output(this.formatLog('info', message, undefined, metadata));
  }

  warn(message: string, error?: Error, metadata?: Record<string, unknown>): void {
    this.output(this.formatLog('warn', message, error, metadata));
  }

  error(message: string, error?: Error, metadata?: Record<string, unknown>): void {
    this.output(this.formatLog('error', message, error, metadata));
  }
}

// Export singleton instances
export const logger = new Logger('web');
export const createLogger = (service: string) => new Logger(service);
