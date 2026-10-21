import path from "node:path";

import Fastify from "fastify";

import fastifyStatic
from "@fastify/static";

import {
    PlanetGenerator
}
from "./world/PlanetGenerator.js";

const fastify = Fastify({
    logger: true
});

const planetGenerator =
    new PlanetGenerator();

//
// Routes
//

fastify.get(
    "/api/planet",
    async () => {

        const planet =
            planetGenerator.generate(
                BigInt(
                    Date.now()
                )
            );

        console.log(
            "Planet generated"
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
// Startup
//

async function start():
    Promise<void> {

    try {

        await fastify.register(
            fastifyStatic,
            {
                root: path.join(
                    process.cwd(),
                    "public"
                )
            }
        );

        await fastify.listen({

            host: "0.0.0.0",

            port: 3000
        });

        console.log(
            "Archipeligo server started on port 3000"
        );
    }
    catch (error) {

        fastify.log.error(
            error
        );

        process.exit(1);
    }
}

start();