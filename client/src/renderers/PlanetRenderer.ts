import * as BABYLON
from "@babylonjs/core";

import type {
    Planet,
    Region
}
from "@archipeligo/shared";

type Color =
    [
        number,
        number,
        number,
        number
    ];

export class PlanetRenderer {

    public static render(
        scene: BABYLON.Scene,
        planet: Planet,
        renderMode: string
    ): void {

        const mesh =
            new BABYLON.Mesh(
                "planet",
                scene
            );

        const vertexData =
            new BABYLON.VertexData();

        vertexData.positions =
            planet.mesh.vertices;

        vertexData.indices =
            planet.mesh.indices;

        const normals:
            number[] = [];

        BABYLON.VertexData.ComputeNormals(

            vertexData.positions,

            vertexData.indices,

            normals
        );

        vertexData.normals =
            normals;

        vertexData.colors =
            this.buildColors(
                planet,
                renderMode
            );

        vertexData.applyToMesh(
            mesh
        );

        const material =
            new BABYLON.StandardMaterial(

                "planetMaterial",

                scene
            );

        material.specularColor =
            BABYLON.Color3.Black();

        material.backFaceCulling =
            false;

        mesh.material =
            material;
    }

    private static buildColors(
        planet: Planet,
        renderMode: string
    ): number[] {

        const colors:
            number[] = [];

        const regionLookup =
            new Map<
                string,
                Region
            >();

        for (
            const region
            of planet.regions
        ) {

            regionLookup.set(
                region.id,
                region
            );
        }

        for (
            const cell
            of planet.mesh.cells
        ) {

            const region =
                regionLookup.get(
                    cell.regionId
                );

            if (!region) {

                colors.push(
                    1,
                    0,
                    1,
                    1
                );

                continue;
            }

            const color =
                this.getCellColor(
                    region,
                    renderMode
                );

            colors.push(
                color[0],
                color[1],
                color[2],
                color[3]
            );
        }

        return colors;
    }

    private static getCellColor(
        region: Region,
        renderMode: string
    ): Color {

        switch (
            renderMode
        ) {

            case "Temperature":

                return this.temperatureColor(
                    region.climate.temperature
                );

            case "Moisture":

                return this.moistureColor(
                    region.climate.moisture
                );

            case "Storms":

                return this.stormColor(
                    region.climate.stormActivity
                );

            case "Volcanism":

                return this.volcanismColor(
                    region.geology.volcanism
                );

            case "Resources":

                return this.resourceColor(
                    region.geology.resourceRichness
                );

            case "IslandDensity":

                return this.islandColor(
                    region.geology.islandDensity
                );

            default:

                return this.regionColor(
                    region.id
                );
        }
    }

    private static temperatureColor(
        value: number
    ): Color {

        return [
            value,
            0,
            1 - value,
            1
        ];
    }

    private static moistureColor(
        value: number
    ): Color {

        return [
            0,
            value,
            0,
            1
        ];
    }

    private static stormColor(
        value: number
    ): Color {

        return [
            value,
            value,
            0,
            1
        ];
    }

    private static volcanismColor(
        value: number
    ): Color {

        return [
            value,
            value * 0.35,
            0,
            1
        ];
    }

    private static resourceColor(
        value: number
    ): Color {

        return [
            value,
            value,
            value * 0.2,
            1
        ];
    }

    private static islandColor(
        value: number
    ): Color {

        return [
            0,
            value,
            value,
            1
        ];
    }

    private static regionColor(
        regionId: string
    ): Color {

        const hash =
            this.hash(
                regionId
            );

        return [

            (hash & 255) / 255,

            ((hash >> 8) & 255) / 255,

            ((hash >> 16) & 255) / 255,

            1
        ];
    }

    private static hash(
        value: string
    ): number {

        let hash =
            0;

        for (
            let i = 0;
            i < value.length;
            i++
        ) {

            hash =
                (
                    (hash << 5)
                    - hash
                )
                +
                value.charCodeAt(
                    i
                );

            hash |= 0;
        }

        return Math.abs(
            hash
        );
    }
}