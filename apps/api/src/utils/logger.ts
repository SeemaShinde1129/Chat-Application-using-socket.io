type LogLevel = "error" | "info" | "warn";

type LogContext = Record<string, unknown>;

function writeLog(level: LogLevel, event: string, context: LogContext = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...context,
  };

  const line = JSON.stringify(entry);

  if (level === "error") {
    console.error(line);
    return;
  }

  console.log(line);
}

const logger = {
  error(event: string, context?: LogContext) {
    writeLog("error", event, context);
  },
  info(event: string, context?: LogContext) {
    writeLog("info", event, context);
  },
  warn(event: string, context?: LogContext) {
    writeLog("warn", event, context);
  },
};

export = logger;
