import {
    WorldPosition,
    PlanetConstants
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
            Region[] =
            [];

        const sites:
            WorldPosition[] =
            [];

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

            const site =
                this.generateSite(
                    regionSeed,
                    sites
                );

            sites.push(
                site
            );

            regions.push({

                id:
                    `region-${regionId}`,

                name:
                    `Region ${regionId}`,

                seed:
                    regionSeed,

                site,

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
                        )
                },

                geology: {

                    volcanism:
                        this.influence(
                            regionSeed,
                            "volcanism"
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
        regionSeed: bigint,
        existingSites: WorldPosition[]
    ): WorldPosition {

        let attempt =
            0;

        while (
            true
        ) {

            const candidateSeed =
                this.seedService.deriveSeed(
                    regionSeed,
                    `attempt-${attempt++}`
                );

            const bearingSeed =
                this.seedService.deriveSeed(
                    candidateSeed,
                    "bearing"
                );

            const elevationSeed =
                this.seedService.deriveSeed(
                    candidateSeed,
                    "elevation"
                );

            const candidate =
                new WorldPosition(

                    this.nextNormalized(
                        bearingSeed
                    ) * 360,

                    (
                        this.nextNormalized(
                            elevationSeed
                        ) * 180
                    ) - 90,

                    0
                );

            const tooClose =
                existingSites.some(
                    (
                        site: WorldPosition
                    ) =>
                        candidate.angularDistanceTo(
                            site
                        ) <
                        PlanetConstants
                            .MinimumSiteSeparationDegrees
                );

            if (
                !tooClose
            ) {

                return candidate;
            }
        }
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