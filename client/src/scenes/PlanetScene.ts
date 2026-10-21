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

export function createScene(
    engine: BABYLON.Engine,
    canvas: HTMLCanvasElement,
    planet: Planet
): BABYLON.Scene {

    const scene =
        new BABYLON.Scene(
            engine
        );

    scene.clearColor =
        new BABYLON.Color4(
            0.02,
            0.02,
            0.05,
            1
        );

    const camera =
        new BABYLON.ArcRotateCamera(

            "camera",

            0,

            Math.PI / 2.5,

            3,

            BABYLON.Vector3.Zero(),

            scene
        );

    camera.lowerRadiusLimit =
        1.5;

    camera.upperRadiusLimit =
        10;

    camera.attachControl(
        canvas,
        true
    );

    const hemisphericLight =
        new BABYLON.HemisphericLight(

            "hemi",

            new BABYLON.Vector3(
                0,
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
                -1
            ),

            scene
        );

    directionalLight.intensity =
        0.5;

    const renderer =
        new PlanetRenderer();

    const planetMesh =
        renderer.render(
            planet,
            scene
        );

    scene.onBeforeRenderObservable
        .add(() => {

            planetMesh.rotation.y +=
                0.001;
        });

    return scene;
}
