SET foreign_key_checks = 0;

DROP table driver;
DROP table driver_car;
DROP table driver_ride;
DROP table location;


create table driver_ride
(
    email varchar(255) not null,
    ride_id int not null,
    confirmed tinyint default null null comment 'IF null driver didn''t accept nor decline the rid.',
    updated_at DATETIME not null
);

create unique index driver_ride_email_uindex
    on driver_ride (driver_email);

alter table driver_ride
    add constraint driver_ride_pk
        primary key (driver_email);

alter table driver_ride
    add constraint driver_ride_rides_id_fk
        foreign key (ride_id) references rides (id)
            on delete cascade;

