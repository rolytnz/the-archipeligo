import { WorldPosition } from "./WorldPosition.js";

export interface Region {

    /**
     * Unique region identifier.
     */
    id: string;

    /**
     * Display name.
     */
    name: string;

    /**
     * Deterministic generation seed.
     */
    seed: bigint;

    /**
     * Voronoi site location.
     *
     * The nearest region site determines
     * which region influences a location.
     */
    site: WorldPosition;

    /**
     * Climate influences.
     * Values range from 0.0 to 1.0.
     */
    climate: RegionClimate;

    /**
     * Geological influences.
     * Values range from 0.0 to 1.0.
     */
    geology: RegionGeology;

    /**
     * Special regional influences.
     */
    activity: RegionActivity;
}

export interface RegionClimate {

    /**
     * 0.0 = polar
     * 1.0 = tropical
     */
    temperature: number;

    /**
     * 0.0 = arid
     * 1.0 = rainforest
     */
    moisture: number;

}

export interface RegionGeology {

    /**
     * Controls volcanic island generation,
     * geothermal activity and mountain ranges.
     */
    volcanism: number;

    /**
     * Controls frequency of islands
     * within the region.
     */
    islandDensity: number;
}

export interface RegionActivity {

    /**
     * Influence of precursor civilization.
     *
     * Controls:
     * - Ruins
     * - Artifacts
     * - Lost technology
     */
    ancientActivity: number;

    /**
     * Future use:
     * Wildlife migrations,
     * sea monsters,
     * anomaly activity.
     */
    anomalyActivity: number;
}