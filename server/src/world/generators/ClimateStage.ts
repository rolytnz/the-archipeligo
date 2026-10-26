import { GenerationStage }
from "../pipeline/GenerationStage.js";

import { GenerationContext }
from "../pipeline/GenerationContext.js";

import {
    Logger
}
from "@archipeligo/shared";

export class ClimateStage
    implements GenerationStage {

    public readonly name =
        "Climate Generation";

    public execute(
        context: GenerationContext
    ): void {

        Logger.info(
            "Applying regional climate..."
        );

        for (
            const region
            of context.planet.regions
        ) {

            //
            // Latitude adjustment.
            //
            // Equator = warmer
            // Poles = colder
            //

            const latitudeFactor =
                1 -
                (
                    Math.abs(
                        region.site.elevation
                    ) / 90
                );

            region.climate.temperature *=
                latitudeFactor;

            region.climate.moisture *=
                (
                    0.5 +
                    latitudeFactor * 0.5
                );
        }

        Logger.info(
            `Applied climate to ${context.planet.regions.length.toLocaleString()} regions.`
        );
    }
}