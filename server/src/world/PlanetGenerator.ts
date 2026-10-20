import { Planet } from "./types/Planet.js";

export interface PlanetGenerator {

    createPlanet(
        name: string,
        masterSeed?: bigint
    ): Planet;
}
