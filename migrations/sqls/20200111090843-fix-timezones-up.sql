ALTER TABLE `carpal`.`rides` 
CHANGE COLUMN `pickupTimeAndDateInUTC` `pickupTimeAndDateInUTC` TIMESTAMP(5) NULL DEFAULT NULL ;

ALTER TABLE `carpal`.`driver_ride` 
CHANGE COLUMN `updated_at` `updated_at` TIMESTAMP(5) NULL DEFAULT NULL ;
