import { SeedTree } from "../types/SeedTree.js";

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