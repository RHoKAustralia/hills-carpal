CREATE TABLE IF NOT EXISTS carpal.driver_car (
  id INT(11) PRIMARY KEY,
  driver_id INT(11),
  carModel VARCHAR(255),
  color VARCHAR(255),
  licensePlateNumber VARCHAR(255),
  FOREIGN KEY (driver_id) REFERENCES driver(id)
);