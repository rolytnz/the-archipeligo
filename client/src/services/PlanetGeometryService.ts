import {
    WorldPosition
}
from "@archipeligo/shared";

import type {
    Region,
    Vector3
}
from "@archipeligo/shared";

export class PlanetGeometryService {

    constructor(
        private readonly radiusKm: number
    ) {}

    /**
     * Convert a WorldPosition to
     * Cartesian coordinates.
     */
    public toCartesian(
        position: WorldPosition
    ): Vector3 {

        const latitude =
            this.toRadians(
                position.elevation
            );

        const longitude =
            this.toRadians(
                position.bearing
            );

        const radius =
            this.radiusKm +
            position.altitudeKm;

        return {

            x:
                radius *
                Math.cos(latitude) *
                Math.cos(longitude),

            y:
                radius *
                Math.cos(latitude) *
                Math.sin(longitude),

            z:
                radius *
                Math.sin(latitude)
        };
    }

    /**
     * Convert Cartesian coordinates
     * back into a WorldPosition.
     */
    public fromCartesian(
        point: Vector3
    ): WorldPosition {

        const radius =
            Math.sqrt(

                point.x * point.x +

                point.y * point.y +

                point.z * point.z
            );

        const elevation =
            this.toDegrees(

                Math.asin(
                    point.z / radius
                )
            );

        let bearing =
            this.toDegrees(

                Math.atan2(
                    point.y,
                    point.x
                )
            );

        if (bearing < 0) {

            bearing += 360;
        }

        return new WorldPosition(

            bearing,

            elevation,

            radius -
            this.radiusKm
        );
    }

    /**
     * Convert a normalized
     * unit-sphere vector into
     * a WorldPosition.
     */
    public fromUnitVector(
        vector: Vector3
    ): WorldPosition {

        return this.fromCartesian({

            x:
                vector.x *
                this.radiusKm,

            y:
                vector.y *
                this.radiusKm,

            z:
                vector.z *
                this.radiusKm
        });
    }

    /**
     * Unit vector describing a
     * position on the surface.
     */
    public toUnitVector(
        position: WorldPosition
    ): Vector3 {

        const latitude =
            this.toRadians(
                position.elevation
            );

        const longitude =
            this.toRadians(
                position.bearing
            );

        return {

            x:
                Math.cos(latitude) *
                Math.cos(longitude),

            y:
                Math.cos(latitude) *
                Math.sin(longitude),

            z:
                Math.sin(latitude)
        };
    }

    /**
     * Dot-product similarity.
     */
    public dotSimilarity(
        a: WorldPosition,
        b: WorldPosition
    ): number {

        const av =
            this.toUnitVector(a);

        const bv =
            this.toUnitVector(b);

        return (

            av.x * bv.x +

            av.y * bv.y +

            av.z * bv.z
        );
    }

    /**
     * Great-circle distance
     * in radians.
     */
    public angularDistance(
        a: WorldPosition,
        b: WorldPosition
    ): number {

        const dot =
            this.dotSimilarity(
                a,
                b
            );

        return Math.acos(

            Math.max(
                -1,
                Math.min(
                    1,
                    dot
                )
            )
        );
    }

    /**
     * Great-circle distance
     * in kilometres.
     */
    public distanceKm(
        a: WorldPosition,
        b: WorldPosition
    ): number {

        return (

            this.radiusKm *

            this.angularDistance(
                a,
                b
            )
        );
    }

    /**
     * Finds the nearest
     * Voronoi region.
     */
    public findNearestRegion(
        position: WorldPosition,
        regions: Region[]
    ): Region {

        const firstRegion =
            regions[0];

        if (!firstRegion) {

            throw new Error(
                "No regions supplied."
            );
        }

        let nearest =
            firstRegion;

        let shortestDistance =
            Number.MAX_VALUE;

        for (
            const region
            of regions
        ) {

            const distance =
                this.angularDistance(
                    position,
                    region.site
                );

            if (
                distance <
                shortestDistance
            ) {

                shortestDistance =
                    distance;

                nearest =
                    region;
            }
        }

        return nearest;
    }

    /**
     * Gaussian regional influence.
     *
     * Returns a value between 0 and 1.
     */
    public influenceFromRegion(
        position: WorldPosition,
        region: Region,
        sigmaDegrees = 15
    ): number {

        const distanceDegrees =
            this.toDegrees(

                this.angularDistance(
                    position,
                    region.site
                )
            );

        const influence =
            Math.exp(

                -(
                    distanceDegrees *
                    distanceDegrees
                ) /

                (
                    2 *
                    sigmaDegrees *
                    sigmaDegrees
                )
            );

        return Math.max(
            0,
            Math.min(
                1,
                influence
            )
        );
    }

    private toRadians(
        degrees: number
    ): number {

        return (

            degrees *

            Math.PI

        ) / 180;
    }

    private toDegrees(
        radians: number
    ): number {

        return (

            radians *

            180

        ) / Math.PI;
    }
}