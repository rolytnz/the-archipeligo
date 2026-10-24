import { Pool }
from "pg";

const pool =
    new Pool({

        host:
            "localhost",

        port:
            5432,

        database:
            "archipeligo",

        user:
            "postgres",

        password:
            "ER1Jse2pKM%Is9y!"
    });

const result =
    await pool.query(
        "select now()"
    );

console.log(
    result.rows[0]
);

await pool.end();