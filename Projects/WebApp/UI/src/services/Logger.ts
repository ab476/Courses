// Define log levels
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

// Interface for log objects
interface ILogObject {
  level: LogLevel;
  message: string;
  timestamp: Date;
}

// Transport interface for different logging destinations
interface ITransport {
  log(logObject: ILogObject): void;
}

// Default formatter
const defaultFormatter = (logObject: ILogObject) => {
  const timestamp = logObject.timestamp.toISOString();
  const level = LogLevel[logObject.level].padEnd(5);
  return `${timestamp} [${level}] ${logObject.message}`;
};

// Console transport implementation
class ConsoleTransport implements ITransport {
  private formatter: (logObject: ILogObject) => string;

  constructor(formatter = defaultFormatter) {
    this.formatter = formatter;
  }

  log(logObject: ILogObject): void {
    const message = this.formatter(logObject);
    switch (logObject.level) {
      case LogLevel.ERROR:
        console.error(message);
        break;
      case LogLevel.WARN:
        console.warn(message);
        break;
      default:
        console.log(message);
    }
  }
}

// Logger class
class Logger {
  private level: LogLevel;
  private transport: ITransport;
  private context?: string;

  constructor(options: { level?: LogLevel; transport?: ITransport; context?: string }) {
    this.level = options.level ?? LogLevel.INFO;
    this.transport = options.transport ?? new ConsoleTransport();
    this.context = options.context;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.level;
  }

  private log(level: LogLevel, message: string): void {
    if (!this.shouldLog(level)) return;

    const logMessage = this.context ? `[${this.context}] ${message}` : message;

    this.transport.log({
      level,
      message: logMessage,
      timestamp: new Date(),
    });
  }

  // Convenience methods
  debug(message: string): void {
    this.log(LogLevel.DEBUG, message);
  }

  info(message: string): void {
    this.log(LogLevel.INFO, message);
  }

  warn(message: string): void {
    this.log(LogLevel.WARN, message);
  }

  error(message: string): void {
    this.log(LogLevel.ERROR, message);
  }

  // Update log level at runtime
  setLevel(level: LogLevel): void {
    this.level = level;
  }
}

// Usage example
const logger = new Logger({
  level: LogLevel.DEBUG,
  context: "MyApp",
});

logger.debug("Debugging information");
logger.info("Application started");
logger.warn("This is a warning");
logger.error("Critical error occurred");

// Create a child logger with different context
const databaseLogger = new Logger({
  level: LogLevel.INFO,
  context: "Database",
});

databaseLogger.info("Connection established");
