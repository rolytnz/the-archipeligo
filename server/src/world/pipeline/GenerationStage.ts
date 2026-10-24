import type {
    GenerationContext
}
from "./GenerationContext.js";

export interface GenerationStage {

    readonly name:
        string;

    execute(
        context: GenerationContext
    ): void;
}