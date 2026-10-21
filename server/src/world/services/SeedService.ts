import * as crypto from "crypto";

import { ISeedService } from "./ISeedService.js";

import {
    SeedTree
}
from "@archipeligo/shared";

export class SeedService implements ISeedService {

    public generateMasterSeed(): bigint {

        const bytes = crypto.randomBytes(8);

        return BigInt(
            "0x" + bytes.toString("hex")
        );
    }

    public deriveSeed(
        parentSeed: bigint,
        domain: string
    ): bigint {

        const hash = crypto
            .createHash("sha256")
            .update(
                `${parentSeed}:${domain}`
            )
            .digest("hex");

        return BigInt(
            "0x" + hash.substring(0, 16)
        );
    }

    public deriveEntitySeed(
        parentSeed: bigint,
        entityId: string
    ): bigint {

        const hash = crypto
            .createHash("sha256")
            .update(
                `${parentSeed}:${entityId}`
            )
            .digest("hex");

        return BigInt(
            "0x" + hash.substring(0, 16)
        );
    }

    public createSeedTree(
        masterSeed: bigint
    ): SeedTree {

        return {

            masterSeed,

            climateSeed:
                this.deriveSeed(
                    masterSeed,
                    "climate"
                ),

            tectonicSeed:
                this.deriveSeed(
                    masterSeed,
                    "tectonics"
                ),

            oceanSeed:
                this.deriveSeed(
                    masterSeed,
                    "ocean"
                ),

            weatherSeed:
                this.deriveSeed(
                    masterSeed,
                    "weather"
                ),

            regionSeed:
                this.deriveSeed(
                    masterSeed,
                    "regions"
                ),

            islandSeed:
                this.deriveSeed(
                    masterSeed,
                    "islands"
                ),

            resourceSeed:
                this.deriveSeed(
                    masterSeed,
                    "resources"
                ),

            ruinSeed:
                this.deriveSeed(
                    masterSeed,
                    "ruins"
                ),

            factionSeed:
                this.deriveSeed(
                    masterSeed,
                    "factions"
                ),

            wildlifeSeed:
                this.deriveSeed(
                    masterSeed,
                    "wildlife"
                ),

            driftSeed:
                this.deriveSeed(
                    masterSeed,
                    "drift"
                )
        };
    }
}