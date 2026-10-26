import * as BABYLON
from "@babylonjs/core";

import type {
    Planet,
    Region
}
from "@archipeligo/shared";

import {
    Logger
}
from "@archipeligo/shared";

export class GameplayRenderer {

    public static render(
        scene: BABYLON.Scene,
        planet: Planet,
        region: Region
    ): void {

        Logger.info(
            `Entering region ${region.id}`
        );

        this.clearScene(
            scene
        );

        this.renderOcean(
            scene
        );

        this.renderShip(
            scene,
            region
        );

        this.configureCamera(
            scene
        );
    }

    private static clearScene(
        scene: BABYLON.Scene
    ): void {

        const meshes =
            [
                ...scene.meshes
            ];

        for (
            const mesh
            of meshes
        ) {

            if (
                mesh.name ===
                "__root__"
            ) {

                continue;
            }

            mesh.dispose();
        }
    }

    private static renderOcean(
        scene: BABYLON.Scene
    ): void {

        const ocean =
            BABYLON.MeshBuilder
                .CreateGround(
                    "ocean",
                    {
                        width: 20000,
                        height: 20000
                    },
                    scene
                );

        const material =
            new BABYLON.StandardMaterial(
                "oceanMaterial",
                scene
            );

        material.diffuseColor =
            new BABYLON.Color3(
                0.12,
                0.45,
                0.85
            );

        material.specularColor =
            BABYLON.Color3.Black();

        ocean.material =
            material;
    }

    private static renderShip(
        scene: BABYLON.Scene,
        region: Region
    ): BABYLON.Mesh {

        Logger.debug(
            `Spawning ship in region ${region.id}`
        );

        const ship =
            BABYLON.MeshBuilder
                .CreateBox(
                    "playerShip",
                    {
                        width: 20,
                        height: 10,
                        depth: 40
                    },
                    scene
                );

        ship.position =
            this.spawnPosition(
                region
            );

        const material =
            new BABYLON.StandardMaterial(
                "shipMaterial",
                scene
            );

        material.diffuseColor =
            new BABYLON.Color3(
                0.8,
                0.8,
                0.8
            );

        ship.material =
            material;

        return ship;
    }

    private static spawnPosition(
        region: Region
    ): BABYLON.Vector3 {

        return new BABYLON.Vector3(

            0,

            50,

            0
        );
    }

    private static configureCamera(
        scene: BABYLON.Scene
    ): void {

        const existing =
            scene.getCameraByName(
                "gameplayCamera"
            );

        if (
            existing
        ) {

            existing.dispose();
        }

        const camera =
            new BABYLON.UniversalCamera(
                "gameplayCamera",
                new BABYLON.Vector3(
                    -200,
                    120,
                    -200
                ),
                scene
            );

        camera.setTarget(
            new BABYLON.Vector3(
                0,
                50,
                0
            )
        );

        camera.attachControl(
            true
        );

        camera.speed =
            10;

        camera.minZ =
            0.1;

        scene.activeCamera =
            camera;
    }
}