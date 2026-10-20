import { GenerationStage } from "../pipeline/GenerationStage.js";
import { GenerationContext } from "../pipeline/GenerationContext.js";

export class IslandStage
    implements GenerationStage {

    public readonly name =
        "Island Generation";

    public execute(
        context: GenerationContext
    ): void {

        const seed =
            context
                .planet
                .seeds
                .islandSeed;

        console.log(
            `Island seed: ${seed}`
        );

        context.planet.islands = [];
    }
}