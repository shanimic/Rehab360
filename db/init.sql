CREATE DATABASE IF NOT EXISTS `rehab360`;
USE `rehab360`;

CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('PATIENT', 'THERAPIST') NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO `users` (`name`, `email`, `password`, `role`) 
VALUES 
    ('Shani', 'shani@test.com', '$argon2i$v=19$m=16,t=2,p=1$MTIzNDU2Nzg$tDWRo1Aq6aP70zhxJsPq7w', 'PATIENT'),
    ('Liron', 'liron@test.com', '$argon2i$v=19$m=16,t=2,p=1$MTIzNDU2Nzg$tDWRo1Aq6aP70zhxJsPq7w', 'PATIENT'),
    ('Elran', 'elran@test.com', '$argon2i$v=19$m=16,t=2,p=1$MTIzNDU2Nzg$tDWRo1Aq6aP70zhxJsPq7w', 'THERAPIST'),
    ('Yogev', 'yogev@test.com', '$argon2i$v=19$m=16,t=2,p=1$MTIzNDU2Nzg$tDWRo1Aq6aP70zhxJsPq7w', 'THERAPIST');