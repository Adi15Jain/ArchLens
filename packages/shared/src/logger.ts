// ============================================================
// @archlens/shared — Logger
// ============================================================

export type LogLevel = "error" | "warn" | "info" | "debug";

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
};

export interface Logger {
    error(message: string, context?: Record<string, unknown>): void;
    warn(message: string, context?: Record<string, unknown>): void;
    info(message: string, context?: Record<string, unknown>): void;
    debug(message: string, context?: Record<string, unknown>): void;
}

let currentLevel: LogLevel = "warn";

export function setLogLevel(level: LogLevel): void {
    currentLevel = level;
}

export function getLogLevel(): LogLevel {
    return currentLevel;
}

function shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] <= LOG_LEVEL_PRIORITY[currentLevel];
}

function formatMessage(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
): string {
    const prefix = `[archlens:${level}]`;
    const contextStr = context ? ` ${JSON.stringify(context)}` : "";
    return `${prefix} ${message}${contextStr}`;
}

export const logger: Logger = {
    error(message, context) {
        if (shouldLog("error"))
            console.error(formatMessage("error", message, context));
    },
    warn(message, context) {
        if (shouldLog("warn"))
            console.warn(formatMessage("warn", message, context));
    },
    info(message, context) {
        if (shouldLog("info"))
            console.info(formatMessage("info", message, context));
    },
    debug(message, context) {
        if (shouldLog("debug"))
            console.debug(formatMessage("debug", message, context));
    },
};
