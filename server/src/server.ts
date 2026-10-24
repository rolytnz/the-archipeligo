import "dotenv/config";

import path from "node:path";

import Fastify from "fastify";

import fastifyStatic
from "@fastify/static";

import {
    PlanetGenerator
}
from "./world/generators/PlanetGenerator.js";

import {
    PostgresPlanetRepository
}
from "./infrastructure/database/repositories/PostgresPlanetRepository.js";

import {
    DatabaseFactory
}
from "./infrastructure/database/DatabaseFactory.js";

import {
    Logger
}
from "./infrastructure/logging/Logger.js";

function serializeForJson(
    value: unknown
): unknown {

    return JSON.parse(
        JSON.stringify(
            value,
            (
                _key,
                item
            ) =>
                typeof item ===
                "bigint"

                    ? item.toString()

                    : item
        )
    );
}

const fastify =
    Fastify({

        logger: true,

        bodyLimit:
            100 * 1024 * 1024
    });

const planetGenerator =
    new PlanetGenerator();

const repository =
    new PostgresPlanetRepository();

//
// Generate + Save Planet
//

fastify.get(
    "/api/planet",
    async (
        _request,
        reply
    ) => {

        try {

            Logger.info(
                "Generating planet..."
            );

            const planet =
                planetGenerator.generate(
                    BigInt(
                        Date.now()
                    )
                );

            Logger.info(
                "Planet generated.",
                planet.id
            );

            Logger.info(
                "Saving planet..."
            );

            await repository.save(
                planet
            );

            Logger.info(
                "Planet saved.",
                planet.id
            );

            return JSON.parse(
                JSON.stringify(
                    planet,
                    (
                        _key,
                        value
                    ) =>
                        typeof value ===
                        "bigint"

                            ? value.toString()

                            : value
                )
            );
        }
        catch (
            error
        ) {

            Logger.error(
                "Planet generation failed."
            );

            Logger.error(
                error
            );

            if (
                error instanceof Error
            ) {

                Logger.error(
                    error.message
                );

                Logger.error(
                    error.stack
                );
            }

            return reply
                .status(500)
                .send({

                    success: false,

                    message:
                        "Planet generation failed."
                });
        }
    }
);

fastify.get(
    "/api/planets",
    async (
        _request,
        reply
    ) => {

        try {

            const planets =
                await repository.list();

            return serializeForJson(
                planets
            );
        }
        catch (
            error
        ) {

            Logger.error(
                "Failed to list planets."
            );

            Logger.error(
                error
            );

            return reply
                .status(500)
                .send({

                    message:
                        "Failed to list planets."
                });
        }
    }
);

fastify.get(
    "/api/planet/:id",
    async (
        request,
        reply
    ) => {

        try {

            const {
                id
            } =
                request.params as {

                    id: string;
                };

            const result =
                await repository.load({

                    planetId: id,

                    metadata: true,

                    regions: true,

                    cells: true,

                    mesh: true
                });

            if (
                !result
            ) {

                return reply
                    .status(404)
                    .send({

                        message:
                            "Planet not found."
                    });
            }

            return serializeForJson(
                result
            );
        }
        catch (
            error
        ) {

            Logger.error(
                "Failed to load planet."
            );

            Logger.error(
                error
            );

            return reply
                .status(500)
                .send({

                    message:
                        "Failed to load planet."
                });
        }
    }
);

//
// Health Check
//

fastify.get(
    "/api/health",
    async () => {

        return {

            status: "ok"
        };
    }
);

//
// Graceful Shutdown
//

async function shutdown(
    signal: string
): Promise<void> {

    try {

        Logger.info(
            `Received ${signal}.`
        );

        await fastify.close();

        await DatabaseFactory.shutdown();

        Logger.info(
            "Shutdown complete."
        );

        process.exit(
            0
        );
    }
    catch (
        error
    ) {

        Logger.error(
            "Shutdown failed."
        );

        Logger.error(
            error
        );

        process.exit(
            1
        );
    }
}

process.on(
    "SIGINT",
    () => {

        void shutdown(
            "SIGINT"
        );
    }
);

process.on(
    "SIGTERM",
    () => {

        void shutdown(
            "SIGTERM"
        );
    }
);

//
// Startup
//

async function start():
    Promise<void> {

    try {

        Logger.info(
            "Testing database connection..."
        );

        await DatabaseFactory.testConnection();

        Logger.info(
            "Database connection verified."
        );

        await fastify.register(
            fastifyStatic,
            {
                root: path.join(
                    process.cwd(),
                    "public"
                )
            }
        );

        const port =
            Number(
                process.env.PORT ??
                3000
            );

        await fastify.listen({

            host:
                "0.0.0.0",

            port
        });

        Logger.info(
            `Archipeligo server started on port ${port}.`
        );
    }
    catch (
        error
    ) {

        Logger.error(
            "Server startup failed."
        );

        Logger.error(
            error
        );

        process.exit(
            1
        );
    }
}

start();