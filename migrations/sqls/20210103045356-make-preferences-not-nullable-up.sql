UPDATE rides SET driverGender = 'any' WHERE driverGender IS NULL;
UPDATE rides SET carType = 'All' WHERE carType IS NULL;

ALTER TABLE `carpal`.`rides` 
    CHANGE COLUMN `driverGender` `driverGender` VARCHAR(10) NOT NULL ,
    CHANGE COLUMN `carType` `carType` VARCHAR(255) NOT NULL ;

UPDATE clients SET driverGender = 'any' WHERE driverGender IS NULL;
UPDATE clients SET carType = 'All' WHERE carType IS NULL;

ALTER TABLE `carpal`.`clients` 
    CHANGE COLUMN `driverGender` `driverGender` VARCHAR(10) NOT NULL ,
    CHANGE COLUMN `carType` `carType` VARCHAR(255) NOT NULL ;
