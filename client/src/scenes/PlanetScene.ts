import * as BABYLON
from "@babylonjs/core";

import type {
    Planet,
    Region
}
from "@archipeligo/shared";

import {
    PlanetRenderer
}
from "../renderers/PlanetRenderer.js";

import type {
    RenderMode
}
from "../renderers/RenderMode.js";

import {
    Logger
}
from "@archipeligo/shared";

import {
    RegionInfoPanel
}
from "../ui/RegionInfoPanel.js";

export function createScene(
    engine: BABYLON.Engine,
    canvas: HTMLCanvasElement,
    planet: Planet,
    renderMode: RenderMode
): BABYLON.Scene {

    function regionareaKm2(
        planet: Planet,
        region: Region
    ): number {

        const regionCellCount =
            planet.mesh.cells.filter(
                cell =>
                    cell.regionId ===
                    region.id
            ).length;

        const totalCellCount =
            planet.mesh.cells.length;

        const planetAreaKm2 =
            4 *
            Math.PI *
            60000 *
            60000;

        return (
            planetAreaKm2 *
            regionCellCount
        ) /
        totalCellCount;
    }

    const scene =
        new BABYLON.Scene(
            engine
        );

    RegionInfoPanel.initialize(
        scene
    );

    RegionInfoPanel.onEnterRegion(
        region => {

            Logger.info(
                `Entering region ${region.id}`
            );

            // GameplayRenderer.render(...)
        }
    );

    scene.clearColor =
        new BABYLON.Color4(
            0.05,
            0.07,
            0.10,
            1
        );


    const camera =
        new BABYLON.ArcRotateCamera(

            "camera",

            -Math.PI / 2,

            Math.PI / 2.8,

            3,

            BABYLON.Vector3.Zero(),

            scene
        );

    camera.attachControl(
        canvas,
        true
    );

    camera.wheelDeltaPercentage =
        0.001;

    camera.lowerRadiusLimit =
        1.2;

    camera.upperRadiusLimit =
        10;

    camera.panningSensibility =
        0;

    const hemisphericLight =
        new BABYLON.HemisphericLight(

            "hemisphericLight",

            new BABYLON.Vector3(
                1,
                1,
                0
            ),

            scene
        );

    hemisphericLight.intensity =
        1.0;

    const directionalLight =
        new BABYLON.DirectionalLight(

            "sun",

            new BABYLON.Vector3(
                -1,
                -1,
                -0.5
            ),

            scene
        );

    directionalLight.intensity =
        1.0;

    PlanetRenderer.render(

        scene,

        planet,

        renderMode,

        region => {

            Logger.info(
                `Selected region ${region.name}`
            );

            const areaKm2 =
                regionareaKm2(
                    planet,
                    region
                );

            RegionInfoPanel.show(
                region,
                areaKm2
            );
        }
    );

    scene.onBeforeRenderObservable
        .add(
            () => {

                const mesh =
                    scene.getMeshByName(
                        "planet"
                    );

                if (mesh) {

                    mesh.rotation.y +=
                        0.0005;
                }
            }
        );

    return scene;
}

