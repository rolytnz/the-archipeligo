import * as BABYLON from "@babylonjs/core";
import { createScene } from "./scenes/PlanetScene.js";
const canvas = document.getElementById("renderCanvas");
const button = document.getElementById("generatePlanetButton");
let engine;
let scene;
button.addEventListener("click", async () => {
    const response = await fetch("/api/planet");
    const planet = await response.json();
    if (!engine) {
        engine =
            new BABYLON.Engine(canvas, true);
    }
    scene?.dispose();
    scene =
        createScene(engine, canvas, planet);
    engine.runRenderLoop(() => {
        scene?.render();
    });
});
window.addEventListener("resize", () => {
    engine?.resize();
});
//# sourceMappingURL=main.js.map