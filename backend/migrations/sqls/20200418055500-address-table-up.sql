CREATE TABLE `carpal`.`locations` (
  `id` INT(11) AUTO_INCREMENT,
  `point` GEOMETRY NOT NULL,
  `name` VARCHAR(255) NULL,
  `suburb` VARCHAR(255) NULL,
  `postCode` VARCHAR(10) NULL,
  `clientId` INT NULL,
  PRIMARY KEY (`id`));

INSERT INTO carpal.locations (point,  name,  clientId)
  SELECT locationHome, placeNameHome, id
  FROM carpal.clients;

ALTER TABLE `carpal`.`clients` 
  DROP COLUMN `placeNameHome`,
  DROP COLUMN `locationHome`,
  ADD COLUMN `homeLocation` INT(11)  AFTER `hasMps`,
  ADD INDEX `fk_clients_location_idx` (`homeLocation` ASC);

ALTER TABLE `carpal`.`clients` 
  ADD CONSTRAINT `client_location`
    FOREIGN KEY (`homeLocation`)
    REFERENCES `carpal`.`locations` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION;

UPDATE carpal.locations AS locations INNER JOIN carpal.clients AS clients ON locations.clientId = clients.id
  SET clients.homeLocation = locations.id;

ALTER TABLE carpal.locations DROP clientId;

ALTER TABLE `carpal`.`locations` 
  ADD COLUMN `rideFromId` INT(11) NULL AFTER `postCode`,
  ADD COLUMN `rideToId` INT(11) NULL AFTER `rideFromId`;

INSERT INTO carpal.locations (point,  name,  suburb, postCode, rideFromId)
  SELECT locationFrom, placeNameFrom, suburbFrom, postCodeFrom, id
  FROM carpal.rides;

INSERT INTO carpal.locations (point,  name,  suburb, postCode, rideToId)
  SELECT locationTo, placeNameTo, suburbTo, postCodeTo, id
  FROM carpal.rides;

UPDATE carpal.rides SET locationFrom = NULL, locationTo = NULL;

ALTER TABLE `carpal`.`rides` 
  DROP COLUMN `postCodeTo`,
  DROP COLUMN `placeNameTo`,
  DROP COLUMN `suburbTo`,
  DROP COLUMN `postCodeFrom`,
  DROP COLUMN `placeNameFrom`,
  DROP COLUMN `suburbFrom`,
  CHANGE COLUMN `locationFrom` `locationFrom` INT(11) NULL AFTER `clientId`,
  CHANGE COLUMN `locationTo` `locationTo` INT(11) NULL AFTER `locationFrom`,
  ADD INDEX `locationFrom_location_idx` (`locationFrom` ASC),
  ADD INDEX `locationTo_location_idx` (`locationTo` ASC);
ALTER TABLE `carpal`.`rides` 
  ADD CONSTRAINT `locationFrom_location`
    FOREIGN KEY (`locationFrom`)
    REFERENCES `carpal`.`locations` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  ADD CONSTRAINT `locationTo_location`
    FOREIGN KEY (`locationTo`)
    REFERENCES `carpal`.`locations` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION;

UPDATE carpal.locations AS locations 
  INNER JOIN carpal.rides AS rides ON locations.rideFromId = rides.id
  SET rides.locationFrom = locations.id;

UPDATE carpal.locations AS locations 
  INNER JOIN carpal.rides AS rides ON locations.rideToId = rides.id
  SET rides.locationTo = locations.id;

ALTER TABLE `carpal`.`locations` 
  DROP COLUMN `rideToId`,
  DROP COLUMN `rideFromId`;
