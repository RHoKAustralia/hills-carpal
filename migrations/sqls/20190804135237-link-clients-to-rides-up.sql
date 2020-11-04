ALTER TABLE `carpal`.`rides` 
DROP COLUMN `client`,
ADD COLUMN `clientId` INT(11) NOT NULL DEFAULT 1 AFTER `hasMps`,
ADD INDEX `rides_clients_idx` (`clientId` ASC);
ALTER TABLE `carpal`.`rides` 
ADD CONSTRAINT `rides_clients`
  FOREIGN KEY (`clientId`)
  REFERENCES `carpal`.`clients` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;
