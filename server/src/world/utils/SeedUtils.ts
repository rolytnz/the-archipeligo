import * as crypto from "crypto";

export class SeedUtils {

    static deriveSeed(
        parentSeed: bigint,
        domain: string
    ): bigint {

        const hash = crypto
            .createHash("sha256")
            .update(`${parentSeed}:${domain}`)
            .digest("hex");

        return BigInt(
            "0x" + hash.substring(0, 16)
        );
    }
}