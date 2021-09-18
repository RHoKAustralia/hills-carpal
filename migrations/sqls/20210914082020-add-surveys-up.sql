CREATE TABLE `carpal`.`ride_surveys` (
  `ride_id` INT(11) NOT NULL,
  `lateness` VARCHAR(45) NOT NULL,
  `satisfaction` VARCHAR(45) NOT NULL,
  `communications_issues` LONGTEXT NULL,
  `mobility_permit` TINYINT NOT NULL,
  `reimbursement_amount` DECIMAL(10,2) NOT NULL,
  `anything_else` LONGTEXT NULL,
  PRIMARY KEY (`ride_id`),
  CONSTRAINT `ride_surveys_rides`
    FOREIGN KEY (`ride_id`)
    REFERENCES `carpal`.`rides` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);
