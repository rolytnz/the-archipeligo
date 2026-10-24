import type {
    Planet
}
from "../types/Planet.js";

import type {
    RegionGraph
}
from "../types/RegionGraph.js";

import type {
    RegionAdjacencyService
}
from "./RegionAdjacencyService.js";

export class DefaultRegionAdjacencyService
    implements RegionAdjacencyService {

    public build(
        planet: Planet
    ): RegionGraph {

        const adjacency =
            new Map<
                string,
                Set<string>
            >();

        for (
            const region
            of planet.regions
        ) {

            adjacency.set(
                region.id,
                new Set()
            );
        }

        for (
            let cellId = 0;
            cellId <
                planet.mesh.cells.length;
            cellId++
        ) {

            const cell =
                planet.mesh.cells[
                    cellId
                ];

            const regionId =
                cell.regionId;

            const offset =
                cellId * 6;

            for (
                let i = 0;
                i < 6;
                i++
            ) {

                const neighborId =
                    planet.mesh.neighbors[
                        offset + i
                    ];

                if (
                    neighborId < 0
                ) {

                    continue;
                }

                const neighborRegionId =
                    planet.mesh.cells[
                        neighborId
                    ].regionId;

                if (
                    regionId ===
                    neighborRegionId
                ) {

                    continue;
                }

                adjacency
                    .get(
                        regionId
                    )
                    ?.add(
                        neighborRegionId
                    );

                adjacency
                    .get(
                        neighborRegionId
                    )
                    ?.add(
                        regionId
                    );
            }
        }

        return {
            adjacency
        };
    }
}