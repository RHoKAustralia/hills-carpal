CREATE TABLE IF NOT EXISTS carpal.clients (
  id INT(11) AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phoneNumber VARCHAR(255),
  description TEXT,
  locationHome POINT,
  placeNameHome VARCHAR(255),
  driverGender VARCHAR(10),
  carType VARCHAR(255),
  profilePhoto LONGBLOB,
  pickupPrimary LONGBLOB,
  pickupSecondary LONGBLOB
);