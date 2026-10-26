import * as BABYLON
from "@babylonjs/core";

import {
    WorldPosition,
    Logger
}
from "@archipeligo/shared";

import type {
    Planet,
    Region
}
from "@archipeligo/shared";

import type {
    RenderMode
}
from "./RenderMode.js";

import {
    createNoise3D
}
from "simplex-noise";

type Color =
    [
        number,
        number,
        number,
        number
    ];

const cloudNoiseGenerator =
            createNoise3D();

export class PlanetRenderer {

    private static selectedRegionId:
        string | null =
        null;

    public static render(
        scene: BABYLON.Scene,
        planet: Planet,
        renderMode: RenderMode,
        onRegionSelected?:
            (
                region: Region
            ) => void
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

        if (
            renderMode ===
            "regions" &&
            onRegionSelected
        ) {

            this.enableRegionPicking(
                scene,
                mesh,
                planet,
                onRegionSelected
            );
        }

        const material =
            new BABYLON.StandardMaterial(
                "planetMaterial",
                scene
            );

        material.emissiveColor =
            new BABYLON.Color3(
                0.35,
                0.35,
                0.35
            );

        material.specularColor =
            BABYLON.Color3.Black();

        material.backFaceCulling =
            false;

        mesh.material =
            material;

        if (
            renderMode ===
            "default"
        ) {

            this.renderCloudShell(
                scene,
                planet,
                mesh
            );
        }
    }

    private static renderCloudShell(
        scene: BABYLON.Scene,
        planet: Planet,
        parent: BABYLON.Mesh
    ): void {

        const cloudMesh =
            new BABYLON.Mesh(
                "cloudShell",
                scene
            );

        cloudMesh.parent =
            parent;

        const positions =
            [
                ...planet.mesh.vertices
            ];

        const scale =
            1.005;

        for (
            let i = 0;
            i < positions.length;
            i += 3
        ) {

            positions[i] *=
                scale;

            positions[i + 1] *=
                scale;

            positions[i + 2] *=
                scale;
        }

        const vertexData =
            new BABYLON.VertexData();

        vertexData.positions =
            positions;

        vertexData.indices =
            planet.mesh.indices;

        const normals:
            number[] =
            [];

        BABYLON.VertexData.ComputeNormals(

            positions,

            planet.mesh.indices,

            normals
        );

        vertexData.normals =
            normals;

        vertexData.colors =
            this.buildCloudColors(
                planet
            );

        vertexData.applyToMesh(
            cloudMesh
        );

        const material =
            new BABYLON.StandardMaterial(
                "cloudMaterial",
                scene
            );

        material.specularColor =
            BABYLON.Color3.Black();

        material.backFaceCulling =
            false;

        material.emissiveColor =
            BABYLON.Color3.White();

        material.alphaMode =
            BABYLON.Constants.ALPHA_COMBINE;

        cloudMesh.hasVertexAlpha =
            true;

        cloudMesh.material =
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

            let color: Color;

            if (
                renderMode ===
                "default"
            ) {

                const blendedVolcanism =
                    this.blendedVolcanism(
                        planet,
                        cellId,
                        regionLookup
                    );

                color =
                    this.oceanColor(
                        blendedVolcanism
                    );
            }
            else {

                color =
                    this.getRegionColor(
                        region,
                        renderMode
                    );

                if (
                    renderMode ===
                        "regions" &&
                    this.selectedRegionId ===
                        region.id
                ) {

                    color = [

                        1,

                        1,

                        0,

                        1
                    ];
                }
            }

            colors.push(
                ...color
            );
        }

        return colors;
    }

    private static blendedStorminess(
        planet: Planet,
        cellId: number,
        regionLookup: Map<
            string,
            Region
        >
    ): number {

        const visited =
            new Set<number>();

        let total =
            0;

        let weightTotal =
            0;

        const accumulate =
            (
                id: number,
                weight: number
            ): void => {

                if (
                    visited.has(
                        id
                    )
                ) {
                    return;
                }

                visited.add(
                    id
                );

                const cell =
                    planet.mesh.cells[
                        id
                    ];

                const region =
                    regionLookup.get(
                        cell.regionId
                    );

                if (
                    !region
                ) {
                    return;
                }

                total +=
                    this.storminess(
                        region
                    ) *
                    weight;

                weightTotal +=
                    weight;
            };

        //
        // Ring 0
        //
        accumulate(
            cellId,
            1.5 //Ring 0 density here
        );

        const ring1:
            number[] =
            [];

        //
        // Ring 1
        //
        const offset =
            cellId * 6;

        for (
            let i = 0;
            i < 6;
            i++
        ) {

            const neighbourId =
                planet.mesh.neighbors[
                    offset + i
                ];

            if (
                neighbourId < 0
            ) {
                continue;
            }

            ring1.push(
                neighbourId
            );

            accumulate(
                neighbourId,
                0.5 //Ring 1 density here
            );
        }

        //
        // Ring 2
        //
        for (
            const ring1Id
            of ring1
        ) {

            const ring1Offset =
                ring1Id * 6;

            for (
                let i = 0;
                i < 6;
                i++
            ) {

                const ring2Id =
                    planet.mesh.neighbors[
                        ring1Offset + i
                    ];

                if (
                    ring2Id < 0
                ) {
                    continue;
                }

                accumulate(
                    ring2Id,
                    0.25 //Ring 2 density here
                );
            }
        }

        return weightTotal > 0
            ? total /
                weightTotal
            : 0;
    }

    private static blendedVolcanism(
        planet: Planet,
        cellId: number,
        regionLookup: Map<
            string,
            Region
        >
    ): number {

        const visited =
            new Set<number>();

        let total =
            0;

        let weightTotal =
            0;

        const accumulate =
            (
                id: number,
                weight: number
            ): void => {

                if (
                    visited.has(
                        id
                    )
                ) {
                    return;
                }

                visited.add(
                    id
                );

                const cell =
                    planet.mesh.cells[
                        id
                    ];

                const region =
                    regionLookup.get(
                        cell.regionId
                    );

                if (
                    !region
                ) {
                    return;
                }

                total +=
                    region
                        .geology
                        .volcanism *
                    weight;

                weightTotal +=
                    weight;
            };

        //
        // Ring 0
        //
        accumulate(
            cellId,
            1.5 //Ring 0 density here
        );

        const ring1:
            number[] =
            [];

        //
        // Ring 1
        //
        const offset =
            cellId * 6;

        for (
            let i = 0;
            i < 6;
            i++
        ) {

            const neighbourId =
                planet.mesh.neighbors[
                    offset + i
                ];

            if (
                neighbourId < 0
            ) {
                continue;
            }

            ring1.push(
                neighbourId
            );

            accumulate(
                neighbourId,
                0.5 //Ring 1 density here
            );
        }

        //
        // Ring 2
        //
        for (
            const ring1Id
            of ring1
        ) {

            const ring1Offset =
                ring1Id * 6;

            for (
                let i = 0;
                i < 6;
                i++
            ) {

                const ring2Id =
                    planet.mesh.neighbors[
                        ring1Offset + i
                    ];

                if (
                    ring2Id < 0
                ) {
                    continue;
                }

                accumulate(
                    ring2Id,
                    0.25 //Ring 2 density here
                );
            }
        }

        return weightTotal > 0
            ? total /
                weightTotal
            : 0;
    }

    private static cloudColor(
        density: number
    ): Color {

        const t =
            Math.max(
                0,
                Math.min(
                    1,
                    ( density - 0.15 ) / 0.10
                )
            );

        const coverage =
            t * t *
            (
                3 - 2 * t
            );

        return [

            1,

            1,

            1,

            coverage * 0.5 //this is the opacity of the clouds
        ];
    }

    private static buildCloudColors(
        planet: Planet
    ): number[] {

        const colors:
            number[] =
            [];

        const regionLookup =
            this.buildRegionLookup(
                planet
            );

        const positions =
            planet.mesh.vertices;

        let minDensity =
            Infinity;

        let maxDensity =
            -Infinity;

        for (
            let index = 0;
            index < planet.mesh.cells.length;
            index++
        ) {

            const cell =
                planet.mesh.cells[
                    index
                ];

            const region =
                regionLookup.get(
                    cell.regionId
                );

            if (
                !region
            ) {

                colors.push(
                    0,
                    0,
                    0,
                    0
                );

                continue;
            }

            const storminess =
                this.blendedStorminess(
                    planet,
                    index,
                    regionLookup
                );

            const x =
                positions[
                    index * 3
                ];

            const y =
                positions[
                    index * 3 + 1
                ];

            const z =
                positions[
                    index * 3 + 2
                ];

            const radius =
                Math.sqrt(
                    x * x +
                    y * y +
                    z * z
                );

            const nx =
                x / radius;

            const ny =
                y / radius;

            const nz =
                z / radius;

            const density =
                this.cloudDensity(
                    storminess,
                    nx,
                    ny,
                    nz
                );

            minDensity =
                Math.min(
                    minDensity,
                    density
                );

            maxDensity =
                Math.max(
                    maxDensity,
                    density
                );

            const color =
                this.cloudColor(
                    density
                );

            colors.push(
                ...color
            );
        }

        Logger.info(
            "Cloud density range",
            {
                minDensity,
                maxDensity
            }
        );

        return colors;
    }

    private static buildCloudCoverage(
        planet: Planet
    ): number[] {

        const coverage:
            number[] =
            [];

        const regionLookup =
            this.buildRegionLookup(
                planet
            );

        const positions =
            planet.mesh.vertices;

        for (
            let index = 0;
            index < planet.mesh.cells.length;
            index++
        ) {

            const cell =
                planet.mesh.cells[
                    index
                ];

            const region =
                regionLookup.get(
                    cell.regionId
                );

            if (
                !region
            ) {

                coverage.push(
                    0
                );

                continue;
            }

            const storminess =
                this.blendedStorminess(
                    planet,
                    index,
                    regionLookup
                );

            const x =
                positions[
                    index * 3
                ];

            const y =
                positions[
                    index * 3 + 1
                ];

            const z =
                positions[
                    index * 3 + 2
                ];

            const radius =
                Math.sqrt(
                    x * x +
                    y * y +
                    z * z
                );

            const nx =
                x / radius;

            const ny =
                y / radius;

            const nz =
                z / radius;

            coverage.push(

                this.cloudDensity(
                    storminess,
                    nx,
                    ny,
                    nz
                )
            );
        }

        return coverage;
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
                    this.storminess(
                        region
                    )
                );

            case "volcanism":

                return this.volcanismColor(
                    region.geology.volcanism
                );

            case "resources":

                return this.resourceColor(

                    region.geology.volcanism *
                    region.geology.islandDensity
                );

            case "islandDensity":

                return this.islandColor(
                    region.geology.islandDensity
                );

            default:

                return this.oceanColor(
                    region.geology.volcanism
                );
        }
    }

    private static storminess(
        region: Region
    ): number {

        return Math.max(

            0,

            Math.min(

                1,

                region.climate.temperature *
                region.climate.moisture
            )
        );
    }

    private static oceanColor(
        volcanism: number
    ): Color {

        const t =
            Math.max(
                0,
                Math.min(
                    1,
                    volcanism
                )
            );

        return [

            0.04 +
            (
                0.75 - 0.04
            ) * t,

            0.30 +
            (
                0.94 - 0.30
            ) * t,

            0.32 +
            (
                1.00 - 0.32
            ) * t,

            1
        ];
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

            (
                (hash >> 8) &
                255
            ) / 255,

            (
                (hash >> 16) &
                255
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

    private static cloudDensity(
        storminess: number,
        x: number,
        y: number,
        z: number
    ): number {

        const weather =
            this.cloudNoise(
                x,
                y,
                z
            );

        const latitude =
            Math.abs(
                y
            );

        const latitudeFactor =
            1 -
            latitude * 0.25;

        return (
            weather *
            latitudeFactor
        ) *
        (
            0.25 +
            storminess * 0.65
        );
    }

    private static cloudNoise(
        x: number,
        y: number,
        z: number
    ): number {

        const latitude =
            Math.asin(
                y
            );

        const compressedLatitude =
            latitude * 0.10;

        const octave1 =
            cloudNoiseGenerator(

                x * 2,

                y * 2,

                z * 2
            );

        const octave2 =
            cloudNoiseGenerator(

                x * 4,

                y * 4,

                z * 4
            );

        const octave3 =
            cloudNoiseGenerator(

                x * 8,

                y * 8,

                z * 8
            );

        const value =

            octave1 * 0.50 +

            octave2 * 0.35 +

            octave3 * 0.15;

        return (
            value + 1
        ) * 0.5;
    }

    private static refreshColors(
        mesh: BABYLON.Mesh,
        planet: Planet
    ): void {

        const colors =
            this.buildColors(
                planet,
                "regions"
            );

        mesh.setVerticesData(
            BABYLON.VertexBuffer.ColorKind,
            colors
        );
    }

    private static enableRegionPicking(
        scene: BABYLON.Scene,
        mesh: BABYLON.Mesh,
        planet: Planet,
        onRegionSelected:
            (
                region: Region
            ) => void
    ): void {

        scene.onPointerObservable.add(
            pointerInfo => {

                if (
                    pointerInfo.type !==
                    BABYLON.PointerEventTypes.POINTERPICK
                ) {

                    return;
                }

                const pick =
                    scene.pick(
                        scene.pointerX,
                        scene.pointerY
                    );

                if (
                    !pick?.hit ||
                    pick.pickedMesh !== mesh
                ) {

                    return;
                }

                if (
                    !pick?.hit
                ) {

                    RegionInfoPanel.hide();

                    return;
                }

                const faceId =
                    pick.faceId;

                if (
                    faceId ===
                    undefined
                ) {

                    return;
                }

                const indexOffset =
                    faceId * 3;

                const cellId =
                    planet.mesh.indices[
                        indexOffset
                    ];

                const cell =
                    planet.mesh.cells[
                        cellId
                    ];

                const region =
                    planet.regions.find(
                        r =>
                            r.id ===
                            cell.regionId
                    );

                if (
                    !region
                ) {

                    return;
                }

                Logger.info(
                    `Selected region ${region.id}`
                );

                this.selectedRegionId =
                    region.id;

                this.refreshColors(
                        mesh,
                        planet
                    );

                onRegionSelected(
                    region
                );
            }
        );
    }

}
