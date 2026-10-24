import type {
    PlanetCell,
    PlanetMesh,
    Region,
    Vector3
}
from "@archipeligo/shared";

import { PlanetGeometryService }
from "./PlanetGeometryService.js";

interface Triangle {

    a: number;

    b: number;

    c: number;
}

interface Icosphere {

    vertices: Vector3[];

    faces: Triangle[];
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

        const adjacency =
            new Map<
                number,
                Set<number>
            >();

        for (
            const face
            of sphere.faces
        ) {

            this.link(
                adjacency,
                face.a,
                face.b
            );

            this.link(
                adjacency,
                face.b,
                face.c
            );

            this.link(
                adjacency,
                face.c,
                face.a
            );
        }

        const vertices:
            number[] = [];

        const cells:
            PlanetCell[] = [];

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
                });
        }

        const indices:
            number[] = [];

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

        const neighbors =
            new Int32Array(
                cells.length * 6
            );

        neighbors.fill(-1);

        for (
            let cellId = 0;
            cellId < cells.length;
            cellId++
        ) {

            const adjacent =
                Array.from(

                    adjacency.get(
                        cellId
                    ) ?? []
                );

            const offset =
                cellId * 6;

            for (
                let i = 0;
                i < adjacent.length &&
                i < 6;
                i++
            ) {

                neighbors[
                    offset + i
                ] =
                    adjacent[i];
            }
        }

        return {

            vertices,

            indices,

            cells,

            neighbors
        };
    }

    private link(
        adjacency: Map<
            number,
            Set<number>
        >,
        a: number,
        b: number
    ): void {

        let aSet =
            adjacency.get(a);

        if (!aSet) {

            aSet =
                new Set<number>();

            adjacency.set(
                a,
                aSet
            );
        }

        aSet.add(b);

        let bSet =
            adjacency.get(b);

        if (!bSet) {

            bSet =
                new Set<number>();

            adjacency.set(
                b,
                bSet
            );
        }

        bSet.add(a);
    }

    public getNeighbors(
        mesh: PlanetMesh,
        cellId: number
    ): number[] {

        const result:
            number[] = [];

        const offset =
            cellId * 6;

        for (
            let i = 0;
            i < 6;
            i++
        ) {

            const value =
                mesh.neighbors[
                    offset + i
                ];

            if (value >= 0) {

                result.push(
                    value
                );
            }
        }

        return result;
    }

private generateIcosphere(
    subdivisions: number
): Icosphere {

    const t =
        (1 + Math.sqrt(5)) / 2;

    const vertices:
        Vector3[] = [

        this.normalize({ x: -1, y:  t, z:  0 }),
        this.normalize({ x:  1, y:  t, z:  0 }),
        this.normalize({ x: -1, y: -t, z:  0 }),
        this.normalize({ x:  1, y: -t, z:  0 }),

        this.normalize({ x:  0, y: -1, z:  t }),
        this.normalize({ x:  0, y:  1, z:  t }),
        this.normalize({ x:  0, y: -1, z: -t }),
        this.normalize({ x:  0, y:  1, z: -t }),

        this.normalize({ x:  t, y:  0, z: -1 }),
        this.normalize({ x:  t, y:  0, z:  1 }),
        this.normalize({ x: -t, y:  0, z: -1 }),
        this.normalize({ x: -t, y:  0, z:  1 })
    ];

    let faces:
        Triangle[] = [

        { a: 0,  b: 11, c: 5 },
        { a: 0,  b: 5,  c: 1 },
        { a: 0,  b: 1,  c: 7 },
        { a: 0,  b: 7,  c: 10 },
        { a: 0,  b: 10, c: 11 },

        { a: 1,  b: 5,  c: 9 },
        { a: 5,  b: 11, c: 4 },
        { a: 11, b: 10, c: 2 },
        { a: 10, b: 7,  c: 6 },
        { a: 7,  b: 1,  c: 8 },

        { a: 3,  b: 9,  c: 4 },
        { a: 3,  b: 4,  c: 2 },
        { a: 3,  b: 2,  c: 6 },
        { a: 3,  b: 6,  c: 8 },
        { a: 3,  b: 8,  c: 9 },

        { a: 4,  b: 9,  c: 5 },
        { a: 2,  b: 4,  c: 11 },
        { a: 6,  b: 2,  c: 10 },
        { a: 8,  b: 6,  c: 7 },
        { a: 9,  b: 8,  c: 1 }
    ];

    for (
        let i = 0;
        i < subdivisions;
        i++
    ) {

        const midpointCache =
            new Map<
                string,
                number
            >();

        const newFaces:
            Triangle[] = [];

        for (
            const face
            of faces
        ) {

            const ab =
                this.getMidpoint(
                    face.a,
                    face.b,
                    vertices,
                    midpointCache
                );

            const bc =
                this.getMidpoint(
                    face.b,
                    face.c,
                    vertices,
                    midpointCache
                );

            const ca =
                this.getMidpoint(
                    face.c,
                    face.a,
                    vertices,
                    midpointCache
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
    cache: Map<
        string,
        number
    >
): number {

    const smaller =
        Math.min(
            a,
            b
        );

    const larger =
        Math.max(
            a,
            b
        );

    const key =
        `${smaller}:${larger}`;

    const cached =
        cache.get(
            key
        );

    if (
        cached !==
        undefined
    ) {

        return cached;
    }

    const v1 =
        vertices[a];

    const v2 =
        vertices[b];

    const midpoint =
        this.normalize({

            x:
                (v1.x + v2.x) / 2,

            y:
                (v1.y + v2.y) / 2,

            z:
                (v1.z + v2.z) / 2
        });

    const index =
        vertices.length;

    vertices.push(
        midpoint
    );

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

            vector.x *
            vector.x +

            vector.y *
            vector.y +

            vector.z *
            vector.z
        );

    return {

        x:
            vector.x /
            length,

        y:
            vector.y /
            length,

        z:
            vector.z /
            length
    };
}
}