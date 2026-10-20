import { SeedTree } from "./SeedTree.js";
import { ClimateBand } from "./ClimateBand.js";
import { TectonicPlate } from "./TectonicPlate.js";
import { Region } from "./Region.js";
import { Island } from "./Island.js";

export interface Planet {

    id: string;

    name: string;

    radiusKm: number;

    oceanCoveragePercent: number;

    generationVersion: number;

    createdAt: Date;

    seeds: SeedTree;

    climateBands?: ClimateBand[];

    tectonicPlates?: TectonicPlate[];

    regions?: Region[];

    islands?: Island[];
}