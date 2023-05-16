DROP TABLE IF EXISTS `cochecito`;

DROP TABLE IF EXISTS `usuarios`;

CREATE TABLE `usuarios` (
  `id` int(11) PRIMARY KEY NOT NULL,
  `usuario` varchar(50) NOT NULL,
  `contrasena` varchar(250) NOT NULL,
  `email` varchar(200) DEFAULT NULL,
  `full_name` varchar(200) DEFAULT NULL,
  `privilegio` varchar(20) DEFAULT NULL,
  `pictureURL` varchar(200) CHARACTER SET utf16 COLLATE utf16_spanish2_ci DEFAULT NULL
) ENGINE = InnoDB DEFAULT CHARSET = latin1 COMMENT = 'tabla de usuarios';

ALTER TABLE `usuarios` ADD PRIMARY KEY (`id`);

ALTER TABLE  `usuarios` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

-- INSERT INTO `usuarios`(usuario,contrasena,email,full_name,privilegio,pictureURL) VALUES ('adrian','adrian','adeharo@valenciaport.com','Adrian de Haro','admin','');
INSERT INTO `usuarios` (    `id`,    `usuario`,    `contrasena`,    `email`,    `full_name`,    `privilegio`,    `pictureURL`  ) VALUES  (    1,    'adrian',    '$2a$10$rTcE3JD7svuTpPT42FrNdOodYNqfk9H7qd8.Dj3.vZMfZC9/rs.wS',    'adeharo@valenciaport.com',    'Adrian de Haro',    'admin',    ''  );
INSERT INTO `usuarios` (    `id`,    `usuario`,    `contrasena`,    `email`,    `full_name`,    `privilegio`,    `pictureURL`  )VALUES  (    2,    'guillermo',    '$2a$10$awusc6lEIcgLG2xif39iNeogoxpHuRjSzPaD0lZcgUdTzUmPPkBX2',    'gcasamayor@valenciaport.com',    'Guillermo Casamayor',    'san',    NULL  );
INSERT INTO `usuarios` (    `id`,    `usuario`,    `contrasena`,    `email`,    `full_name`,    `privilegio`,    `pictureURL`)VALUES  (    3,    'marcos',    '$2a$10$jBWhSIjUyrKpyrMuzs/l5e5YOxRiKVeZn9IAMTrWY1Seoq/OpfCae',    'msaez@valenciaport.com',    'Marco Antonio Saez',    'san',    NULL  );
INSERT INTO `usuarios` (    `id`,    `usuario`,    `contrasena`,    `email`,    `full_name`,    `privilegio`,    `pictureURL`  )VALUES  (    4,    'raul',    '$2a$10$enneFc/QxJXOxgkA1CTyNujO.52eJ54b.mTNCEQ4QudYwJgtvDN1C',    'rrubio@valenciaport.com',    'Raul Rubio',    'san',    NULL  );
DROP TABLE IF EXISTS `cochecito`;

---------------------------
-- SHOW CREATE TABLE observaciones (para ver los nombres de las restricciones)
CREATE TABLE backupObservaciones LIKE observaciones;

INSERT backupObservaciones SELECT * FROM  observaciones;

TRUNCATE TABLE observaciones;

ALTER TABLE  observaciones DROP FOREIGN KEY observaciones_FK;

ALTER TABLE  observaciones DROP PRIMARY KEY;

ALTER TABLE  observaciones ADD  id_observacion INT PRIMARY KEY AUTO_INCREMENT FIRST;

INSERT observaciones (nif, observaciones) SELECT nif, observaciones FROM backupObservaciones;

--DROP TABLE backupObservaciones;
-- SHOW CREATE TABLE mantenimiento (para ver los nombres de las restricciones)
CREATE TABLE backupMantenimiento LIKE mantenimiento;

INSERT backupMantenimiento SELECT * FROM mantenimiento;

TRUNCATE TABLE mantenimiento;

ALTER TABLE mantenimiento DROP FOREIGN KEY mantenimiento_FK;

ALTER TABLE mantenimiento DROP PRIMARY KEY;

ALTER TABLE  mantenimiento ADD id_mantenimiento INT PRIMARY KEY AUTO_INCREMENT FIRST;

INSERT  mantenimiento (nif, fecha, mantenimiento) SELECT  nif,  fecha,  mantenimiento FROM backupMantenimiento;

--DROP TABLE backupMantenimiento;
ALTER TABLE  inventario ADD  tipo varchar(50) DEFAULT NULL AFTER id;

ALTER TABLE eliminados ADD tipo varchar(50) DEFAULT NULL AFTER id;

CREATE TABLE `documentos` (
  `id_archivo` varchar(100) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `descripcion` varchar(250) DEFAULT NULL,
  `created_at` date NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_archivo`)
) ENGINE = InnoDB DEFAULT CHARSET = latin1 COMMENT = 'tabla de documentos';

-- MOVER FOTOS Y SRC A LA CARPETA CORRESPONDIENTE
ALTER TABLE lampara MODIFY COLUMN altura decimal(5, 2);
ALTER TABLE lampara MODIFY COLUMN elevacion decimal(5, 2);
ALTER TABLE lampara MODIFY COLUMN alcanceNom decimal(5, 2);
ALTER TABLE balizamiento MODIFY COLUMN periodo decimal(5, 2);
ALTER TABLE balizamiento MODIFY COLUMN caracteristica varchar(50) NULL;