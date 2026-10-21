import {
    Planet,
    PlanetMesh,
    Region
}
from "@archipeligo/shared";

import { RegionGenerator }
from "./generators/RegionGenerator.js";

import { ClimateStage }
from "./generators/ClimateStage.js";

import { IslandStage }
from "./generators/IslandStage.js";

import { GenerationContext }
from "./pipeline/GenerationContext.js";

import { GenerationPipeline }
from "./pipeline/GenerationPipeline.js";

import { PlanetGeometryService }
from "./services/PlanetGeometryService.js";

import { PlanetMeshService }
from "./services/PlanetMeshService.js";

export class PlanetGenerator {

    public generate(
        seed: bigint,
        regionCount = 64,
        subdivisions = 5
    ): Planet {

        //
        // Planet dimensions
        //

        const radiusKm =
            this.generateRadius(
                seed
            );

        //
        // Regions
        //

        const regionGenerator =
            new RegionGenerator();

        const regions: Region[] =
            regionGenerator.generate(
                seed,
                regionCount
            );

        //
        // Geometry services
        //

        const geometry =
            new PlanetGeometryService(
                radiusKm
            );

        //
        // Mesh
        //

        const meshService =
            new PlanetMeshService(
                geometry
            );

        const mesh: PlanetMesh =
            meshService.generateMesh(
                subdivisions,
                regions
            );

        //
        // Base planet
        //

        const planet: Planet = {

            id:
                `planet-${seed.toString(16)}`,

            seed,

            radiusKm,

            regions,

            mesh
        };

        //
        // Generation pipeline
        //

        const context:
            GenerationContext = {

            planet,

            geometry
        };

        const pipeline =
            new GenerationPipeline()

                .addStage(
                    new ClimateStage()
                )

                .addStage(
                    new IslandStage()
                );

        pipeline.execute(
            context
        );

        return planet;
    }

    private generateRadius(
        seed: bigint
    ): number {

        const minimum =
            5_000;

        const maximum =
            25_000;

        return Math.round(

            minimum +

            this.nextNormalized(
                seed
            ) *

            (
                maximum -
                minimum
            )
        );
    }

    private nextNormalized(
        seed: bigint
    ): number {

        const value =
            Number(
                seed &
                0xffffffffn
            );

        return (
            value /
            0xffffffff
        );
    }
}