import type {
    Planet
}
from "@archipeligo/shared";

export class PlanetMapper {

    public static toPlanetRow(
        planet: Planet
    ) {

        return {

            id:
                planet.id,

            seed:
                planet.seed
                    .toString(),

            radius_km:
                planet.radiusKm
        };
    }
}