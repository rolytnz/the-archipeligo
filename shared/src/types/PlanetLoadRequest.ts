export interface PlanetLoadRequest {

    planetId: string;

    metadata?: boolean;

    regions?: boolean;

    cells?: boolean;

    mesh?: boolean;

    exploredOnly?: boolean;

    centerCellId?: number;

    radius?: number;

    cellIds?: number[];
}