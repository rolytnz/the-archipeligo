import * as BABYLON
from "@babylonjs/core";

import type {
    Planet
}
from "@archipeligo/shared";

import {
    createScene
}
from "./scenes/PlanetScene.js";

import {
    type RenderMode,
    isRenderMode,
    getRenderModeLabel,
    getRenderModes
}
from "./renderers/RenderMode.js";

const canvas =
    document.getElementById(
        "renderCanvas"
    ) as HTMLCanvasElement;

const generatePlanetButton =
    document.getElementById(
        "generatePlanetButton"
    ) as HTMLButtonElement;

const renderModeSelect =
    document.getElementById(
        "renderMode"
    ) as HTMLSelectElement;

const stats =
    document.getElementById(
        "stats"
    ) as HTMLDivElement;

for (
    const mode
    of getRenderModes()
) {

    const option =
        document.createElement(
            "option"
        );

    option.value =
        mode.value;

    option.textContent =
        mode.label;

    renderModeSelect.appendChild(
        option
    );
}

const engine =
    new BABYLON.Engine(
        canvas,
        true
    );

let scene:
    BABYLON.Scene | undefined;

let currentPlanet:
    Planet | null = null;

function getRenderMode():
    RenderMode {

    const value =
        renderModeSelect.value;

    if (
        !isRenderMode(
            value
        )
    ) {

        throw new Error(
            `Invalid render mode: ${value}`
        );
    }

    return value;
}

function rebuildScene():
    void {

    if (
        !currentPlanet
    ) {

        return;
    }

    scene?.dispose();

    scene =
        createScene(
            engine,
            canvas,
            currentPlanet,
            getRenderMode()
        );
}

function updateStats():
    void {

    if (
        !currentPlanet
    ) {

        return;
    }

    stats.textContent =

        `Planet ID:
${currentPlanet.id}

Regions:
${currentPlanet.regions.length.toLocaleString()}

Cells:
${currentPlanet.mesh.cells.length.toLocaleString()}

Triangles:
${(
    currentPlanet.mesh.indices.length /
    3
).toLocaleString()}

Render Mode:
${getRenderModeLabel(
    getRenderMode()
)}`;
}

async function generatePlanet():
    Promise<void> {

    try {

        stats.textContent =
            "Generating and saving planet...";

        const response =
            await fetch(
                "/api/planet"
            );

        if (
            !response.ok
        ) {

            let message =
                `HTTP ${response.status}`;

            try {

                const errorBody =
                    await response.json();

                if (
                    errorBody?.message
                ) {

                    message =
                        errorBody.message;
                }
            }
            catch {

                //
                // Ignore JSON parsing failures
                //
            }

            throw new Error(
                message
            );
        }

        const planet:
            Planet =
                await response.json();

        currentPlanet =
            planet;

        rebuildScene();

        updateStats();
    }
    catch (
        error
    ) {

        console.error(
            error
        );

        stats.textContent =

            `Generation failed:

${
    error instanceof Error
        ? error.message
        : String(error)
}`;
    }
}

generatePlanetButton.addEventListener(

    "click",

    () => {

        void generatePlanet();
    }
);

renderModeSelect.addEventListener(

    "change",

    () => {

        if (
            !currentPlanet
        ) {

            return;
        }

        rebuildScene();

        updateStats();
    }
);

engine.runRenderLoop(

    () => {

        scene?.render();
    }
);

window.addEventListener(

    "resize",

    () => {

        engine.resize();
    }
);