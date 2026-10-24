import type {
    Planet,
    PlanetCell,
    PlanetLoadRequest,
    PlanetLoadResult,
    PlanetSummary
}
from "@archipeligo/shared";

import {
    WorldPosition
}
from "@archipeligo/shared";

import type {
    IPlanetRepository
}
from "../../../world/repositories/IPlanetRepository.js";

import {
    DatabaseFactory
}
from "../DatabaseFactory.js";

import {
    Logger
}
from "../../logging/Logger.js";

export class PostgresPlanetRepository
implements IPlanetRepository {

    public async save(
        planet: Planet
    ): Promise<void> {

        Logger.info(
            "=== SAVE PLANET START ==="
        );

        Logger.info(
            "Planet ID:",
            planet.id
        );

        const pool =
            DatabaseFactory.getPool();

        const client =
            await pool.connect();

        try {

            await client.query(
                "BEGIN"
            );

            Logger.debug(
                "Transaction started."
            );

            //
            // Planet
            //

            Logger.info(
                "Saving planet metadata..."
            );

            await client.query(
                `
                insert into planet
                (
                    id,
                    seed,
                    radius_km,
                    subdivisions,
                    region_count
                )
                values
                (
                    $1,$2,$3,$4,$5
                )
                on conflict (id)
                do update
                set
                    seed = excluded.seed,
                    radius_km = excluded.radius_km,
                    subdivisions = excluded.subdivisions,
                    region_count = excluded.region_count
                `,
                [
                    planet.id,
                    String(
                        planet.seed
                    ),
                    planet.radiusKm,
                    7,
                    planet.regions.length
                ]
            );

            Logger.debug(
                "Planet metadata saved."
            );

            //
            // Regions
            //

            Logger.debug(
                "Deleting existing regions..."
            );

            await client.query(
                `
                delete from region
                where planet_id = $1
                `,
                [
                    planet.id
                ]
            );

            Logger.info(
                `Saving ${planet.regions.length} regions...`
            );

            for (
                const region
                of planet.regions
            ) {

                await client.query(
                    `
                    insert into region
                    (
                        id,
                        planet_id,
                        name,
                        seed,

                        bearing,
                        elevation,

                        temperature,
                        moisture,

                        volcanism,
                        island_density,

                        ancient_activity,
                        anomaly_activity
                    )
                    values
                    (
                        $1,$2,$3,$4,
                        $5,$6,
                        $7,$8,
                        $9,$10,
                        $11,$12
                    )
                    `,
                    [

                        region.id,
                        planet.id,
                        region.name,
                        region.seed.toString(),

                        region.site.bearing,
                        region.site.elevation,

                        region.climate.temperature,
                        region.climate.moisture,

                        region.geology.volcanism,
                        region.geology.islandDensity,

                        region.activity.ancientActivity,
                        region.activity.anomalyActivity
                    ]
                );
            }

            Logger.debug(
                "Regions saved."
            );

            //
            // Cells
            //

            Logger.debug(
                "Deleting existing cells..."
            );

            await client.query(
                `
                delete from cell
                where planet_id = $1
                `,
                [
                    planet.id
                ]
            );

            Logger.info(
                `Saving ${planet.mesh.cells.length.toLocaleString()} cells...`
            );

            const batchSize = 1000;

            for (
                let start = 0;
                start < planet.mesh.cells.length;
                start += batchSize
            ) {

                const end =
                    Math.min(
                        start + batchSize,
                        planet.mesh.cells.length
                    );

                const values:
                    unknown[] =
                    [];

                const placeholders:
                    string[] =
                    [];

                let parameterIndex =
                    1;

                for (
                    let cellId = start;
                    cellId < end;
                    cellId++
                ) {

                    const cell =
                        planet.mesh.cells[
                            cellId
                        ];

                    const offset =
                        cellId * 6;

                    placeholders.push(

                        `(
                            $${parameterIndex++},
                            $${parameterIndex++},
                            $${parameterIndex++},
                            $${parameterIndex++},
                            $${parameterIndex++},
                            $${parameterIndex++},
                            $${parameterIndex++},
                            $${parameterIndex++},
                            $${parameterIndex++},
                            $${parameterIndex++},
                            $${parameterIndex++}
                        )`
                    );

                    values.push(

                        planet.id,

                        cellId,

                        cell.regionId,

                        cell.center.bearing,

                        cell.center.elevation,

                        planet.mesh.neighbors[
                            offset
                        ],

                        planet.mesh.neighbors[
                            offset + 1
                        ],

                        planet.mesh.neighbors[
                            offset + 2
                        ],

                        planet.mesh.neighbors[
                            offset + 3
                        ],

                        planet.mesh.neighbors[
                            offset + 4
                        ],

                        planet.mesh.neighbors[
                            offset + 5
                        ]
                    );
                }

                await client.query(
                    `
                    insert into cell
                    (
                        planet_id,
                        cell_id,
                        region_id,

                        bearing,
                        elevation,

                        neighbor_1,
                        neighbor_2,
                        neighbor_3,
                        neighbor_4,
                        neighbor_5,
                        neighbor_6
                    )
                    values
                    ${placeholders.join(",")}
                    `,
                    values
                );

                Logger.debug(
                    `Saved ${end.toLocaleString()} of ${planet.mesh.cells.length.toLocaleString()} cells...`
                );
            }
            //
            // Mesh
            //

            Logger.info(
                "Saving mesh..."
            );

            Logger.debug(
                "Removing existing mesh..."
            );

            await client.query(
                `
                delete from planet_mesh
                where planet_id = $1
                `,
                [
                    planet.id
                ]
            );

            Logger.debug(
                "Mesh diagnostics"
            );

            Logger.debug(
                "vertices length:",
                planet.mesh.vertices?.length
            );

            Logger.debug(
                "indices length:",
                planet.mesh.indices?.length
            );

            Logger.debug(
                "neighbors length:",
                planet.mesh.neighbors?.length
            );

            if (
                planet.mesh.vertices ===
                undefined
            ) {

                throw new Error(
                    "planet.mesh.vertices is undefined"
                );
            }

            if (
                planet.mesh.indices ===
                undefined
            ) {

                throw new Error(
                    "planet.mesh.indices is undefined"
                );
            }

            if (
                planet.mesh.neighbors ===
                undefined
            ) {

                throw new Error(
                    "planet.mesh.neighbors is undefined"
                );
            }

            const vertices =
                Buffer.from(
                    new Float32Array(
                        planet.mesh.vertices
                    ).buffer
                );

            const indices =
                Buffer.from(
                    new Uint32Array(
                        planet.mesh.indices
                    ).buffer
                );

            const neighbors =
                Buffer.from(
                    new Int32Array(
                        planet.mesh.neighbors
                    ).buffer
                );

            await client.query(
                `
                insert into planet_mesh
                (
                    planet_id,
                    vertices,
                    indices,
                    neighbors
                )
                values
                (
                    $1,$2,$3,$4
                )
                `,
                [
                    planet.id,
                    vertices,
                    indices,
                    neighbors
                ]
            );

            Logger.debug(
                "Mesh saved."
            );

            Logger.debug(
                `Vertices: ${planet.mesh.vertices.length}`
            );

            Logger.debug(
                `Indices: ${planet.mesh.indices.length}`
            );

            Logger.debug(
                `Neighbors: ${planet.mesh.neighbors.length}`
            );

            await client.query(
                "COMMIT"
            );

            Logger.info(
                "Transaction committed."
            );

            Logger.info(
                "=== SAVE PLANET COMPLETE ==="
            );
        }
        catch (
            error
        ) {

            Logger.error(
                "SAVE FAILED"
            );

            Logger.error(
                error
            );

            if (
                error instanceof Error
            ) {

                Logger.error(
                    error.message
                );

                Logger.error(
                    error.stack
                );
            }

            await client.query(
                "ROLLBACK"
            );

            throw error;
        }
        finally {

            client.release();

            Logger.debug(
                "Database connection released."
            );
        }
    }

    public async load(
        request: PlanetLoadRequest
    ): Promise<
        PlanetLoadResult | null
    > {

        const pool =
            DatabaseFactory.getPool();

        const client =
            await pool.connect();

        try {

            Logger.info(
                `Loading planet ${request.planetId}`
            );

            //
            // Planet
            //

            const planetResult =
                await client.query(
                    `
                    select *
                    from planet
                    where id = $1
                    `,
                    [
                        request.planetId
                    ]
                );

            if (
                planetResult.rows.length === 0
            ) {

                Logger.warn(
                    `Planet ${request.planetId} not found.`
                );

                return null;
            }

            const planetRow =
                planetResult.rows[0];

            Logger.debug(
                `Found planet ${planetRow.id}`
            );

            //
            // Regions
            //

            const regions =
                request.regions
                    ? (
                        await client.query(
                            `
                            select *
                            from region
                            where planet_id = $1
                            order by id
                            `,
                            [
                                request.planetId
                            ]
                        )
                    ).rows.map(
                        row => ({

                            id:
                                row.id,

                            name:
                                row.name,

                            seed:
                                BigInt(
                                    row.seed
                                ),

                            site:
                                new WorldPosition(

                                    row.bearing,

                                    row.elevation,

                                    0
                                ),

                            climate: {

                                temperature:
                                    row.temperature,

                                moisture:
                                    row.moisture
                            },

                            geology: {

                                volcanism:
                                    row.volcanism,

                                islandDensity:
                                    row.island_density
                            },

                            activity: {

                                ancientActivity:
                                    row.ancient_activity,

                                anomalyActivity:
                                    row.anomaly_activity
                            }
                        })
                    )
                    : [];

            Logger.info(
                `Loaded ${regions.length.toLocaleString()} regions.`
            );

            //
            // Cells
            //

            let cells:
                PlanetCell[] =
                [];

            let neighbors:
                Int32Array =
                    new Int32Array();

            if (
                request.cells
            ) {

                const cellResult =
                    await client.query(
                        `
                        select *
                        from cell
                        where planet_id = $1
                        order by cell_id
                        `,
                        [
                            request.planetId
                        ]
                    );

                cells =
                    cellResult.rows.map(
                        row => ({

                            id:
                                row.cell_id,

                            regionId:
                                row.region_id,

                            center:
                                new WorldPosition(

                                    row.bearing,

                                    row.elevation,

                                    0
                                )
                        })
                    );

                Logger.info(
                    `Loaded ${cells.length.toLocaleString()} cells.`
                );
            }

            //
            // Mesh
            //

            let vertices:
                number[] =
                [];

            let indices:
                number[] =
                [];

            if (
                request.mesh
            ) {

                const meshResult =
                    await client.query(
                        `
                        select *
                        from planet_mesh
                        where planet_id = $1
                        `,
                        [
                            request.planetId
                        ]
                    );

                if (
                    meshResult.rows.length > 0
                ) {

                    const meshRow =
                        meshResult.rows[0];

                    vertices =
                        Array.from(

                            new Float32Array(

                                meshRow.vertices.buffer,

                                meshRow.vertices.byteOffset,

                                meshRow.vertices.length / 4
                            )
                        );

                    indices =
                        Array.from(

                            new Uint32Array(

                                meshRow.indices.buffer,

                                meshRow.indices.byteOffset,

                                meshRow.indices.length / 4
                            )
                        );

                    neighbors =
                        new Int32Array(

                            meshRow.neighbors.buffer,

                            meshRow.neighbors.byteOffset,

                            meshRow.neighbors.length / 4
                        );

                    Logger.info(
                        "Loaded planet mesh."
                    );

                    Logger.debug(
                        `Vertices: ${vertices.length.toLocaleString()}`
                    );

                    Logger.debug(
                        `Indices: ${indices.length.toLocaleString()}`
                    );

                    Logger.debug(
                        `Neighbors: ${neighbors.length.toLocaleString()}`
                    );
                }
            }

            //
            // Assemble Planet
            //

            const planet: Planet = {

                id:
                    planetRow.id,

                seed:
                    BigInt(
                        planetRow.seed
                    ),

                radiusKm:
                    planetRow.radius_km,

                regions,

                mesh: {

                    cells,

                    vertices,

                    indices,

                    neighbors
                }
            };

            Logger.info(
                `Planet ${planet.id} loaded successfully.`
            );

            return {

                planet,

                loadedRegions:
                    regions.length,

                loadedCells:
                    cells.length
            };
        }
        catch (
            error
        ) {

            Logger.error(
                "Planet load failed."
            );

            Logger.error(
                error
            );

            throw error;
        }
        finally {

            client.release();

            Logger.debug(
                "Database connection released."
            );
        }
    }

    public async exists(
        planetId: string
    ): Promise<boolean> {

        const pool =
            DatabaseFactory.getPool();

        const result =
            await pool.query(
                `
                select 1
                from planet
                where id = $1
                `,
                [
                    planetId
                ]
            );

        return (
            result.rowCount ?? 0
        ) > 0;
    }

    public async list():
        Promise<
            PlanetSummary[]
        > {

        const pool =
            DatabaseFactory.getPool();

        const result =
            await pool.query(
                `
                select
                    id,
                    seed,
                    radius_km,
                    region_count,
                    created_at
                from planet
                order by created_at desc
                `
            );

        return result.rows.map(
            row => ({

                id:
                    row.id,

                seed:
                    BigInt(
                        row.seed
                    ),

                radiusKm:
                    row.radius_km,

                regionCount:
                    row.region_count,

                cellCount:
                    0,

                createdAt:
                    row.created_at
            })
        );
    }
}