import { WorldPosition } from "./WorldPosition.js";

export enum IslandType {
    Volcanic = "Volcanic",
    Jungle = "Jungle",
    Temperate = "Temperate",
    CoralReef = "CoralReef",
    Arctic = "Arctic",
    Ruins = "Ruins"
}

export interface Island {

    id: string;

    name: string;

    seed: bigint;

    /**
     * Position on the planet.
     */
    location: WorldPosition;

    /**
     * Generated from local conditions.
     */
    type: IslandType;

    /**
     * Island area.
     */
    sizeKm2: number;

    /**
     * Elevation above sea level.
     */
    maxElevationMeters: number;

    /**
     * Computed at generation time.
     * Not stored as ownership.
     */
    regionId: string;
}