import "dotenv/config";

import {
    LogLevel
}
from "./LogLevel.js";

export class Logger {

    private static readonly level =
        Logger.parseLevel(
            process.env.LOG_LEVEL ??
            "INFO"
        );

    public static trace(
        ...args: unknown[]
    ): void {

        Logger.write(
            LogLevel.TRACE,
            "TRACE",
            ...args
        );
    }

    public static debug(
        ...args: unknown[]
    ): void {

        Logger.write(
            LogLevel.DEBUG,
            "DEBUG",
            ...args
        );
    }

    public static info(
        ...args: unknown[]
    ): void {

        Logger.write(
            LogLevel.INFO,
            "INFO",
            ...args
        );
    }

    public static warn(
        ...args: unknown[]
    ): void {

        Logger.write(
            LogLevel.WARN,
            "WARN",
            ...args
        );
    }

    public static error(
        ...args: unknown[]
    ): void {

        Logger.write(
            LogLevel.ERROR,
            "ERROR",
            ...args
        );
    }

    private static write(
        level: LogLevel,
        label: string,
        ...args: unknown[]
    ): void {

        if (
            level <
            Logger.level
        ) {

            return;
        }

        console.log(
            `[${label}]`,
            ...args
        );
    }

    private static parseLevel(
        value: string
    ): LogLevel {

        switch (
            value.toUpperCase()
        ) {

            case "TRACE":
                return LogLevel.TRACE;

            case "DEBUG":
                return LogLevel.DEBUG;

            case "INFO":
                return LogLevel.INFO;

            case "WARN":
                return LogLevel.WARN;

            case "ERROR":
                return LogLevel.ERROR;

            case "NONE":
                return LogLevel.NONE;

            default:
                return LogLevel.INFO;
        }
    }
}