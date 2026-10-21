import { GenerationStage }
from "../pipeline/GenerationStage.js";

import { GenerationContext }
from "../pipeline/GenerationContext.js";

export class RegionStage
    implements GenerationStage {

    public readonly name =
        "Region Generation";

    public execute(
        context: GenerationContext
    ): void {

        const regionCount =
            context.planet.regions.length;

        console.log(

            `Planet contains ${regionCount} regions.`
        );
    }
}