CREATE TABLE IF NOT EXISTS carpal.driver_ride (
  id INT(11) PRIMARY KEY,
  driver_id INT(11),
  ride_id INT(11),
  confirmed TINYINT(1),
  notified24h TINYINT(1),
  notified5m TINYINT(1),
  FOREIGN KEY (driver_id) REFERENCES driver(id),
  FOREIGN KEY (ride_id) REFERENCES rides(id)
);