type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: unknown;
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || "info";

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[currentLevel];
}

function formatEntry(entry: LogEntry): string {
  const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
  const context = entry.context ? ` [${entry.context}]` : "";
  return `${prefix}${context} ${entry.message}`;
}

export const logger = {
  debug(message: string, context?: string, data?: unknown): void {
    if (shouldLog("debug")) {
      const entry: LogEntry = { level: "debug", message, timestamp: new Date().toISOString(), context, data };
      process.stdout.write(`${formatEntry(entry)}\n`);
    }
  },

  info(message: string, context?: string, data?: unknown): void {
    if (shouldLog("info")) {
      const entry: LogEntry = { level: "info", message, timestamp: new Date().toISOString(), context, data };
      process.stdout.write(`${formatEntry(entry)}\n`);
    }
  },

  warn(message: string, context?: string, data?: unknown): void {
    if (shouldLog("warn")) {
      const entry: LogEntry = { level: "warn", message, timestamp: new Date().toISOString(), context, data };
      process.stderr.write(`${formatEntry(entry)}\n`);
    }
  },

  error(message: string, context?: string, data?: unknown): void {
    if (shouldLog("error")) {
      const entry: LogEntry = { level: "error", message, timestamp: new Date().toISOString(), context, data };
      process.stderr.write(`${formatEntry(entry)}\n`);
    }
  },
};
