/* Replace with your SQL commands */
ALTER TABLE `carpal`.`driver_ride` 
ADD COLUMN `driver_name` VARCHAR(255) NULL AFTER `updated_at`;
