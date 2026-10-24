import type {
    Planet
}
from "./Planet.js";

export interface PlanetLoadResult {

    planet: Planet;

    loadedRegions: number;

    loadedCells: number;
}