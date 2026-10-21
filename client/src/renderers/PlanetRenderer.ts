import * as BABYLON
from "@babylonjs/core";

import type {
    Planet
}
from "@archipeligo/shared";

export class PlanetRenderer {

    public render(
        planet: Planet,
        scene: BABYLON.Scene
    ): BABYLON.Mesh {

        const mesh =
            new BABYLON.Mesh(
                "planet",
                scene
            );

        const colors =
            this.createColours(
                planet
            );

        const normals: number[] =
            [];

        BABYLON.VertexData
            .ComputeNormals(

                planet.mesh.vertices,

                planet.mesh.indices,

                normals
            );

        const vertexData =
            new BABYLON.VertexData();

        vertexData.positions =
            planet.mesh.vertices;

        vertexData.indices =
            planet.mesh.indices;

        vertexData.normals =
            normals;

        vertexData.colors =
            colors;

        vertexData.applyToMesh(
            mesh
        );

        const material =
            new BABYLON.StandardMaterial(
                "planet-material",
                scene
            );

        material.backFaceCulling =
            false;

        material.specularColor =
            BABYLON.Color3.Black();

        material.disableLighting =
            false;

        mesh.material =
            material;

        return mesh;
    }

    private createColours(
        planet: Planet
    ): number[] {

        const colours: number[] =
            [];

        const regionColours =
            new Map<
                string,
                [number, number, number]
            >();

        for (
            const region
            of planet.regions
        ) {

            regionColours.set(

                region.id,

                this.regionColour(
                    region.id
                )
            );
        }

        for (
            const cell
            of planet.mesh.cells
        ) {

            const colour =
                regionColours.get(
                    cell.regionId
                )!;

            colours.push(

                colour[0],

                colour[1],

                colour[2],

                1
            );
        }

        return colours;
    }

    private regionColour(
        regionId: string
    ): [number, number, number] {

        let hash = 0;

        for (
            const character
            of regionId
        ) {

            hash =

                (
                    (hash << 5)
                    - hash
                )

                +

                character.charCodeAt(
                    0
                );

            hash |= 0;
        }

        const r =
            (
                (
                    hash >> 16
                ) & 255
            ) / 255;

        const g =
            (
                (
                    hash >> 8
                ) & 255
            ) / 255;

        const b =
            (
                hash & 255
            ) / 255;

        return [

            Math.abs(r),

            Math.abs(g),

            Math.abs(b)
        ];
    }
}