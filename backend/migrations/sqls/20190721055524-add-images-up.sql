CREATE TABLE `images` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mime_type` varchar(200) NOT NULL,
  `content` longtext NOT NULL,
  `caption` text,
  PRIMARY KEY (`id`)
);

CREATE TABLE `client_images` (
  `images_id` int(11) DEFAULT NULL,
  `clients_id` int(11) DEFAULT NULL,
  UNIQUE KEY `idx_client_images_images_id_clients_id` (`images_id`,`clients_id`),
  KEY `client_images_client_idx` (`clients_id`),
  KEY `client_images_image_idx` (`images_id`),
  CONSTRAINT `client_images_client` FOREIGN KEY (`clients_id`) REFERENCES `clients` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `client_images_image` FOREIGN KEY (`images_id`) REFERENCES `images` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) 