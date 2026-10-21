import {
    SeedTree
}
from "@archipeligo/shared";

export interface ISeedService {

    generateMasterSeed(): bigint;

    deriveSeed(
        parentSeed: bigint,
        domain: string
    ): bigint;

    deriveEntitySeed(
        parentSeed: bigint,
        entityId: string
    ): bigint;

    createSeedTree(
        masterSeed: bigint
    ): SeedTree;
}