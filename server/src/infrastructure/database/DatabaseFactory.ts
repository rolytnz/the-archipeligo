import "dotenv/config";

import {
    Pool
}
from "pg";

export class DatabaseFactory {

    private static pool:
        Pool | undefined;

    public static getPool():
        Pool {

        if (
            !DatabaseFactory.pool
        ) {

            const host =
                process.env.DB_HOST;

            const port =
                Number(
                    process.env.DB_PORT ??
                    5432
                );

            const database =
                process.env.DB_NAME;

            const user =
                process.env.DB_USER;

            const password =
                process.env.DB_PASSWORD;

            const maxConnections =
                Number(
                    process.env.DB_MAX_CONNECTIONS ??
                    10
                );

            if (
                !host ||
                !database ||
                !user ||
                !password
            ) {

                throw new Error(

                    "Database configuration is incomplete. Check your .env file."
                );
            }

            DatabaseFactory.pool =
                new Pool({

                    host,

                    port,

                    database,

                    user,

                    password,

                    max:
                        maxConnections
                });

            DatabaseFactory.pool.on(

                "error",

                error => {

                    console.error(

                        "PostgreSQL pool error:",

                        error
                    );
                }
            );

            console.log(
                "PostgreSQL configured"
            );

            console.log(
                `Host: ${host}`
            );

            console.log(
                `Port: ${port}`
            );

            console.log(
                `Database: ${database}`
            );

            console.log(
                `User: ${user}`
            );

            console.log(
                `Max Connections: ${maxConnections}`
            );
        }

        return DatabaseFactory.pool;
    }

    public static async testConnection():
        Promise<void> {

        const pool =
            DatabaseFactory.getPool();

        const result =
            await pool.query(
                "select now()"
            );

        console.log(
            "Database connected successfully."
        );

        console.log(
            result.rows[0]
        );
    }

    public static async shutdown():
        Promise<void> {

        if (
            DatabaseFactory.pool
        ) {

            console.log(
                "Closing PostgreSQL connection pool..."
            );

            await DatabaseFactory.pool.end();

            DatabaseFactory.pool =
                undefined;

            console.log(
                "PostgreSQL connection pool closed."
            );
        }
    }
}