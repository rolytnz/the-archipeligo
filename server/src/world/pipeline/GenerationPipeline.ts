import { GenerationContext } from "./GenerationContext.js";
import { GenerationStage } from "./GenerationStage.js";

export class GenerationPipeline {

    private readonly stages: GenerationStage[] = [];

    public addStage(
        stage: GenerationStage
    ): void {

        this.stages.push(stage);
    }

    public execute(
        context: GenerationContext
    ): void {

        for (const stage of this.stages) {

            console.log(
                `Executing stage: ${stage.name}`
            );

            stage.execute(context);
        }
    }
}