export const RenderModes = {

    Default: {

        value:
            "default",

        label:
            "Default"
    },

    Regions: {

        value:
            "regions",

        label:
            "Regions"
    },

    Temperature: {

        value:
            "temperature",

        label:
            "Temperature"
    },

    Moisture: {

        value:
            "moisture",

        label:
            "Moisture"
    },

    Storms: {

        value:
            "storms",

        label:
            "Storms"
    },

    Volcanism: {

        value:
            "volcanism",

        label:
            "Volcanism"
    },

    Resources: {

        value:
            "resources",

        label:
            "Resources"
    },

    IslandDensity: {

        value:
            "islandDensity",

        label:
            "Island Density"
    }
} as const;

export type RenderMode =
    typeof RenderModes[
        keyof typeof RenderModes
    ]["value"];

export function isRenderMode(
    value: string
): value is RenderMode {

    return Object
        .values(
            RenderModes
        )
        .some(
            mode =>
                mode.value ===
                value
        );
}

export function getRenderModeLabel(
    renderMode: RenderMode
): string {

    const mode =
        Object.values(
            RenderModes
        )
        .find(
            mode =>
                mode.value ===
                renderMode
        );

    return mode?.label ??
        renderMode;
}

export function getRenderModes():
    readonly
    {
        readonly value:
            RenderMode;

        readonly label:
            string;
    }[] {

    return Object.values(
        RenderModes
    );
}