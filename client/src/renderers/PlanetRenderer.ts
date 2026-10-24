import * as BABYLON
from "@babylonjs/core";

import type {
    Planet,
    Region
}
from "@archipeligo/shared";

import type {
    RenderMode
}
from "./RenderMode.js";

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
        renderMode: RenderMode
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
            number[] =
            [];

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
        renderMode: RenderMode
    ): number[] {

        const colors:
            number[] =
            [];

        const regionLookup =
            this.buildRegionLookup(
                planet
            );

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

            const region =
                regionLookup.get(
                    cell.regionId
                );

            if (
                !region
            ) {

                colors.push(
                    1,
                    0,
                    1,
                    1
                );

                continue;
            }

            const color =
                this.getRegionColor(
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

    private static buildRegionLookup(
        planet: Planet
    ): Map<
        string,
        Region
    > {

        const result =
            new Map<
                string,
                Region
            >();

        for (
            const region
            of planet.regions
        ) {

            result.set(

                region.id,

                region
            );
        }

        return result;
    }

    private static getRegionColor(
        region: Region,
        renderMode: RenderMode
    ): Color {

        switch (
            renderMode
        ) {

            case "regions":

                return this.regionColor(
                    region.id
                );

            case "temperature":

                return this.temperatureColor(
                    region.climate.temperature
                );

            case "moisture":

                return this.moistureColor(
                    region.climate.moisture
                );

            case "storms":

                return this.stormColor(

                    region.climate.temperature * region.climate.moisture
                );

            case "volcanism":

                return this.volcanismColor(
                    region.geology.volcanism
                );

            case "resources":

                case "resources":

                    return this.resourceColor(
                        region.geology.volcanism * region.geology.islandDensity
                    );

            case "islandDensity":

                return this.islandColor(
                    region.geology.islandDensity
                );

            default:

                return [
                    1,
                    0,
                    1,
                    1
                ];
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

            (hash & 255)
                / 255,

            (
                (hash >> 8)
                & 255
            ) / 255,

            (
                (hash >> 16)
                & 255
            ) / 255,

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