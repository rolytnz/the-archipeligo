import type {
    Planet,
    PlanetSummary,
    PlanetLoadRequest,
    PlanetLoadResult
}
from "@archipeligo/shared";

export interface IPlanetRepository {

    save(
        planet: Planet
    ): Promise<void>;

    load(
        request: PlanetLoadRequest
    ): Promise<
        PlanetLoadResult | null
    >;

    exists(
        planetId: string
    ): Promise<boolean>;

    list(): Promise<
        PlanetSummary[]
    >;
}
