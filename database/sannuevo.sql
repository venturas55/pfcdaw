drop database if exists sanpfcdaw;

create database sanpfcdaw;

use sanpfcdaw;

SET
  SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

START TRANSACTION;

SET
  time_zone = "+00:00";

/*INICIO informacion ATON*/
CREATE TABLE `balizamiento` (
  `nif` varchar(8) NOT NULL,
  `num_internacional` varchar(12) DEFAULT NULL,
  `tipo` varchar(250) DEFAULT NULL,
  `telecontrol` varchar(200) DEFAULT NULL,
  `apariencia` varchar(50) DEFAULT NULL,
  `periodo` decimal(5, 2) DEFAULT NULL,
  `caracteristica` varchar(50) NULL,
  `necesita_pintado` boolean default 0
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'tabla de balizas';

CREATE TABLE `lampara` (
  `nif` varchar(8) NOT NULL,
  `altura` decimal(5, 2) DEFAULT NULL,
  `elevacion` decimal(5, 2) DEFAULT NULL,
  `alcanceNom` decimal(5, 2) DEFAULT NULL,
  `linterna` varchar(200) DEFAULT NULL,
  `candelasCalc` float(12, 2) DEFAULT NULL,
  `alcanceLum` decimal(5, 2) DEFAULT NULL,
  `candelasInst` float(12, 2) DEFAULT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'tabla de detalles lampara';

CREATE TABLE `localizacion` (
  `nif` varchar(8) NOT NULL,
  `puerto` varchar(50) DEFAULT NULL,
  `num_local` decimal(5, 0) DEFAULT NULL,
  `localizacion` varchar(70) DEFAULT NULL,
  `latitud` varchar(15) DEFAULT NULL,
  `longitud` varchar(15) DEFAULT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'tabla de localizacion del balizamiento';

CREATE TABLE `mantenimiento` (
  `id_mantenimiento` int(10) UNSIGNED NOT NULL,
  `nif` varchar(8) NOT NULL,
  `fecha` date NOT NULL,
  `mantenimiento` varchar(250) NOT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'tabla de mantenimiento del balizamiento';

CREATE TABLE `observaciones` (
  `id_observacion` int(10) UNSIGNED NOT NULL,
  `nif` varchar(8) NOT NULL,
  `observaciones` varchar(250) NOT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'tabla de observaciones del balizamiento';

/*FIN ATON*/
/* INVENTARIO */
CREATE TABLE `inventario` (
  `id` mediumint(9) NOT NULL,
  `tipo` varchar(50) DEFAULT NULL,
  `item` varchar(50) NOT NULL,
  `cantidad` int(11) DEFAULT NULL,
  `fila` int(11) DEFAULT NULL,
  `columna` int(11) DEFAULT NULL,
  `descripcion` varchar(250) DEFAULT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'tabla de inventario';

/* DESCRIPCION DOCUMENTOS */
CREATE TABLE `documentos` (
  `id_archivo` varchar(100) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `descripcion` varchar(250) DEFAULT NULL,
  `created_at` date NOT NULL DEFAULT current_timestamp()
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'tabla de documentos';

/* USUARIOS y LOGS */
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `usuario` varchar(50) NOT NULL,
  `contrasena` varchar(250) NOT NULL,
  `email` varchar(200) DEFAULT NULL,
  `full_name` varchar(150) DEFAULT NULL,
  `privilegio` varchar(20) DEFAULT NULL,
  `pictureURL` varchar(100) CHARACTER SET utf16 COLLATE utf16_spanish2_ci DEFAULT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'tabla de usuarios';

CREATE TABLE `logs` (
  `fecha` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `usuario` varchar(50) NOT NULL,
  `accion` varchar(100) DEFAULT NULL,
  `observacion` varchar(150) DEFAULT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'tabla de logs';

drop table if exists tickets;
CREATE TABLE `tickets` (
  `ticket_id` int(11) AUTO_INCREMENT PRIMARY KEY,
  `nif` varchar(8),
  `created_by_id` int(11) NOT NULL,
  `assigned_to_id` int(11) DEFAULT NULL,
  `resolved_by_id` int(11) DEFAULT NULL,
  `titulo` VARCHAR(255) NOT NULL,
  `descripcion` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `solved_at` TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (created_by_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (resolved_by_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (nif) REFERENCES balizamiento(nif) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'tabla de tickets';

CREATE TABLE IF NOT EXISTS `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) unsigned NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`session_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE `tokens` (
  `user_id` int(11) NOT NULL,
  `hashedtoken` varchar(200) PRIMARY KEY,
  `expires` DATETIME NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
   FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'tabla de tokens';

--
ALTER TABLE
  `balizamiento`
ADD
  PRIMARY KEY (`nif`);

ALTER TABLE
  `inventario`
ADD
  PRIMARY KEY (`id`);

ALTER TABLE
  `lampara`
ADD
  PRIMARY KEY (`nif`);

ALTER TABLE
  `localizacion`
ADD
  PRIMARY KEY (`nif`);

ALTER TABLE
  `mantenimiento`
ADD
  PRIMARY KEY (`id_mantenimiento`),
ADD
  KEY `mantenimiento_FK` (`nif`),
MODIFY
  `id_mantenimiento` int(10) NOT NULL AUTO_INCREMENT,
  AUTO_INCREMENT = 1;

ALTER TABLE
  `observaciones`
ADD
  PRIMARY KEY (`id_observacion`),
ADD
  KEY `observaciones_FK` (`nif`),
MODIFY
  `id_observacion` int(10) NOT NULL AUTO_INCREMENT,
  AUTO_INCREMENT = 1;

ALTER TABLE
  `usuarios`
ADD
  PRIMARY KEY (`id`);

ALTER TABLE
  `usuarios`
MODIFY
  `id` int(11) NOT NULL AUTO_INCREMENT,
  AUTO_INCREMENT = 1;

ALTER TABLE
  `inventario`
MODIFY
  `id` mediumint(9) NOT NULL AUTO_INCREMENT,
  AUTO_INCREMENT = 1;

-- Inserta usuario "admin" con contraseña "admin"
INSERT INTO
  `usuarios` (
    `id`,
    `usuario`,
    `contrasena`,
    `email`,
    `full_name`,
    `privilegio`,
    `pictureURL`
  )
VALUES
  (
    1,
    'admin',
    '$2a$10$44RiEqgdwBZhtbd1rN6pfe/CLbTMpc4mGUPDiCgAlle0ISkMuJAC2',
    'admin@email.com',
    'Admin name',
    'admin',
    ''
  );

COMMIT;
