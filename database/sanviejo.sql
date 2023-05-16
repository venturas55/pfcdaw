
DROP TABLE IF EXISTS `balizamiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `balizamiento` (
  `nif` varchar(8) NOT NULL,
  `num_internacional` varchar(12) DEFAULT NULL,
  `tipo` varchar(250) DEFAULT NULL,
  `telecontrol` varchar(200) DEFAULT NULL,
  `apariencia` varchar(50) DEFAULT NULL,
  `periodo` decimal(5,2) DEFAULT NULL,
  `caracteristica` varchar(50) NOT NULL,
  PRIMARY KEY (`nif`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='tabla de balizas';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `balizamiento`
--

--
-- Table structure for table `eliminados`
--

DROP TABLE IF EXISTS `eliminados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `eliminados` (
  `fecha` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `usuario` varchar(10) NOT NULL,
  `item` varchar(50) NOT NULL,
  `cantidad` int(11) DEFAULT NULL,
  `fila` int(11) DEFAULT NULL,
  `columna` int(11) DEFAULT NULL,
  `descripcion` varchar(250) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Tabla de elementos de inventario eliminados';
/*!40101 SET character_set_client = @saved_cs_client */;



--
-- Table structure for table `inventario`
--

DROP TABLE IF EXISTS `inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inventario` (
  `id` mediumint(9) NOT NULL AUTO_INCREMENT,
  `item` varchar(50) NOT NULL,
  `cantidad` int(11) DEFAULT NULL,
  `fila` int(11) DEFAULT NULL,
  `columna` int(11) DEFAULT NULL,
  `descripcion` varchar(250) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=79 DEFAULT CHARSET=latin1 COMMENT='tabla de inventario';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventario`
--


DROP TABLE IF EXISTS `lampara`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lampara` (
  `nif` varchar(8) NOT NULL,
  `altura` int(11) DEFAULT NULL,
  `elevacion` int(11) DEFAULT NULL,
  `alcanceNom` float(10,2) DEFAULT NULL,
  `linterna` varchar(200) DEFAULT NULL,
  `candelasCalc` float(12,2) DEFAULT NULL,
  `alcanceLum` float(10,2) DEFAULT NULL,
  `candelasInst` float(12,2) DEFAULT NULL,
  PRIMARY KEY (`nif`),
  CONSTRAINT `lampara_FK` FOREIGN KEY (`nif`) REFERENCES `balizamiento` (`nif`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='tabla de detalles lampara';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lampara`
--

LOCK TABLES `lampara` WRITE;
/*!40000 ALTER TABLE `lampara` DISABLE KEYS */;


DROP TABLE IF EXISTS `localizacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `localizacion` (
  `nif` varchar(8) NOT NULL,
  `puerto` varchar(50) DEFAULT NULL,
  `num_local` decimal(5,0) DEFAULT NULL,
  `localizacion` varchar(70) DEFAULT NULL,
  `latitud` varchar(15) DEFAULT NULL,
  `longitud` varchar(15) DEFAULT NULL,
  PRIMARY KEY (`nif`),
  CONSTRAINT `localizacion_FK` FOREIGN KEY (`nif`) REFERENCES `balizamiento` (`nif`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='tabla de localizacion del balizamiento';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `localizacion`
--


DROP TABLE IF EXISTS `logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `logs` (
  `fecha` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `usuario` varchar(10) NOT NULL,
  `accion` varchar(20) DEFAULT NULL,
  `observacion` varchar(150) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='tabla de logs';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `logs`
--

--
-- Table structure for table `mantenimiento`
--

DROP TABLE IF EXISTS `mantenimiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mantenimiento` (
  `nif` varchar(8) NOT NULL,
  `fecha` date NOT NULL,
  `mantenimiento` varchar(250) NOT NULL,
  PRIMARY KEY (`nif`,`fecha`,`mantenimiento`),
  CONSTRAINT `mantenimiento_FK` FOREIGN KEY (`nif`) REFERENCES `balizamiento` (`nif`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='tabla de mantenimiento del balizamiento';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mantenimiento`
--
DROP TABLE IF EXISTS `observaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `observaciones` (
  `nif` varchar(8) NOT NULL,
  `observaciones` varchar(250) NOT NULL,
  PRIMARY KEY (`nif`,`observaciones`),
  CONSTRAINT `observaciones_FK` FOREIGN KEY (`nif`) REFERENCES `balizamiento` (`nif`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='tabla de observaciones del balizamiento';


