ALTER TABLE `carpal`.`ride_surveys` 
ADD COLUMN `mobility_permit_used_pickup` TINYINT NOT NULL DEFAULT 0 AFTER `mobility_permit`,
ADD COLUMN `mobility_permit_used_dropoff` TINYINT NOT NULL DEFAULT 0 AFTER `mobility_permit_used_pickup`,
ADD COLUMN `mobility_permit_stop_address` MEDIUMTEXT NULL AFTER `mobility_permit_used_dropoff`;

UPDATE ride_surveys SET mobility_permit_used_pickup = 1 WHERE mobility_permit = 'pickup';
UPDATE ride_surveys SET mobility_permit_used_dropoff = 1 WHERE mobility_permit = 'dropoff';

ALTER TABLE `carpal`.`ride_surveys` DROP COLUMN `mobility_permit`;

