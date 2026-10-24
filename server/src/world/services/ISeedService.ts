export interface ISeedService {

    generateMasterSeed():
        bigint;

    deriveSeed(
        parentSeed: bigint,
        domain: string
    ): bigint;

    deriveEntitySeed(
        parentSeed: bigint,
        entityId: string
    ): bigint;

    planetSeed(
        masterSeed: bigint
    ): bigint;

    regionSeed(
        planetSeed: bigint,
        regionId: number
    ): bigint;

    cellSeed(
        planetSeed: bigint,
        cellId: number
    ): bigint;
}