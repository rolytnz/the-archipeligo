create table planet
(
    id text primary key,

    seed numeric(20,0) not null,

    radius_km integer not null,

    subdivisions integer not null,

    region_count integer not null,

    created_at timestamptz not null
        default now()
);