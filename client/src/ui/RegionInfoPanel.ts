import * as BABYLON
from "@babylonjs/core";

import * as GUI
from "@babylonjs/gui";

import type {
    Region
}
from "@archipeligo/shared";

export class RegionInfoPanel {

    private static texture:
        GUI.AdvancedDynamicTexture;

    private static panel:
        GUI.Rectangle;

    private static title:
        GUI.TextBlock;

    private static content:
        GUI.TextBlock;

    private static enterButton:
        GUI.Button;

    private static selectedRegion:
        Region | null =
        null;

    private static enterRegionHandler?:
        (
            region: Region
        ) => void;

    public static initialize(
        scene: BABYLON.Scene
    ): void {

        this.texture =
            GUI.AdvancedDynamicTexture
                .CreateFullscreenUI(
                    "ui",
                    true,
                    scene
                );

        this.panel =
            new GUI.Rectangle(
                "regionPanel"
            );

        this.panel.width =
            "320px";

        this.panel.height =
            "340px";

        this.panel.cornerRadius =
            10;

        this.panel.color =
            "white";

        this.panel.thickness =
            1;

        this.panel.background =
            "#202830";

        this.panel.horizontalAlignment =
            GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;

        this.panel.verticalAlignment =
            GUI.Control.VERTICAL_ALIGNMENT_TOP;

        this.panel.paddingTop =
            "20px";

        this.panel.paddingRight =
            "20px";

        this.panel.isVisible =
            false;

        this.texture.addControl(
            this.panel
        );

        const grid =
            new GUI.Grid();

        grid.width =
            1;

        grid.height =
            1;

        grid.addRowDefinition(
            40,
            true
        );

        grid.addRowDefinition(
            1
        );

        grid.addRowDefinition(
            50,
            true
        );

        this.panel.addControl(
            grid
        );

        //
        // Header
        //
        const header =
            new GUI.Rectangle();

        header.background =
            "#2b3642";

        header.thickness =
            0;

        grid.addControl(
            header,
            0,
            0
        );

        this.title =
            new GUI.TextBlock();

        this.title.text =
            "Region";

        this.title.color =
            "white";

        this.title.fontSize =
            18;

        this.title.textHorizontalAlignment =
            GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;

        this.title.paddingLeft =
            "10px";

        header.addControl(
            this.title
        );

        const closeButton =
            GUI.Button.CreateSimpleButton(
                "closeButton",
                "✕"
            );

        closeButton.width =
            "30px";

        closeButton.height =
            "30px";

        closeButton.color =
            "white";

        closeButton.background =
            "#803030";

        closeButton.cornerRadius =
            4;

        closeButton.horizontalAlignment =
            GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;

        closeButton.verticalAlignment =
            GUI.Control.VERTICAL_ALIGNMENT_CENTER;

        closeButton.left =
            "-5px";

        closeButton.onPointerClickObservable
            .add(
                () => {

                    this.hide();
                }
            );

        header.addControl(
            closeButton
        );

        //
        // Content Area
        //
        const contentContainer =
            new GUI.Rectangle();

        contentContainer.thickness =
            0;

        grid.addControl(
            contentContainer,
            1,
            0
        );

        this.content =
            new GUI.TextBlock();

        this.content.color =
            "white";

        this.content.fontSize =
            10;

        this.content.textWrapping =
            true;

        this.content.textHorizontalAlignment =
            GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;

        this.content.textVerticalAlignment =
            GUI.Control.VERTICAL_ALIGNMENT_TOP;

        this.content.paddingLeft =
            "10px";

        this.content.paddingRight =
            "10px";

        this.content.paddingTop =
            "10px";

        this.content.isHitTestVisible =
            false;

        contentContainer.addControl(
            this.content
        );

        //
        // Enter Region Button
        //
        this.enterButton =
            GUI.Button.CreateSimpleButton(
                "enterRegion",
                "Enter Region"
            );

        this.enterButton.width =
            "180px";

        this.enterButton.height =
            "40px";

        this.enterButton.color =
            "white";

        this.enterButton.background =
            "#2a6fd6";

        this.enterButton.cornerRadius =
            6;

        this.enterButton.thickness =
            0;

        this.enterButton.isEnabled =
            false;

        this.enterButton.horizontalAlignment =
            GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;

        this.enterButton.verticalAlignment =
            GUI.Control.VERTICAL_ALIGNMENT_CENTER;

        this.enterButton.onPointerClickObservable
            .add(
                () => {

                    if (
                        !this.selectedRegion ||
                        !this.enterRegionHandler
                    ) {

                        return;
                    }

                    this.enterRegionHandler(
                        this.selectedRegion
                    );
                }
            );

        grid.addControl(
            this.enterButton,
            2,
            0
        );
    }

    public static onEnterRegion(
        handler:
            (
                region: Region
            ) => void
    ): void {

        this.enterRegionHandler =
            handler;
    }

    public static hide(): void {

        this.panel.isVisible =
            false;
    }

    public static show(
        region: Region,
        areaKm2: number
    ): void {

        this.selectedRegion =
            region;

        this.title.text =
            region.name;

        this.content.text =
`
Area:
${Math.round(
    areaKm2
).toLocaleString()} km²

Temperature:
${region.climate.temperature.toFixed(2)}

Moisture:
${region.climate.moisture.toFixed(2)}

Volcanism:
${region.geology.volcanism.toFixed(2)}

Island Density:
${region.geology.islandDensity.toFixed(2)}
`;

        this.enterButton.isEnabled =
            true;

        this.panel.isVisible =
            true;
    }
}