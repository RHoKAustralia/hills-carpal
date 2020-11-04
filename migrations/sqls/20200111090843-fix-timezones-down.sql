ALTER TABLE `carpal`.`rides` 
CHANGE COLUMN `pickupTimeAndDateInUTC` `pickupTimeAndDateInUTC` DATETIME NULL DEFAULT NULL ;

ALTER TABLE `carpal`.`driver_ride` 
CHANGE COLUMN `updated_at` `updated_at` DATETIME NULL DEFAULT NULL ;
