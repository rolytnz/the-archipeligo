export class WorldPosition {

    constructor(

        public readonly bearing:
            number,

        public readonly elevation:
            number,

        public readonly altitudeKm:
            number
    ) {

        if (
            bearing < 0 ||
            bearing >= 360
        ) {

            throw new Error(
                `Invalid bearing: ${bearing}`
            );
        }

        if (
            elevation < -90 ||
            elevation > 90
        ) {

            throw new Error(
                `Invalid elevation: ${elevation}`
            );
        }
    }

    public toCartesian(): {
        x: number;
        y: number;
        z: number;
    } {

        const latitude =
            this.elevation *
            Math.PI /
            180;

        const longitude =
            this.bearing *
            Math.PI /
            180;

        return {

            x:
                Math.cos(
                    latitude
                ) *
                Math.cos(
                    longitude
                ),

            y:
                Math.cos(
                    latitude
                ) *
                Math.sin(
                    longitude
                ),

            z:
                Math.sin(
                    latitude
                )
        };
    }

    public angularDistanceTo(
        other: WorldPosition
    ): number {

        const lat1 =
            this.elevation *
            Math.PI /
            180;

        const lat2 =
            other.elevation *
            Math.PI /
            180;

        const lon1 =
            this.bearing *
            Math.PI /
            180;

        const lon2 =
            other.bearing *
            Math.PI /
            180;

        const cosAngle =

            Math.sin(
                lat1
            ) *
            Math.sin(
                lat2
            )

            +

            Math.cos(
                lat1
            ) *
            Math.cos(
                lat2
            ) *
            Math.cos(
                lon1 - lon2
            );

        const angle =
            Math.acos(

                Math.max(
                    -1,
                    Math.min(
                        1,
                        cosAngle
                    )
                )
            );

        return (
            angle *
            180
        ) / Math.PI;
    }

    public static fromCartesian(
        x: number,
        y: number,
        z: number
    ): WorldPosition {

        const length =
            Math.sqrt(

                x * x +

                y * y +

                z * z
            );

        x /= length;
        y /= length;
        z /= length;

        const latitude =
            Math.asin(
                z
            ) *
            180 /
            Math.PI;

        let longitude =
            Math.atan2(
                y,
                x
            ) *
            180 /
            Math.PI;

        longitude =
            WorldPosition
                .normalizeBearing(
                    longitude
                );

        return new WorldPosition(

            longitude,

            latitude,

            0
        );
    }

    private static normalizeBearing(
        bearing: number
    ): number {

        bearing %= 360;

        if (
            bearing < 0
        ) {

            bearing += 360;
        }

        return bearing;
    }
}