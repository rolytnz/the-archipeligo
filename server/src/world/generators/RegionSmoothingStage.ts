import type {
    Region
}
from "@archipeligo/shared";

import {
    DefaultRegionAdjacencyService,
    DefaultRegionSmoothingService
}
from "@archipeligo/shared";

import type {
    GenerationContext
}
from "../pipeline/GenerationContext.js";

import type {
    GenerationStage
}
from "../pipeline/GenerationStage.js";

export class RegionSmoothingStage
    implements GenerationStage {

    public readonly name =
        "Region Smoothing";

    public execute(
        context: GenerationContext
    ): void {

        const adjacencyService =
            new DefaultRegionAdjacencyService();

        const graph =
            adjacencyService.build(
                context.planet
            );

        const smoothingService =
            new DefaultRegionSmoothingService();

        //
        // Temperature
        //

        smoothingService.smooth(

            context.planet.regions,

            graph,

            (
                region: Region
            ) =>
                region
                    .climate
                    .temperature,

            (
                region: Region,
                value: number
            ) => {

                region
                    .climate
                    .temperature =
                        value;
            },

            3
        );

        //
        // Moisture
        //

        smoothingService.smooth(

            context.planet.regions,

            graph,

            (
                region: Region
            ) =>
                region
                    .climate
                    .moisture,

            (
                region: Region,
                value: number
            ) => {

                region
                    .climate
                    .moisture =
                        value;
            },

            3
        );

        //
        // Volcanism
        //

        smoothingService.smooth(

            context.planet.regions,

            graph,

            (
                region: Region
            ) =>
                region
                    .geology
                    .volcanism,

            (
                region: Region,
                value: number
            ) => {

                region
                    .geology
                    .volcanism =
                        value;
            },

            3
        );
    }
}