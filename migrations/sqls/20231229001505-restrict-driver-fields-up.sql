/* Replace with your SQL commands */
ALTER TABLE `carpal`.`driver` 
CHANGE COLUMN `driverGender` `driverGender` ENUM('Male', 'Female', 'Other') NULL DEFAULT NULL ,
CHANGE COLUMN `hasSuv` `hasSuv` ENUM('Yes', 'No') NULL DEFAULT NULL ;
