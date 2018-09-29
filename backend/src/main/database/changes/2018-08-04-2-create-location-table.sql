CREATE TABLE IF NOT EXISTS carpal.location (
  id INT(11),
  location GEOMETRY NOT NULL,
  suburb TEXT,
  placeName TEXT,
  postCode VARCHAR(10)
);