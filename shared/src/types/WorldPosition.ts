export class WorldPosition {

    /**
     * Longitude equivalent.
     *
     * Range:
     * 0 <= bearing < 360
     */
    public readonly bearing: number;

    /**
     * Latitude equivalent.
     *
     * Range:
     * -90 <= elevation <= 90
     */
    public readonly elevation: number;

    /**
     * Height above sea level.
     */
    public readonly altitudeKm: number;

    public constructor(
        bearing: number,
        elevation: number,
        altitudeKm = 0
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

        this.bearing = bearing;
        this.elevation = elevation;
        this.altitudeKm = altitudeKm;
    }

    public equals(
        other: WorldPosition
    ): boolean {

        return (
            this.bearing === other.bearing &&
            this.elevation === other.elevation &&
            this.altitudeKm === other.altitudeKm
        );
    }

    public toJSON(): object {

        return {
            bearing: this.bearing,
            elevation: this.elevation,
            altitudeKm: this.altitudeKm
        };
    }

    public toString(): string {

        return (
            `[${this.bearing.toFixed(2)}°, ` +
            `${this.elevation.toFixed(2)}°, ` +
            `${this.altitudeKm.toFixed(2)}km]`
        );
    }
}