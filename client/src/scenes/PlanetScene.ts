import * as BABYLON
from "@babylonjs/core";

import type {
    Planet
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

export function createScene(
    engine: BABYLON.Engine,
    canvas: HTMLCanvasElement,
    planet: Planet,
    renderMode: RenderMode
): BABYLON.Scene {

    const scene =
        new BABYLON.Scene(
            engine
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
        0.8;

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
        1.2;

    PlanetRenderer.render(

        scene,

        planet,

        renderMode
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