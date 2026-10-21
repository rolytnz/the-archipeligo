const button =
    document.getElementById(
        "generatePlanetButton"
    ) as HTMLButtonElement;

const output =
    document.getElementById(
        "output"
    ) as HTMLPreElement;

button.addEventListener(
    "click",
    async () => {

        output.textContent =
            "Generating...";

        const response =
            await fetch(
                "/api/planet"
            );

        const planet =
            await response.json();

        output.textContent =
            JSON.stringify(
                {
                    id:
                        planet.id,

                    radiusKm:
                        planet.radiusKm,

                    regions:
                        planet.regions.length,

                    vertices:
                        planet.mesh.vertices.length / 3,

                    triangles:
                        planet.mesh.indices.length / 3,

                    cells:
                        planet.mesh.cells.length
                },
                null,
                2
            );
    }
);