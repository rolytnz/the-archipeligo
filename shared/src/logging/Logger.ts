import { LogLevel }
from "./LogLevel.js";

export class Logger {

    private static level =
        LogLevel.Info;

    public static setLevel(
        level: LogLevel
    ): void {

        this.level =
            level;
    }

    public static trace(
        message: unknown,
        ...args: unknown[]
    ): void {

        if (
            this.level <=
            LogLevel.Trace
        ) {

            console.debug(
                `[TRACE] ${message}`,
                ...args
            );
        }
    }

    public static debug(
        message: unknown,
        ...args: unknown[]
    ): void {

        if (
            this.level <=
            LogLevel.Debug
        ) {

            console.debug(
                `[DEBUG] ${message}`,
                ...args
            );
        }
    }

    public static info(
        message: unknown,
        ...args: unknown[]
    ): void {

        if (
            this.level <=
            LogLevel.Info
        ) {

            console.info(
                `[INFO] ${message}`,
                ...args
            );
        }
    }

    public static warn(
        message: unknown,
        ...args: unknown[]
    ): void {

        if (
            this.level <=
            LogLevel.Warn
        ) {

            console.warn(
                `[WARN] ${message}`,
                ...args
            );
        }
    }

    public static error(
        message: unknown,
        ...args: unknown[]
    ): void {

        if (
            this.level <=
            LogLevel.Error
        ) {

            console.error(
                "[ERROR]",
                message,
                ...args
            );
        }
    }
}