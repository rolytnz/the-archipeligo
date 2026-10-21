import {
    Region,
    WorldPosition
} from "@archipeligo/shared";

export class RegionGenerator {

    public generate(
        seed: bigint,
        regionCount: number
    ): Region[] {

        const regions: Region[] = [];

        let state = seed;

        for (
            let i = 0;
            i < regionCount;
            i++
        ) {

            const regionSeed = state;

            regions.push({

                id: `region-${i}`,

                name: `Region ${i}`,

                seed: regionSeed,

                site: this.generateFibonacciSite(
                    i,
                    regionCount,
                    regionSeed
                ),

                climate: {

                    temperature:
                        this.nextNormalized(
                            this.mix(regionSeed, 1)
                        ),

                    moisture:
                        this.nextNormalized(
                            this.mix(regionSeed, 2)
                        ),

                    stormActivity:
                        this.nextNormalized(
                            this.mix(regionSeed, 3)
                        )
                },

                geology: {

                    volcanism:
                        this.nextNormalized(
                            this.mix(regionSeed, 4)
                        ),

                    resourceRichness:
                        this.nextNormalized(
                            this.mix(regionSeed, 5)
                        ),

                    islandDensity:
                        this.nextNormalized(
                            this.mix(regionSeed, 6)
                        )
                },

                activity: {

                    ancientActivity:
                        this.nextNormalized(
                            this.mix(regionSeed, 7)
                        ),

                    anomalyActivity:
                        this.nextNormalized(
                            this.mix(regionSeed, 8)
                        )
                }
            });

            state =
                this.nextSeed(
                    regionSeed
                );
        }

        return regions;
    }

    private generateFibonacciSite(
        index: number,
        total: number,
        seed: bigint
    ): WorldPosition {

        const goldenAngle =
            Math.PI *
            (
                3 -
                Math.sqrt(5)
            );

        const y =
            1 -
            (
                (index + 0.5)
                * 2
                / total
            );

        const radius =
            Math.sqrt(
                1 -
                (y * y)
            );

        const theta =
            goldenAngle *
            index;

        const x =
            Math.cos(theta) *
            radius;

        const z =
            Math.sin(theta) *
            radius;

        let bearing =
            Math.atan2(
                z,
                x
            ) *
            180 /
            Math.PI;

        if (bearing < 0) {

            bearing += 360;
        }

        const elevation =
            Math.asin(y) *
            180 /
            Math.PI;

        const maxJitterDegrees =
            20 /
            Math.sqrt(total);

        const bearingJitter =
            (
                this.nextNormalized(
                    this.mix(
                        seed,
                        100
                    )
                ) - 0.5
            ) *
            (
                maxJitterDegrees * 2
            );

        const elevationJitter =
            (
                this.nextNormalized(
                    this.mix(
                        seed,
                        101
                    )
                ) - 0.5
            ) *
            (
                maxJitterDegrees * 2
            );

        return new WorldPosition(

            this.normalizeBearing(
                bearing +
                bearingJitter
            ),

            Math.max(
                -90,
                Math.min(
                    90,
                    elevation +
                    elevationJitter
                )
            )
        );
    }

    private nextSeed(
        seed: bigint
    ): bigint {

        return (
            seed *
            6364136223846793005n +
            1442695040888963407n
        );
    }

    private mix(
        seed: bigint,
        salt: number
    ): bigint {

        return (
            seed ^
            (
                BigInt(salt) *
                0x9E3779B97F4A7C15n
            )
        );
    }

    private nextNormalized(
        seed: bigint
    ): number {

        const value =
            Number(
                seed &
                0xffffffffn
            );

        return (
            value /
            0xffffffff
        );
    }

    private normalizeBearing(
        bearing: number
    ): number {

        return (
            (
                bearing % 360
            ) + 360
        ) % 360;
    }
}