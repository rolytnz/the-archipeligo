import { WorldPosition }
from "./WorldPosition.js";

export interface PlanetCell {

    /**
     * Unique cell identifier.
     */
    id: number;

    /**
     * Centre point of the cell.
     */
    center: WorldPosition;

    /**
     * Parent region.
     */
    regionId: string;

    /**
     * Future island ownership.
     */
    islandId?: string;

    /**
     * Land or ocean.
     */
    isLand: boolean;

    /**
     * Height relative to sea level.
     */
    elevationM: number;

    /**
     * Climate.
     */
    temperature: number;

    moisture: number;

    stormActivity: number;

    /**
     * Future biome assignment.
     */
    biomeId?: string;

    /**
     * Future resources.
     */
    resourceIds: string[];
}