create table cell
(
    planet_id text not null,

    cell_id integer not null,

    region_id text not null,

    bearing double precision not null,

    elevation double precision not null,

    neighbor_1 integer,
    neighbor_2 integer,
    neighbor_3 integer,
    neighbor_4 integer,
    neighbor_5 integer,
    neighbor_6 integer,

    primary key
    (
        planet_id,
        cell_id
    ),

    foreign key
    (
        planet_id
    )
    references planet(id)
);