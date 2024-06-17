drop database if exists sanpfcdaw;

create database sanpfcdaw;

use sanpfcdaw;

SET
  SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

START TRANSACTION;

SET
  time_zone = "+00:00";

/*INICIO informacion ATON*/
CREATE TABLE IF NOT EXISTS `balizamiento` (
  `nif` varchar(8) NOT NULL,
  `num_internacional` varchar(12) DEFAULT NULL,
  `tipo` varchar(250) DEFAULT NULL,
  `telecontrol` varchar(200) DEFAULT NULL,
  `apariencia` varchar(50) DEFAULT NULL,
  `periodo` decimal(5, 2) DEFAULT NULL,
  `caracteristica` varchar(50) DEFAULT NULL,
  `necesita_pintado` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`nif`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = 'tabla de balizas';

CREATE TABLE IF NOT EXISTS `lampara` (
  `nif` varchar(8) NOT NULL,
  `altura` decimal(5, 2) DEFAULT NULL,
  `elevacion` decimal(5, 2) DEFAULT NULL,
  `alcanceNom` decimal(5, 2) DEFAULT NULL,
  `linterna` varchar(200) DEFAULT NULL,
  `candelasCalc` float(12, 2) DEFAULT NULL,
  `alcanceLum` decimal(5, 2) DEFAULT NULL,
  `candelasInst` float(12, 2) DEFAULT NULL,
  PRIMARY KEY (`nif`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = 'tabla de detalles lampara';

CREATE TABLE IF NOT EXISTS `localizacion` (
  `nif` varchar(8) NOT NULL,
  `puerto` varchar(50) DEFAULT NULL,
  `num_local` decimal(5, 0) DEFAULT NULL,
  `localizacion` varchar(70) DEFAULT NULL,
  `latitud` varchar(15) DEFAULT NULL,
  `longitud` varchar(15) DEFAULT NULL,
  `coordenadas` point default NULL,
  PRIMARY KEY (`nif`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = 'tabla de localizacion del balizamiento';

CREATE TABLE IF NOT EXISTS `mantenimiento` (
  `id_mantenimiento` int(10) NOT NULL AUTO_INCREMENT,
  `nif` varchar(8) NOT NULL,
  `fecha` date NOT NULL,
  `mantenimiento` varchar(250) NOT NULL,
  PRIMARY KEY (`id_mantenimiento`),
  KEY `mantenimiento_FK` (`nif`)
) ENGINE = InnoDB AUTO_INCREMENT = 1 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = 'tabla de mantenimiento del balizamiento';

CREATE TABLE IF NOT EXISTS `observaciones` (
  `id_observacion` int(10) NOT NULL AUTO_INCREMENT,
  `nif` varchar(8) NOT NULL,
  `observaciones` varchar(250) NOT NULL,
  PRIMARY KEY (`id_observacion`),
  KEY `observaciones_FK` (`nif`)
) ENGINE = InnoDB AUTO_INCREMENT = 188 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = 'tabla de observaciones del balizamiento';

/*FIN ATON*/
/* INVENTARIO */
CREATE TABLE IF NOT EXISTS `inventario` (
  `id` mediumint(9) NOT NULL AUTO_INCREMENT,
  `tipo` varchar(50) DEFAULT NULL,
  `item` varchar(50) NOT NULL,
  `cantidad` int(11) DEFAULT NULL,
  `fila` int(11) DEFAULT NULL,
  `columna` int(11) DEFAULT NULL,
  `descripcion` varchar(250) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 79 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = 'tabla de inventario';

/* DESCRIPCION DOCUMENTOS */
CREATE TABLE `documentos` (
  `id_archivo` varchar(100) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `descripcion` varchar(250) DEFAULT NULL,
  `created_at` date NOT NULL DEFAULT current_timestamp()
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'tabla de documentos';

/* USUARIOS y LOGS */
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario` varchar(50) NOT NULL,
  `contrasena` varchar(250) NOT NULL,
  `email` varchar(200) DEFAULT NULL,
  `full_name` varchar(150) DEFAULT NULL,
  `privilegio` varchar(20) DEFAULT NULL,
  `pictureURL` varchar(100) CHARACTER SET utf16 COLLATE utf16_spanish2_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 7 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = 'tabla de usuarios';

CREATE TABLE IF NOT EXISTS `logs` (
  `fecha` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `usuario` varchar(50) NOT NULL,
  `accion` varchar(100) DEFAULT NULL,
  `observacion` varchar(150) DEFAULT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = 'tabla de logs';

drop table if exists tickets;

CREATE TABLE IF NOT EXISTS `tickets` (
  `ticket_id` int(11) NOT NULL AUTO_INCREMENT,
  `nif` varchar(8) DEFAULT NULL,
  `created_by_id` int(11) NOT NULL,
  `assigned_to_id` int(11) DEFAULT NULL,
  `resolved_by_id` int(11) DEFAULT NULL,
  `titulo` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `solved_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`ticket_id`),
  KEY `created_by_id` (`created_by_id`),
  KEY `assigned_to_id` (`assigned_to_id`),
  KEY `resolved_by_id` (`resolved_by_id`),
  KEY `nif` (`nif`),
  CONSTRAINT `tickets_ibfk_1` FOREIGN KEY (`created_by_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `tickets_ibfk_2` FOREIGN KEY (`assigned_to_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `tickets_ibfk_3` FOREIGN KEY (`resolved_by_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `tickets_ibfk_4` FOREIGN KEY (`nif`) REFERENCES `balizamiento` (`nif`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = 'tabla de tickets';

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
DROP TABLE IF EXISTS preventivos;
CREATE TABLE IF NOT EXISTS `preventivos` (
  `preventivo_id` int(11) PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `nif` varchar(8) DEFAULT NULL,
  `estructura_estado` BOOLEAN default null,
  `estructura_marca_tope` BOOLEAN default null,
  `estructura_engrase` BOOLEAN default null,
  `estructura_golpes` BOOLEAN default null,
  `estructura_flotador` BOOLEAN default null,
  `estructura_limpieza_interior` BOOLEAN default null,
  `estructura_limpieza_exterior` BOOLEAN default null,
  `estructura_cuadro_interior` BOOLEAN default null,
  `estructura_cuadro_exterior` BOOLEAN default null,
  `linterna_ldr1` BOOLEAN default null,
  `linterna_ldr2` BOOLEAN default null,
  `linterna_optica` BOOLEAN default null,
  `linterna_estanqueidad_tornillos` BOOLEAN default null,
  `linterna_estanqueidad_humedades` BOOLEAN default null,
  `telecontrol_monitoreo` BOOLEAN default null,
  `telecontrol_gps` BOOLEAN default null,
  `telecontrol_tipo` ENUM(
    'Radio-Moscad',
    'radioUHF',
    'AIS',
    'GSM',
    'Satelital'
  ) default null,
  `alimentacion_panelFV` BOOLEAN default null,
  `alimentacion_red` BOOLEAN default null,
  `alimentacion_baterias` BOOLEAN default null,
  `alimentacion_ah` int default 0,
  `alimentacion_vcc` float default 0,
  `alimentacion_grupo` BOOLEAN default null,
  `alimentacion_cableado` BOOLEAN default null,
  `estructura_observaciones` varchar(250) default null,
  `linterna_observaciones` varchar(250) default null,
  `telecontrol_observaciones` varchar(250) default null,
  `alimentacion_observaciones` varchar(250) default null,
  `observaciones_generales` varchar(250) default null,
  `created_at` timestamp DEFAULT current_timestamp(),
  `solved_at` timestamp DEFAULT NULL,
  `created_by_id` int(11) DEFAULT NULL,
  CONSTRAINT `preventivo_ibfk_1` FOREIGN KEY (`created_by_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `preventivo_ibfk_2` FOREIGN KEY (`nif`) REFERENCES `balizamiento` (`nif`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = 'tabla de preventivos';

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