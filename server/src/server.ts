import Fastify from "fastify";

import { SeedService }
    from "./world/services/SeedService.js";

import { GenerationPipeline }
    from "./world/pipeline/GenerationPipeline.js";

import { PlanetGeneratorImpl }
    from "./world/PlanetGeneratorImpl.js";

const fastify = Fastify({
    logger: true
});

//
// World Generation Services
//

const seedService =
    new SeedService();

const pipeline =
    new GenerationPipeline();

const planetGenerator =
    new PlanetGeneratorImpl(
        seedService,
        pipeline
    );

//
// Routes
//

fastify.post(
    "/api/planet",
    async (request, reply) => {

        const body = request.body as {
            name: string;
        };

        const planet =
            planetGenerator.createPlanet(
                body.name
            );

        console.log("Planet generated");

        return JSON.parse(
            JSON.stringify(
                planet,
                (_key, value) =>
                    typeof value === "bigint"
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

async function start(): Promise<void> {

    try {

        await fastify.listen({
            host: "0.0.0.0",
            port: 3000
        });

        console.log(
            "Archipeligo server started on port 3000"
        );

    }
    catch (error) {

        fastify.log.error(error);

        process.exit(1);
    }
}

start();