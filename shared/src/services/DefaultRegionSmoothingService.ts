import type {
    Region
}
from "../types/Region.js";

import type {
    RegionGraph
}
from "../types/RegionGraph.js";

import type {
    RegionSmoothingService
}
from "./RegionSmoothingService.js";

export class DefaultRegionSmoothingService
    implements RegionSmoothingService {

    public smooth(
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
        minimum: number = 0,
        maximum: number = 1
    ): void {

        const regionLookup =
            new Map<
                string,
                Region
            >();

        for (
            const region
            of regions
        ) {

            regionLookup.set(
                region.id,
                region
            );
        }

        for (
            let pass = 0;
            pass < passes;
            pass++
        ) {

            const updates =
                new Map<
                    string,
                    number
                >();

            for (
                const region
                of regions
            ) {

                const neighbors =
                    graph.adjacency.get(
                        region.id
                    );

                if (
                    !neighbors ||
                    neighbors.size === 0
                ) {

                    updates.set(
                        region.id,
                        selector(
                            region
                        )
                    );

                    continue;
                }

                let total =
                    selector(
                        region
                    );

                let count =
                    1;

                for (
                    const neighborId
                    of neighbors
                ) {

                    const neighbor =
                        regionLookup.get(
                            neighborId
                        );

                    if (
                        !neighbor
                    ) {

                        continue;
                    }

                    total +=
                        selector(
                            neighbor
                        );

                    count++;
                }

                updates.set(

                    region.id,

                    total / count
                );
            }

            //
            // Apply updates after
            // entire pass completes.
            //

            for (
                const region
                of regions
            ) {

                const value =
                    updates.get(
                        region.id
                    );

                if (
                    value ===
                    undefined
                ) {

                    continue;
                }

                setter(

                    region,

                    this.clamp(

                        value,

                        minimum,

                        maximum
                    )
                );
            }
        }
    }

    private clamp(
        value: number,
        minimum: number,
        maximum: number
    ): number {

        return Math.max(

            minimum,

            Math.min(
                maximum,
                value
            )
        );
    }
}