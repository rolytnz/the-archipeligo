import type {
    Region
}
from "../types/Region.js";

import type {
    RegionGraph
}
from "../types/RegionGraph.js";

export interface RegionSmoothingService {

    smooth(
        regions: Region[],
        graph: RegionGraph,
        selector: (
            region: Region
        ) => number,
        setter: (
            region: Region,
            value: number
        ) => void,
        passes: number,
        minimum?: number,
        maximum?: number
    ): void;
}