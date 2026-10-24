import { PlanetCell }
from "./PlanetCell.js";

export interface PlanetMesh {

    vertices: number[];

    indices: number[];

    cells: PlanetCell[];

    neighbors: Int32Array;
}
