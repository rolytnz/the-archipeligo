import {
    DefaultRegionAdjacencyService,
    DefaultRegionSmoothingService,
    PlanetConstants,
    WorldPosition,
}
from "@archipeligo/shared";

import type {
    Planet,
    Region
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

    private readonly adjacencyService =
        new DefaultRegionAdjacencyService();

    private readonly smoothingService =
        new DefaultRegionSmoothingService();

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

        let mesh =
            meshService.generateMesh(
                PlanetConstants.Subdivisions,
                regions
            );

        //
        // Lloyd relaxation.
        //

        for (
            let pass = 0;
            pass <
            PlanetConstants
                .RegionRelaxationPasses;
            pass++
        ) {

            this.relaxRegionSites(
                regions,
                mesh
            );

            mesh =
                meshService.generateMesh(
                    PlanetConstants.Subdivisions,
                    regions
                );
        }

        //
        // Smooth climate and geology.
        //

        this.smoothRegions(
            regions,
            mesh
        );

        this.logRegionStatistics(
            regions,
            mesh
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

    private smoothRegions(
        regions: Region[],
        mesh: Planet["mesh"]
    ): void {

        const graph =
            this.adjacencyService.build(
                {
                    regions,
                    mesh
                } as Planet
            );

        const passes =
            PlanetConstants
                .RegionSmoothingPasses;

        //
        // Temperature
        //

        this.smoothingService.smooth(

            regions,

            graph,

            (
                region: Region
            ) =>
                region.climate.temperature,

            (
                region: Region,
                value: number
            ) => {

                region.climate.temperature =
                    value;
            },

            passes
        );

        //
        // Moisture
        //

        this.smoothingService.smooth(

            regions,

            graph,

            (
                region: Region
            ) =>
                region.climate.moisture,

            (
                region: Region,
                value: number
            ) => {

                region.climate.moisture =
                    value;
            },

            passes
        );

        //
        // Volcanism
        //

        this.smoothingService.smooth(

            regions,

            graph,

            (
                region: Region
            ) =>
                region.geology.volcanism,

            (
                region: Region,
                value: number
            ) => {

                region.geology.volcanism =
                    value;
            },

            passes
        );
    }

    private relaxRegionSites(
        regions: Region[],
        mesh: Planet["mesh"]
    ): void {

        const accumulators =
            new Map<
                string,
                {
                    x: number;
                    y: number;
                    z: number;
                    count: number;
                }
            >();

        for (
            const region
            of regions
        ) {

            accumulators.set(

                region.id,

                {
                    x: 0,
                    y: 0,
                    z: 0,
                    count: 0
                }
            );
        }

        for (
            const cell
            of mesh.cells
        ) {

            const accumulator =
                accumulators.get(
                    cell.regionId
                );

            if (
                !accumulator
            ) {

                continue;
            }

            const point =
                cell.center
                    .toCartesian();

            accumulator.x +=
                point.x;

            accumulator.y +=
                point.y;

            accumulator.z +=
                point.z;

            accumulator.count++;
        }

        for (
            const region
            of regions
        ) {

            const accumulator =
                accumulators.get(
                    region.id
                );

            if (
                !accumulator ||
                accumulator.count === 0
            ) {

                continue;
            }

            region.site =
                WorldPosition
                    .fromCartesian(

                        accumulator.x /
                        accumulator.count,

                        accumulator.y /
                        accumulator.count,

                        accumulator.z /
                        accumulator.count
                    );
        }
    }

    private logRegionStatistics(
        regions: Region[],
        mesh: Planet["mesh"]
    ): void {

        const regionCounts =
            new Map<
                string,
                number
            >();

        for (
            const region
            of regions
        ) {

            regionCounts.set(
                region.id,
                0
            );
        }

        for (
            const cell
            of mesh.cells
        ) {

            regionCounts.set(

                cell.regionId,

                (
                    regionCounts.get(
                        cell.regionId
                    ) ?? 0
                ) + 1
            );
        }

        const counts =
            [
                ...regionCounts.values()
            ];

        const minimum =
            Math.min(
                ...counts
            );

        const maximum =
            Math.max(
                ...counts
            );

        const average =
            counts.reduce(
                (
                    total,
                    count
                ) =>
                    total + count,
                0
            ) /
            counts.length;

        const variance =
            counts.reduce(
                (
                    total,
                    count
                ) =>
                    total +
                    Math.pow(
                        count - average,
                        2
                    ),
                0
            ) /
            counts.length;

        const standardDeviation =
            Math.sqrt(
                variance
            );

        const coefficientOfVariation =
            (
                standardDeviation /
                average
            ) * 100;

        console.log(
            "Region statistics",
            {
                regions:
                    regions.length,

                minimumCells:
                    minimum,

                averageCells:
                    average,

                maximumCells:
                    maximum,

                standardDeviation,

                coefficientOfVariation
            }
        );
    }
}