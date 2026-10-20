export interface Region {

    id: string;

    name: string;

    seed: bigint;

    centerBearing: number;

    centerElevation: number;

    radiusKm: number;

    islandIds: string[];
}