import {
    Planet
}
from "@archipeligo/shared";

import {
    PlanetGeometryService
}
from "../services/PlanetGeometryService.js";

export interface GenerationContext {

    planet: Planet;

    geometry:
        PlanetGeometryService;
}