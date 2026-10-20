import "fastify";

import { PlanetGenerator } from "../world/PlanetGenerator.js";

declare module "fastify" {

    interface FastifyInstance {

        planetGenerator: PlanetGenerator;
    }
}