import {
    WorldPosition
}
from "@archipeligo/shared";

import type {
    Region
}
from "@archipeligo/shared";

import type {
    ISeedService
}
from "../services/ISeedService.js";

export class RegionGenerator {

    constructor(
        private readonly seedService:
            ISeedService
    ) {}

private influence(
    seed: bigint,
    domain: string
): number {

    const derivedSeed =
        this.seedService.deriveSeed(
            seed,
            domain
        );

    return this.nextNormalized(
        derivedSeed
    );
}

    public generate(
        planetSeed: bigint,
        regionCount: number
    ): Region[] {

        const regions:
            Region[] = [];

        for (
            let regionId = 0;
            regionId < regionCount;
            regionId++
        ) {

            const regionSeed =
                this.seedService.regionSeed(
                    planetSeed,
                    regionId
                );

            regions.push({

                id:
                    `region-${regionId}`,

                name:
                    `Region ${regionId}`,

                seed:
                    regionSeed,

                site:
                    this.generateSite(
                        regionSeed
                    ),

                climate: {

                    temperature:
                        this.influence(
                            regionSeed,
                            "temperature"
                        ),

                    moisture:
                        this.influence(
                            regionSeed,
                            "moisture"
                        ),

                    stormActivity:
                        this.influence(
                            regionSeed,
                            "storms"
                        )
                },

                geology: {

                    volcanism:
                        this.influence(
                            regionSeed,
                            "volcanism"
                        ),

                    resourceRichness:
                        this.influence(
                            regionSeed,
                            "resources"
                        ),

                    islandDensity:
                        this.influence(
                            regionSeed,
                            "islands"
                        )
                },

                activity: {

                    ancientActivity:
                        this.influence(
                            regionSeed,
                            "ancients"
                        ),

                    anomalyActivity:
                        this.influence(
                            regionSeed,
                            "anomalies"
                        )
                }
            });
        }

        return regions;
    }
    
    private generateSite(
        regionSeed: bigint
    ): WorldPosition {

        const bearingSeed =
            this.seedService.deriveSeed(
                regionSeed,
                "bearing"
            );

        const elevationSeed =
            this.seedService.deriveSeed(
                regionSeed,
                "elevation"
            );

        const bearing =
            this.nextNormalized(
                bearingSeed
            ) * 360;

        const elevation =
            (
                this.nextNormalized(
                    elevationSeed
                ) * 180
            ) - 90;

        return new WorldPosition(

            bearing,

            elevation,

            0
        );
    }

    private nextNormalized(
        seed: bigint
    ): number {

        const value =
            Number(
                seed &
                BigInt(
                    0xffffffff
                )
            );

        return (
            value /
            0xffffffff
        );
    }
}