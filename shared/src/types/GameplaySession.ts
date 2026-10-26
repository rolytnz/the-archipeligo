import {
    WorldPosition
}
from "./WorldPosition.js";

export interface GameplaySession {

    planetId: string;

    regionId: string;

    playerPosition: WorldPosition;
}