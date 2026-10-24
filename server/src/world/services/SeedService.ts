import * as crypto
from "crypto";

import {
    ISeedService
}
from "./ISeedService.js";

export class SeedService
implements ISeedService {

    public generateMasterSeed():
        bigint {

        const bytes =
            crypto.randomBytes(8);

        return BigInt(
            "0x" +
            bytes.toString(
                "hex"
            )
        );
    }

    public deriveSeed(
        parentSeed: bigint,
        domain: string
    ): bigint {

        const hash =
            crypto
                .createHash(
                    "sha256"
                )
                .update(
                    `${parentSeed}:${domain}`
                )
                .digest(
                    "hex"
                );

        return BigInt(
            "0x" +
            hash.substring(
                0,
                16
            )
        );
    }

    public deriveEntitySeed(
        parentSeed: bigint,
        entityId: string
    ): bigint {

        return this.deriveSeed(
            parentSeed,
            entityId
        );
    }

    public planetSeed(
        masterSeed: bigint
    ): bigint {

        return this.deriveSeed(
            masterSeed,
            "planet"
        );
    }

    public regionSeed(
        planetSeed: bigint,
        regionId: number
    ): bigint {

        return this.deriveSeed(
            planetSeed,
            `region:${regionId}`
        );
    }

    public cellSeed(
        planetSeed: bigint,
        cellId: number
    ): bigint {

        return this.deriveSeed(
            planetSeed,
            `cell:${cellId}`
        );
    }
}