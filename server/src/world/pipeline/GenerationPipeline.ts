import { GenerationContext }
from "./GenerationContext.js";

import { GenerationStage }
from "./GenerationStage.js";

export class GenerationPipeline {

    private readonly stages:
        GenerationStage[] = [];

    public addStage(
        stage: GenerationStage
    ): GenerationPipeline {

        this.stages.push(
            stage
        );

        return this;
    }

    public execute(
        context: GenerationContext
    ): void {

        for (
            const stage
            of this.stages
        ) {

            console.log(
                `Running stage: ${stage.name}`
            );

            stage.execute(
                context
            );
        }
    }
}