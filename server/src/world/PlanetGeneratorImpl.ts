import * as crypto from "crypto";

import { Planet } from "./types/Planet.js";

import { PlanetGenerator } from "./PlanetGenerator.js";

import { ISeedService } from "./services/ISeedService.js";

import { GenerationContext } from "./pipeline/GenerationContext.js";
import { GenerationPipeline } from "./pipeline/GenerationPipeline.js";

export class PlanetGeneratorImpl
    implements PlanetGenerator {

    constructor(
        private readonly seedService: ISeedService,
        private readonly pipeline: GenerationPipeline
    ) {}

    public createPlanet(
        name: string,
        masterSeed?: bigint
    ): Planet {

        const seed =
            masterSeed ??
            this.seedService.generateMasterSeed();

        const planet: Planet = {

            id: crypto.randomUUID(),

            name,

            radiusKm: 25000,

            oceanCoveragePercent: 99,

            generationVersion: 1,

            createdAt: new Date(),

            seeds:
                this.seedService.createSeedTree(
                    seed
                ),

            climateBands: [],

            tectonicPlates: [],

            regions: [],

            islands: []
        };

        const context: GenerationContext = {
            planet
        };

        this.pipeline.execute(
            context
        );

        return planet;
    }
}