ALTER TABLE `carpal`.`ride_surveys` 
DROP COLUMN `mobility_permit`;

ALTER TABLE `carpal`.`ride_surveys` 
ADD COLUMN `mobility_permit` ENUM('pickup', 'dropoff', 'both', 'neither') NOT NULL DEFAULT 'neither' AFTER `anything_else`;
