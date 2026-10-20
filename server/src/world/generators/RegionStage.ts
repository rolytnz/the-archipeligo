import { GenerationStage } from "../pipeline/GenerationStage.js";
import { GenerationContext } from "../pipeline/GenerationContext.js";

export class RegionStage
    implements GenerationStage {

    public readonly name =
        "Region Generation";

    public execute(
        context: GenerationContext
    ): void {

        const seed =
            context
                .planet
                .seeds
                .regionSeed;

        console.log(
            `Region seed: ${seed}`
        );

        context.planet.regions = [];
    }
}