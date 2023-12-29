
-- These table already exist in prod so create them exactly the way they are everywhere else
CREATE TABLE IF NOT EXISTS `driver` (
  `id` int NOT NULL,
  `givenName` text,
  `familyName` text,
  `email` text,
  `mobile` int DEFAULT NULL,
  `driverGender` text,
  `hasSuv` text,
  `driverName` text,
  `driverRego` text,
  `mpsPermit` text,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `facilitator` (
  `id` int NOT NULL,
  `givenName` text,
  `familyName` text,
  `email` text,
  `mobile` text,
  `roles` text,
  PRIMARY KEY (`id`)
);

-- alter the existing columns
ALTER TABLE `carpal`.`driver` 
CHANGE COLUMN `id` `id` INT NOT NULL AUTO_INCREMENT;

ALTER TABLE `carpal`.`driver` 
CHANGE COLUMN `mobile` `mobile` TEXT DEFAULT NULL;

ALTER TABLE `carpal`.`driver` 
ADD COLUMN `auth0Id` VARCHAR(255) NULL DEFAULT NULL AFTER `mpsPermit`,
ADD UNIQUE INDEX `auth0Id_UNIQUE` (`auth0Id` ASC) VISIBLE;

ALTER TABLE `carpal`.`driver_ride` 
CHANGE COLUMN `driver_id` `driver_auth0_id` VARCHAR(255) NOT NULL ;

UPDATE driver LEFT JOIN driver_ride ON driver.driverName = driver_ride.driver_name
    SET driver.auth0Id = driver_ride.driver_auth0_id;
    
INSERT IGNORE INTO driver (auth0Id, driverName)
SELECT DISTINCT driver_auth0_id, driver_name
FROM driver_ride;

ALTER TABLE `carpal`.`driver_ride` 
ADD CONSTRAINT `driver_driver_ride`
  FOREIGN KEY (`driver_auth0_id`)
  REFERENCES `carpal`.`driver` (`auth0Id`)
  ON DELETE RESTRICT
  ON UPDATE RESTRICT;

ALTER TABLE `carpal`.`facilitator`
CHANGE COLUMN `id` `id` INT NOT NULL AUTO_INCREMENT;

ALTER TABLE `carpal`.`facilitator` 
ADD COLUMN `auth0Id` VARCHAR(255) DEFAULT NULL;

ALTER TABLE `carpal`.`rides` 
ADD COLUMN `facilitatorId` INT DEFAULT NULL;

ALTER TABLE `carpal`.`rides` 
ADD CONSTRAINT `rides_facilitator`
  FOREIGN KEY (`facilitatorId`)
  REFERENCES `carpal`.`facilitator` (`id`)
  ON DELETE RESTRICT
  ON UPDATE RESTRICT;

UPDATE rides INNER JOIN facilitator ON facilitator.email = rides.facilitatorEmail
SET rides.facilitatorId = facilitator.id;
