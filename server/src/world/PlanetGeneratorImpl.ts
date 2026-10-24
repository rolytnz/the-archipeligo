import {
    Planet
} from "@archipeligo/shared";

import {
    PlanetGenerator
} from "./generators/PlanetGenerator.js";

export class PlanetGeneratorImpl {

    constructor(
        private readonly generator:
            PlanetGenerator
    ) {}

    public createPlanet(
        masterSeed: bigint
    ): Planet {

        return this.generator.generate(
            masterSeed
        );
    }
}