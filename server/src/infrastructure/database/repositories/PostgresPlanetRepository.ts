import type {
    Planet
}
from "@archipeligo/shared";

import type {
    IPlanetRepository
}
from "../../../world/repositories/IPlanetRepository.js";

import type {
    PlanetSummary
}
from "../../../world/repositories/PlanetSummary.js";

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
                        planet_id,
                        id,
                        name,
                        seed,

                        bearing,
                        elevation,

                        temperature,
                        moisture,
                        storm_activity,

                        volcanism,
                        resource_richness,
                        island_density,

                        ancient_activity,
                        anomaly_activity
                    )
                    values
                    (
                        $1,$2,$3,$4,
                        $5,$6,
                        $7,$8,$9,
                        $10,$11,$12,
                        $13,$14
                    )
                    `,
                    [
                        planet.id,

                        region.id,

                        region.name,

                        String(
                            region.seed
                        ),

                        region.site.bearing,

                        region.site.elevation,

                        region.climate.temperature,

                        region.climate.moisture,

                        region.climate.stormActivity,

                        region.geology.volcanism,

                        region.geology.resourceRichness,

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

            for (
                let cellId = 0;
                cellId < planet.mesh.cells.length;
                cellId++
            ) {

                const cell =
                    planet.mesh.cells[
                        cellId
                    ];

                const offset =
                    cellId * 6;

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
                    (
                        $1,$2,$3,
                        $4,$5,
                        $6,$7,$8,
                        $9,$10,$11
                    )
                    `,
                    [
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
                    ]
                );

                if (
                    cellId > 0 &&
                    cellId % 10000 === 0
                ) {

                    Logger.debug(
                        `Saved ${cellId.toLocaleString()} cells...`
                    );
                }
            }

            Logger.debug(
                "Cells saved."
            );

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
        _planetId: string
    ): Promise<
        Planet | null
    > {

        throw new Error(
            "Planet loading not yet implemented."
        );
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