import type {
    Planet
}
from "../types/Planet.js";

import type {
    RegionGraph
}
from "../types/RegionGraph.js";

export interface RegionAdjacencyService {

    build(
        planet: Planet
    ): RegionGraph;
}