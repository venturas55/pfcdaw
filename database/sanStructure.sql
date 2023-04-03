drop table  IF EXISTS balizamiento;
CREATE TABLE `balizamiento` (
  `nif` varchar(8) NOT NULL,
  `num_internacional` varchar(12) DEFAULT NULL,
  `tipo` varchar(250) DEFAULT NULL,
  `telecontrol` varchar(200) DEFAULT NULL,
  `apariencia` varchar(50) DEFAULT NULL,
  `periodo` decimal(5, 2) DEFAULT 0,
  `caracteristica` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3  COMMENT = 'tabla de balizas';

drop table  IF EXISTS documentos;
CREATE TABLE `documentos` (
  `id_archivo` varchar(100) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `descripcion` varchar(250) DEFAULT NULL,
  `created_at` date NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT = 'tabla de documentos';

drop table  IF EXISTS eliminados;
CREATE TABLE `eliminados` (
  `fecha` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `usuario` varchar(10) NOT NULL,
  `item` varchar(50) NOT NULL,
  `cantidad` int(11) DEFAULT NULL,
  `fila` int(11) DEFAULT NULL,
  `columna` int(11) DEFAULT NULL,
  `descripcion` varchar(250) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT = 'Tabla de elementos de inventario eliminados';

drop table  IF EXISTS inventario;
CREATE TABLE `inventario` (
  `id` mediumint(9) NOT NULL,
  `tipo` varchar(50) DEFAULT NULL,
  `item` varchar(50) NOT NULL,
  `cantidad` int(11) DEFAULT NULL,
  `fila` int(11) DEFAULT NULL,
  `columna` int(11) DEFAULT NULL,
  `descripcion` varchar(250) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT = 'tabla de inventario';

drop table  IF EXISTS lampara;
CREATE TABLE `lampara` (
  `nif` varchar(8) NOT NULL,
  `altura` int(11) DEFAULT 0,
  `elevacion` int(11) DEFAULT 0,
  `alcanceNom` float(10, 2) DEFAULT 0,
  `linterna` varchar(200) DEFAULT NULL,
  `candelasCalc` float(12, 2) DEFAULT 0,
  `alcanceLum` float(10, 2) DEFAULT 0,
  `candelasInst` float(12, 2) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT = 'tabla de detalles lampara';

drop table  IF EXISTS localizacion;
CREATE TABLE `localizacion` (
  `nif` varchar(8) NOT NULL,
  `puerto` varchar(50) DEFAULT NULL,
  `num_local` decimal(5, 0)  DEFAULT 0,
  `localizacion` varchar(70) DEFAULT NULL,
  `latitud` varchar(15)  DEFAULT NULL,
  `longitud` varchar(15)  DEFAULT NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT = 'tabla de localizacion del balizamiento';


drop table  IF EXISTS boyas;
CREATE TABLE `boyas` (
  `nif` varchar(8) NOT NULL,
  `modelo` varchar(30) DEFAULT NULL,
  `material` varchar(30) DEFAULT NULL, 
  `diametro_flotador` float(4, 2)  DEFAULT 0,
  `altura_castillete` float(4, 2)  DEFAULT 0,
  `area` float(4, 2)  DEFAULT 0,
  `peso` float(10, 2)  DEFAULT 0,
  `diametro_cadena` float(10, 2)  DEFAULT 0,
  `longitud_cadena` float(10, 2)  DEFAULT 0
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT = 'tabla de boyas';

drop table  IF EXISTS logs;
CREATE TABLE `logs` (
  `fecha` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `usuario` varchar(50) NOT NULL,
  `accion` varchar(100) DEFAULT NULL,
  `observacion` varchar(150) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT = 'tabla de logs';

drop table  IF EXISTS mantenimiento ;
CREATE TABLE `mantenimiento` (
  `id_mantenimiento` int(10) UNSIGNED NOT NULL,
  `nif` varchar(8) NOT NULL,
  `fecha` date NOT NULL,
  `mantenimiento` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT = 'tabla de mantenimiento del balizamiento';

drop table  IF EXISTS observaciones ;
CREATE TABLE `observaciones` (
  `id_observacion` int(10) UNSIGNED NOT NULL,
  `nif` varchar(8) NOT NULL,
  `observaciones` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT = 'tabla de observaciones del balizamiento';

drop table  IF EXISTS usuarios ;
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `usuario` varchar(50) NOT NULL,
  `contrasena` varchar(250) NOT NULL,
  `email` varchar(200) DEFAULT NULL,
  `full_name` varchar(150) DEFAULT NULL,
  `privilegio` varchar(20) DEFAULT NULL,
  `pictureURL` varchar(100) CHARACTER SET utf16 COLLATE utf16_spanish2_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT = 'tabla de usuarios';

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
