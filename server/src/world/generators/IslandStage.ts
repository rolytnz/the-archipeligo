import { GenerationStage }
from "../pipeline/GenerationStage.js";

import { GenerationContext }
from "../pipeline/GenerationContext.js";

export class IslandStage
    implements GenerationStage {

    public readonly name =
        "Island Generation";

    public execute(
        context: GenerationContext
    ): void {

        const regionCount =
            context.planet.regions.length;

        const cellCount =
            context.planet.mesh.cells.length;

        console.log(

            `Preparing island generation ` +

            `for ${regionCount} regions ` +

            `and ${cellCount} cells.`
        );

        //
        // Future implementation:
        //
        // - Select island seed cells
        // - Grow contiguous landmasses
        // - Assign islandId
        // - Set elevationM
        // - Mark isLand
        //
    }
}