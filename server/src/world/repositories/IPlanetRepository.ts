import type {
    Planet
}
from "@archipeligo/shared";

import type {
    PlanetSummary
}
from "./PlanetSummary.js";

export interface IPlanetRepository {

    save(
        planet: Planet
    ): Promise<void>;

    load(
        planetId: string
    ): Promise<
        Planet | null
    >;

    exists(
        planetId: string
    ): Promise<boolean>;

    list(): Promise<
        PlanetSummary[]
    >;
}
