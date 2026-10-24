import type {
    Planet
}
from "@archipeligo/shared";

import {
    PlanetConstants
}
from "@archipeligo/shared";

import {
    SeedService
}
from "../services/SeedService.js";

import {
    PlanetGeometryService
}
from "../services/PlanetGeometryService.js";

import {
    PlanetMeshService
}
from "../services/PlanetMeshService.js";

import {
    RegionGenerator
}
from "./RegionGenerator.js";

export class PlanetGenerator {

    private readonly seedService =
        new SeedService();

    public generate(
        masterSeed?: bigint
    ): Planet {

        const start =
            performance.now();

        const effectiveMasterSeed =
            masterSeed ??
            this.seedService.generateMasterSeed();

        const planetSeed =
            this.seedService.planetSeed(
                effectiveMasterSeed
            );

        const geometryService =
            new PlanetGeometryService(
                PlanetConstants.RadiusKm
            );
            
        const regionGenerator =
            new RegionGenerator(
                this.seedService
            );

        const regions =
            regionGenerator.generate(
                planetSeed,
                PlanetConstants.RegionCount
            );

        const meshService =
            new PlanetMeshService(
                geometryService
            );

        const mesh =
            meshService.generateMesh(
                PlanetConstants.Subdivisions,
                regions
            );

        const generationTimeMs =
            performance.now() -
            start;

        console.log(

            "\nPlanet Generation\n" +

            "-----------------\n" +

            `Seed: ${planetSeed}\n` +

            `Radius: ${PlanetConstants.RadiusKm.toLocaleString()} km\n` +

            `Subdivisions: ${PlanetConstants.Subdivisions}\n` +

            `Regions: ${regions.length.toLocaleString()}\n` +

            `Vertices: ${(mesh.vertices.length / 3).toLocaleString()}\n` +

            `Triangles: ${(mesh.indices.length / 3).toLocaleString()}\n` +

            `Cells: ${mesh.cells.length.toLocaleString()}\n` +

            `Time: ${generationTimeMs.toFixed(2)} ms\n`
        );

        return {

            id:
                `planet-${planetSeed.toString(16)}`,

            seed:
                planetSeed,

            radiusKm:
                PlanetConstants.RadiusKm,

            regions,

            mesh
        };
    }
}