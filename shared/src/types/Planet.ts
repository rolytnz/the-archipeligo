import { Region }
from "./Region.js";

import { PlanetMesh }
from "./PlanetMesh.js";

export interface Planet {

    id: string;

    seed: bigint;

    radiusKm: number;

    regions: Region[];

    mesh: PlanetMesh;
}