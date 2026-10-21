import {
    PlanetCell,
    PlanetMesh,
    Region,
    Vector3
} from "@archipeligo/shared";

import { PlanetGeometryService }
from "./PlanetGeometryService.js";

interface Triangle {

    a: number;

    b: number;

    c: number;
}

export class PlanetMeshService {

    constructor(
        private readonly geometry:
            PlanetGeometryService
    ) {}

    public generateMesh(
        subdivisions: number,
        regions: Region[]
    ): PlanetMesh {

        const sphere =
            this.generateIcosphere(
                subdivisions
            );

        const vertices: number[] =
            [];

        const cells: PlanetCell[] =
            [];

        for (
            let i = 0;
            i < sphere.vertices.length;
            i++
        ) {

            const vertex =
                sphere.vertices[i];

            vertices.push(

                vertex.x,

                vertex.y,

                vertex.z
            );

            const center =
                this.geometry
                    .fromUnitVector(
                        vertex
                    );

            const region =
                this.geometry
                    .findNearestRegion(
                        center,
                        regions
                    );

            cells.push({

                id: i,

                center,

                regionId:
                    region.id,

                islandId:
                    undefined,

                isLand:
                    false,

                elevationM:
                    0,

                temperature:
                    0,

                moisture:
                    0,

                stormActivity:
                    0,

                resourceIds:
                    []
            });
        }

        const indices: number[] =
            [];

        for (
            const face
            of sphere.faces
        ) {

            indices.push(

                face.a,

                face.b,

                face.c
            );
        }

        return {

            vertices,

            indices,

            cells
        };
    }

    private generateIcosphere(
        subdivisions: number
    ): {

        vertices: Vector3[];

        faces: Triangle[];
    } {

        const t =
            (
                1 +
                Math.sqrt(5)
            ) / 2;

        const vertices: Vector3[] = [

            { x: -1, y:  t, z:  0 },
            { x:  1, y:  t, z:  0 },
            { x: -1, y: -t, z:  0 },
            { x:  1, y: -t, z:  0 },

            { x:  0, y: -1, z:  t },
            { x:  0, y:  1, z:  t },
            { x:  0, y: -1, z: -t },
            { x:  0, y:  1, z: -t },

            { x:  t, y:  0, z: -1 },
            { x:  t, y:  0, z:  1 },
            { x: -t, y:  0, z: -1 },
            { x: -t, y:  0, z:  1 }

        ].map(
            vertex =>
                this.normalize(
                    vertex
                )
        );

        let faces: Triangle[] = [

            { a: 0, b: 11, c: 5 },
            { a: 0, b: 5, c: 1 },
            { a: 0, b: 1, c: 7 },
            { a: 0, b: 7, c: 10 },
            { a: 0, b: 10, c: 11 },

            { a: 1, b: 5, c: 9 },
            { a: 5, b: 11, c: 4 },
            { a: 11, b: 10, c: 2 },
            { a: 10, b: 7, c: 6 },
            { a: 7, b: 1, c: 8 },

            { a: 3, b: 9, c: 4 },
            { a: 3, b: 4, c: 2 },
            { a: 3, b: 2, c: 6 },
            { a: 3, b: 6, c: 8 },
            { a: 3, b: 8, c: 9 },

            { a: 4, b: 9, c: 5 },
            { a: 2, b: 4, c: 11 },
            { a: 6, b: 2, c: 10 },
            { a: 8, b: 6, c: 7 },
            { a: 9, b: 8, c: 1 }
        ];

        for (
            let i = 0;
            i < subdivisions;
            i++
        ) {

            const cache =
                new Map<
                    string,
                    number
                >();

            const newFaces:
                Triangle[] = [];

            for (
                const face of faces
            ) {

                const ab =
                    this.getMidpoint(
                        face.a,
                        face.b,
                        vertices,
                        cache
                    );

                const bc =
                    this.getMidpoint(
                        face.b,
                        face.c,
                        vertices,
                        cache
                    );

                const ca =
                    this.getMidpoint(
                        face.c,
                        face.a,
                        vertices,
                        cache
                    );

                newFaces.push(

                    {
                        a: face.a,
                        b: ab,
                        c: ca
                    },

                    {
                        a: face.b,
                        b: bc,
                        c: ab
                    },

                    {
                        a: face.c,
                        b: ca,
                        c: bc
                    },

                    {
                        a: ab,
                        b: bc,
                        c: ca
                    }
                );
            }

            faces =
                newFaces;
        }

        return {

            vertices,

            faces
        };
    }

    private getMidpoint(
        a: number,
        b: number,
        vertices: Vector3[],
        cache: Map<string, number>
    ): number {

        const key =
            a < b
                ? `${a}:${b}`
                : `${b}:${a}`;

        const cached =
            cache.get(key);

        if (cached !== undefined) {

            return cached;
        }

        const midpoint =
            this.normalize({

                x:
                    (
                        vertices[a].x +
                        vertices[b].x
                    ) / 2,

                y:
                    (
                        vertices[a].y +
                        vertices[b].y
                    ) / 2,

                z:
                    (
                        vertices[a].z +
                        vertices[b].z
                    ) / 2
            });

        const index =
            vertices.push(
                midpoint
            ) - 1;

        cache.set(
            key,
            index
        );

        return index;
    }

    private normalize(
        vector: Vector3
    ): Vector3 {

        const length =
            Math.sqrt(

                vector.x * vector.x +

                vector.y * vector.y +

                vector.z * vector.z
            );

        return {

            x:
                vector.x / length,

            y:
                vector.y / length,

            z:
                vector.z / length
        };
    }
}