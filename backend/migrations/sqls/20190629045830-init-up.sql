CREATE SCHEMA IF NOT EXISTS carpal;

CREATE TABLE IF NOT EXISTS carpal.rides (
  id INT(11) AUTO_INCREMENT PRIMARY KEY,
  client VARCHAR(255),
  facilitatorEmail VARCHAR(255),
  pickupTimeAndDateInUTC DATETIME,
  locationFrom POINT,
  locationTo POINT,
  fbLink VARCHAR(255),
  driverGender VARCHAR(10),
  carType VARCHAR(255),
  status ENUM('OPEN','CONFIRMED','ENDED','CANCELLED') DEFAULT 'OPEN',
  deleted TINYINT(4),
  suburbFrom VARCHAR(255),
  placeNameFrom VARCHAR(255),
  postCodeFrom VARCHAR(10),
  suburbTo VARCHAR(255),
  placeNameTo VARCHAR(255),
  postCodeTo VARCHAR(10),
  description VARCHAR(1024),
  hasMps BOOLEAN
);

CREATE TABLE IF NOT EXISTS carpal.clients (
  id INT(11) AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phoneNumber VARCHAR(255),
  description TEXT,
  locationHome POINT,
  placeNameHome VARCHAR(255),
  driverGender VARCHAR(10),
  carType VARCHAR(255),
  hasMps BOOLEAN
);

CREATE TABLE driver_ride
(
    driver_email VARCHAR(255) NOT NULL,
    ride_id INT NOT NULL,
    confirmed TINYINT NULL,
    updated_at DATETIME NULL,
    CONSTRAINT driver_ride_pk
        PRIMARY KEY (driver_email, ride_id),
    CONSTRAINT driver_ride_rides_id_fk
        FOREIGN KEY (ride_id) REFERENCES rides (id)
);

