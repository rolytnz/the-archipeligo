import { GenerationStage }
from "../pipeline/GenerationStage.js";

import { GenerationContext }
from "../pipeline/GenerationContext.js";

export class ClimateStage
    implements GenerationStage {

    public readonly name =
        "Climate Generation";

    public execute(
        context: GenerationContext
    ): void {

        const regionLookup =
            new Map(
                context.planet.regions.map(
                    region => [
                        region.id,
                        region
                    ]
                )
            );

        for (
            const cell
            of context.planet.mesh.cells
        ) {

            const region =
                regionLookup.get(
                    cell.regionId
                );

            if (!region) {

                continue;
            }

            //
            // Base climate inherited
            // from owning region.
            //

            let temperature =
                region.climate.temperature;

            let moisture =
                region.climate.moisture;

            const stormActivity =
                region.climate.stormActivity;

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
                        cell.center.elevation
                    ) / 90
                );

            temperature *=
                latitudeFactor;

            moisture *=
                (
                    0.5 +
                    latitudeFactor * 0.5
                );

            cell.temperature =
                temperature;

            cell.moisture =
                moisture;

            cell.stormActivity =
                stormActivity;
        }

        console.log(
            `Applied climate to ${context.planet.mesh.cells.length} cells.`
        );
    }
}