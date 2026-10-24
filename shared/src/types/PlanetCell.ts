import {
    WorldPosition
}
from "./WorldPosition.js";

export interface PlanetCell {

    /**
     * Unique cell identifier.
     *
     * Corresponds to the cell's index
     * within PlanetMesh.cells.
     */
    id: number;

    /**
     * Owning region.
     *
     * Climate, geology and other
     * regional information should be
     * obtained from the Region.
     */
    regionId: string;

    /**
     * Cell centre position on the planet.
     */
    center: WorldPosition;
}