import { GenerationStage } from "../pipeline/GenerationStage.js";
import { GenerationContext } from "../pipeline/GenerationContext.js";


export class TectonicStage
    implements GenerationStage {

    public readonly name =
        "Tectonic Generation";

    public execute(
        context: GenerationContext
    ): void {

        const seed =
            context
                .planet
                .seeds
                .tectonicSeed;

        console.log(
            `Tectonic seed: ${seed}`
        );

        context.planet.tectonicPlates = [];
    }
}