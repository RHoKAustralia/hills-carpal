CREATE TABLE IF NOT EXISTS carpal.rides (
  id INT(11) AUTO_INCREMENT PRIMARY KEY,
  client VARCHAR(255),
  facilitatorEmail VARCHAR(255),
  pickupTimeAndDateInUTC DATETIME,
  locationFrom POINT,
  locationTo POINT,
  fbLink VARCHAR(255),
  driverGender VARCHAR(10),
  carType VARCHAR(255),
  status ENUM('OPEN','CONFIRMED','ENDED','CANCELLED') DEFAULT 'OPEN',
  deleted TINYINT(4),
  suburbFrom VARCHAR(255),
  placeNameFrom VARCHAR(255),
  postCodeFrom VARCHAR(10),
  suburbTo VARCHAR(255),
  placeNameTo VARCHAR(255),
  postCodeTo VARCHAR(10),
  description VARCHAR(1024)
);

