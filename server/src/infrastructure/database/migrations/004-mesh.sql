create table planet_mesh
(
    planet_id text primary key,

    vertices bytea not null,

    indices bytea not null,

    neighbors bytea not null,

    foreign key
    (
        planet_id
    )
    references planet(id)
);