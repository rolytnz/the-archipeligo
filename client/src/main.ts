import * as BABYLON
from "@babylonjs/core";

import type {
    Planet,
    PlanetSummary
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

import {
    Logger,
    LogLevel
}
from "@archipeligo/shared";

Logger.setLevel(
    LogLevel.Debug
);

const canvas =
    document.getElementById(
        "renderCanvas"
    ) as HTMLCanvasElement;

const planetSelect =
    document.getElementById(
        "planetSelect"
    ) as HTMLSelectElement;

const loadPlanetButton =
    document.getElementById(
        "loadPlanetButton"
    ) as HTMLButtonElement;

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

async function refreshPlanetList():
    Promise<void> {

    const response =
        await fetch(
            "/api/planets"
        );

    if (
        !response.ok
    ) {

        throw new Error(
            "Failed to load planet list."
        );
    }

    const planets:
        PlanetSummary[] =
            await response.json();

    planetSelect.innerHTML =
        "";

    for (
        const planet
        of planets
    ) {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            planet.id;

        option.textContent =

            `${planet.id.substring(0, 8)}
            | ${planet.regionCount} regions
            | ${new Date(planet.createdAt).toLocaleString()}`;

        planetSelect.appendChild(
            option
        );
    }
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
    await refreshPlanetList();
    updateStats();
}

async function loadPlanet():
    Promise<void> {

    try {

        const planetId =
            planetSelect.value;

        if (
            !planetId
        ) {

            throw new Error(
                "No planet selected."
            );
        }

        stats.textContent =
            "Loading planet...";

        const response =
            await fetch(
                `/api/planet/${planetId}`
            );

        if (
            !response.ok
        ) {

            throw new Error(
                `HTTP ${response.status}`
            );
        }

        const result =
            await response.json();

        currentPlanet =
            result.planet;

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

            `Load failed:

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

loadPlanetButton.addEventListener(

    "click",

    () => {

        void loadPlanet();
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

void refreshPlanetList();