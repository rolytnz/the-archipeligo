create table region
(
    planet_id text not null,

    id text not null,

    name text not null,

    seed numeric(20,0) not null,

    bearing double precision not null,

    elevation double precision not null,

    temperature real not null,

    moisture real not null,

    storm_activity real not null,

    volcanism real not null,

    resource_richness real not null,

    island_density real not null,

    ancient_activity real not null,

    anomaly_activity real not null,

    primary key
    (
        planet_id,
        id
    ),

    foreign key
    (
        planet_id
    )
    references planet(id)
);