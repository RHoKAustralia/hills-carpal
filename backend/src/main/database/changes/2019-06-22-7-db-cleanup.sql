SET foreign_key_checks = 0;

DROP table driver;
DROP table driver_car;
DROP table driver_ride;
DROP table location;


create table driver_ride
(
    driver_email varchar(255) not null,
    ride_id int not null,
    confirmed tinyint null,
    updated_at DATETIME null,
    constraint driver_ride_pk
        primary key (driver_email, ride_id),
    constraint driver_ride_rides_id_fk
        foreign key (ride_id) references rides (id)
);

