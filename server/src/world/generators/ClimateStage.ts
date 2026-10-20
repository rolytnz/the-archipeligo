import { GenerationStage } from "../pipeline/GenerationStage.js";
import { GenerationContext } from "../pipeline/GenerationContext.js";

export class ClimateStage
    implements GenerationStage {

    public readonly name =
        "Climate Generation";

    public execute(
        context: GenerationContext
    ): void {

        const seed =
            context
                .planet
                .seeds
                .climateSeed;

        console.log(
            `Climate seed: ${seed}`
        );

        context.planet.climateBands = [];
    }
}
