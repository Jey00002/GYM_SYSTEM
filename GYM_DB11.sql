-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: localhost    Database: gym_system
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `acceso`
--

DROP TABLE IF EXISTS `acceso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `acceso` (
  `id_acceso` bigint NOT NULL AUTO_INCREMENT,
  `fecha` date DEFAULT NULL,
  `hora_ingreso` time(6) DEFAULT NULL,
  `hora_salida` time(6) DEFAULT NULL,
  `resultado` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_metodo_acceso` bigint NOT NULL,
  `id_socio` bigint NOT NULL,
  PRIMARY KEY (`id_acceso`),
  KEY `FKbcgijdo2kdww3dyp9cl69gqum` (`id_metodo_acceso`),
  KEY `FKhqr02uk04ujx5rkcpqb59b0qr` (`id_socio`),
  CONSTRAINT `FKbcgijdo2kdww3dyp9cl69gqum` FOREIGN KEY (`id_metodo_acceso`) REFERENCES `metodo_acceso` (`id_metodo_acceso`),
  CONSTRAINT `FKhqr02uk04ujx5rkcpqb59b0qr` FOREIGN KEY (`id_socio`) REFERENCES `socio` (`id_socio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `acceso`
--

LOCK TABLES `acceso` WRITE;
/*!40000 ALTER TABLE `acceso` DISABLE KEYS */;
/*!40000 ALTER TABLE `acceso` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `administrador`
--

DROP TABLE IF EXISTS `administrador`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `administrador` (
  `id_administrador` bigint NOT NULL AUTO_INCREMENT,
  `apellidos` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cargo` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dni` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nombres` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_usuario` bigint NOT NULL,
  PRIMARY KEY (`id_administrador`),
  UNIQUE KEY `UKferp3xx2iyuy3qltd4ey5pf7l` (`id_usuario`),
  CONSTRAINT `FKpt2bj0l5q4npigarogy7p1834` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `administrador`
--

LOCK TABLES `administrador` WRITE;
/*!40000 ALTER TABLE `administrador` DISABLE KEYS */;
/*!40000 ALTER TABLE `administrador` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alerta_notificacion`
--

DROP TABLE IF EXISTS `alerta_notificacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alerta_notificacion` (
  `id_alerta` bigint NOT NULL AUTO_INCREMENT,
  `estado_envio` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_envio` datetime(6) DEFAULT NULL,
  `tipo_alerta` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_membresia` bigint NOT NULL,
  PRIMARY KEY (`id_alerta`),
  KEY `FK2ckcj9hcya2s8bnwg4xajk19x` (`id_membresia`),
  CONSTRAINT `FK2ckcj9hcya2s8bnwg4xajk19x` FOREIGN KEY (`id_membresia`) REFERENCES `membresia` (`id_membresia`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alerta_notificacion`
--

LOCK TABLES `alerta_notificacion` WRITE;
/*!40000 ALTER TABLE `alerta_notificacion` DISABLE KEYS */;
/*!40000 ALTER TABLE `alerta_notificacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comprobante`
--

DROP TABLE IF EXISTS `comprobante`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comprobante` (
  `id_comprobante` bigint NOT NULL AUTO_INCREMENT,
  `archivo_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_emision` date DEFAULT NULL,
  `numero_serie` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_pago` bigint NOT NULL,
  PRIMARY KEY (`id_comprobante`),
  UNIQUE KEY `UK1bg4vqkc3d75sgntebmqnvgx4` (`id_pago`),
  CONSTRAINT `FK6u8o36tk1d40kbkonc34l3115` FOREIGN KEY (`id_pago`) REFERENCES `pago` (`id_pago`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comprobante`
--

LOCK TABLES `comprobante` WRITE;
/*!40000 ALTER TABLE `comprobante` DISABLE KEYS */;
INSERT INTO `comprobante` VALUES (1,'/comprobantes/7.pdf','2026-09-05','CMP-1788638974573',7),(2,'/comprobantes/8.pdf','2026-09-05','CMP-1788638979153',8),(3,'/comprobantes/9.pdf','2026-09-05','CMP-1788638985834',9),(4,'/comprobantes/10.pdf','2026-09-05','CMP-1788639376647',10),(5,'/comprobantes/11.pdf','2026-09-05','CMP-1788639393164',11),(6,'/comprobantes/12.pdf','2026-09-05','CMP-1788640203056',12),(7,'/comprobantes/13.pdf','2026-09-05','CMP-1788640226013',13),(8,'/comprobantes/14.pdf','2026-09-05','CMP-1788641551423',14),(9,'/comprobantes/15.pdf','2026-09-05','CMP-1788641563929',15);
/*!40000 ALTER TABLE `comprobante` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ejercicio`
--

DROP TABLE IF EXISTS `ejercicio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ejercicio` (
  `id_ejercicio` bigint NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `grupo_muscular` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nombre_ejercicio` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_ejercicio`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ejercicio`
--

LOCK TABLES `ejercicio` WRITE;
/*!40000 ALTER TABLE `ejercicio` DISABLE KEYS */;
INSERT INTO `ejercicio` VALUES (1,'Flexion de rodillas con carga','Piernas','Sentadilla'),(2,'Empuje horizontal de pecho','Pecho','Press de Banca'),(3,'Levantamiento desde el suelo','Espalda','Peso Muerto'),(4,'Traccion en barra fija','Espalda','Dominadas'),(5,'Empuje vertical de hombros','Hombros','Press Militar');
/*!40000 ALTER TABLE `ejercicio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `entrenador`
--

DROP TABLE IF EXISTS `entrenador`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `entrenador` (
  `id_entrenador` bigint NOT NULL AUTO_INCREMENT,
  `apellidos` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dni` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `especialidad` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nombres` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_usuario` bigint NOT NULL,
  PRIMARY KEY (`id_entrenador`),
  UNIQUE KEY `UKjhy5r4xefcus906okonxq8o49` (`id_usuario`),
  CONSTRAINT `FKt1pxlqkf52251hl0655hs650m` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `entrenador`
--

LOCK TABLES `entrenador` WRITE;
/*!40000 ALTER TABLE `entrenador` DISABLE KEYS */;
INSERT INTO `entrenador` VALUES (1,'Torres','71234567','Hipertrofia y fuerza','Miguel',2);
/*!40000 ALTER TABLE `entrenador` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medicion_biometrica`
--

DROP TABLE IF EXISTS `medicion_biometrica`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medicion_biometrica` (
  `id_medicion` bigint NOT NULL AUTO_INCREMENT,
  `fecha_medicion` date DEFAULT NULL,
  `peso` decimal(5,2) DEFAULT NULL,
  `porcentaje_grasa` decimal(5,2) DEFAULT NULL,
  `talla` decimal(4,2) DEFAULT NULL,
  `id_socio` bigint NOT NULL,
  PRIMARY KEY (`id_medicion`),
  KEY `FK9oiufxepxuxxr56wvbcfaurfj` (`id_socio`),
  CONSTRAINT `FK9oiufxepxuxxr56wvbcfaurfj` FOREIGN KEY (`id_socio`) REFERENCES `socio` (`id_socio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicion_biometrica`
--

LOCK TABLES `medicion_biometrica` WRITE;
/*!40000 ALTER TABLE `medicion_biometrica` DISABLE KEYS */;
/*!40000 ALTER TABLE `medicion_biometrica` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `membresia`
--

DROP TABLE IF EXISTS `membresia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `membresia` (
  `id_membresia` bigint NOT NULL AUTO_INCREMENT,
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_vencimiento` date NOT NULL,
  `id_plan` bigint NOT NULL,
  `id_socio` bigint NOT NULL,
  PRIMARY KEY (`id_membresia`),
  KEY `FKocp9xxlgxcfqdhq57uq7qwhbv` (`id_plan`),
  KEY `FKbjt3irws1fgvn27vlyc93ds6x` (`id_socio`),
  CONSTRAINT `FKbjt3irws1fgvn27vlyc93ds6x` FOREIGN KEY (`id_socio`) REFERENCES `socio` (`id_socio`),
  CONSTRAINT `FKocp9xxlgxcfqdhq57uq7qwhbv` FOREIGN KEY (`id_plan`) REFERENCES `plan_membresia` (`id_plan`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `membresia`
--

LOCK TABLES `membresia` WRITE;
/*!40000 ALTER TABLE `membresia` DISABLE KEYS */;
INSERT INTO `membresia` VALUES (1,'ACTIVA','2026-09-05','2027-12-29',1,1),(2,'ACTIVA','2026-09-05','2026-10-05',1,2),(3,'ACTIVA','2026-09-05','2026-12-04',2,3),(4,'ACTIVA','2026-09-05','2026-09-12',3,4),(5,'ACTIVA','2026-09-05','2026-10-05',1,5);
/*!40000 ALTER TABLE `membresia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `meta_objetivo`
--

DROP TABLE IF EXISTS `meta_objetivo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `meta_objetivo` (
  `id_meta` bigint NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_limite` date DEFAULT NULL,
  `tipo_meta` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_entrenador` bigint NOT NULL,
  `id_socio` bigint NOT NULL,
  PRIMARY KEY (`id_meta`),
  KEY `FK30f7kev52337fh66g5m9npij1` (`id_entrenador`),
  KEY `FKhw11a2ikui50jwmg8ayoucx2c` (`id_socio`),
  CONSTRAINT `FK30f7kev52337fh66g5m9npij1` FOREIGN KEY (`id_entrenador`) REFERENCES `entrenador` (`id_entrenador`),
  CONSTRAINT `FKhw11a2ikui50jwmg8ayoucx2c` FOREIGN KEY (`id_socio`) REFERENCES `socio` (`id_socio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `meta_objetivo`
--

LOCK TABLES `meta_objetivo` WRITE;
/*!40000 ALTER TABLE `meta_objetivo` DISABLE KEYS */;
/*!40000 ALTER TABLE `meta_objetivo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `metodo_acceso`
--

DROP TABLE IF EXISTS `metodo_acceso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `metodo_acceso` (
  `id_metodo_acceso` bigint NOT NULL AUTO_INCREMENT,
  `nombre_metodo` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_metodo_acceso`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `metodo_acceso`
--

LOCK TABLES `metodo_acceso` WRITE;
/*!40000 ALTER TABLE `metodo_acceso` DISABLE KEYS */;
INSERT INTO `metodo_acceso` VALUES (1,'QR'),(2,'DNI'),(3,'BIOMETRICO');
/*!40000 ALTER TABLE `metodo_acceso` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `metodo_pago`
--

DROP TABLE IF EXISTS `metodo_pago`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `metodo_pago` (
  `id_metodo_pago` bigint NOT NULL AUTO_INCREMENT,
  `nombre_metodo` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_metodo_pago`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `metodo_pago`
--

LOCK TABLES `metodo_pago` WRITE;
/*!40000 ALTER TABLE `metodo_pago` DISABLE KEYS */;
INSERT INTO `metodo_pago` VALUES (1,'EFECTIVO'),(2,'TARJETA'),(3,'TRANSFERENCIA');
/*!40000 ALTER TABLE `metodo_pago` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pago`
--

DROP TABLE IF EXISTS `pago`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pago` (
  `id_pago` bigint NOT NULL AUTO_INCREMENT,
  `fecha_pago` date DEFAULT NULL,
  `monto` decimal(10,2) NOT NULL,
  `id_membresia` bigint NOT NULL,
  `id_metodo_pago` bigint NOT NULL,
  PRIMARY KEY (`id_pago`),
  KEY `FKlgrjtaceg5vfeyuyf9m5ff45p` (`id_membresia`),
  KEY `FKdsv5grbv3njppmmosjmux0pme` (`id_metodo_pago`),
  CONSTRAINT `FKdsv5grbv3njppmmosjmux0pme` FOREIGN KEY (`id_metodo_pago`) REFERENCES `metodo_pago` (`id_metodo_pago`),
  CONSTRAINT `FKlgrjtaceg5vfeyuyf9m5ff45p` FOREIGN KEY (`id_membresia`) REFERENCES `membresia` (`id_membresia`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pago`
--

LOCK TABLES `pago` WRITE;
/*!40000 ALTER TABLE `pago` DISABLE KEYS */;
INSERT INTO `pago` VALUES (1,'2026-04-01',120.00,1,1),(2,'2026-05-01',120.00,1,1),(3,'2026-06-01',120.00,1,1),(4,'2026-07-01',120.00,1,1),(5,'2026-08-01',120.00,1,1),(6,'2026-09-01',120.00,1,1),(7,'2026-09-05',300.00,1,1),(8,'2026-09-05',300.00,1,1),(9,'2026-09-05',300.00,1,1),(10,'2026-09-05',300.00,1,1),(11,'2026-09-05',300.00,1,3),(12,'2026-09-05',120.00,2,1),(13,'2026-09-05',300.00,3,2),(14,'2026-09-05',35.00,4,2),(15,'2026-09-05',120.00,5,1);
/*!40000 ALTER TABLE `pago` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plan_membresia`
--

DROP TABLE IF EXISTS `plan_membresia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plan_membresia` (
  `id_plan` bigint NOT NULL AUTO_INCREMENT,
  `duracion_dias` int NOT NULL,
  `estado` bit(1) NOT NULL,
  `nombre_plan` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tarifa` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_plan`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plan_membresia`
--

LOCK TABLES `plan_membresia` WRITE;
/*!40000 ALTER TABLE `plan_membresia` DISABLE KEYS */;
INSERT INTO `plan_membresia` VALUES (1,30,_binary '','Mensual',120.00),(2,90,_binary '','Trimestral',300.00),(3,7,_binary '','Semanal',35.00);
/*!40000 ALTER TABLE `plan_membresia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reporte`
--

DROP TABLE IF EXISTS `reporte`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reporte` (
  `id_reporte` bigint NOT NULL AUTO_INCREMENT,
  `archivo_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_generacion` datetime(6) DEFAULT NULL,
  `parametros` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo_reporte` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_usuario` bigint NOT NULL,
  PRIMARY KEY (`id_reporte`),
  KEY `FKptkudu8bt2yxg2t5gb5e032go` (`id_usuario`),
  CONSTRAINT `FKptkudu8bt2yxg2t5gb5e032go` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reporte`
--

LOCK TABLES `reporte` WRITE;
/*!40000 ALTER TABLE `reporte` DISABLE KEYS */;
/*!40000 ALTER TABLE `reporte` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rol`
--

DROP TABLE IF EXISTS `rol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rol` (
  `id_rol` bigint NOT NULL AUTO_INCREMENT,
  `nombre_rol` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id_rol`),
  UNIQUE KEY `UKl0qdsam7tunbtmxcmeeyfcifk` (`nombre_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rol`
--

LOCK TABLES `rol` WRITE;
/*!40000 ALTER TABLE `rol` DISABLE KEYS */;
INSERT INTO `rol` VALUES (2,'ADMIN'),(4,'ENTRENADOR'),(1,'GERENTE'),(3,'RECEPCIONISTA'),(5,'SOCIO');
/*!40000 ALTER TABLE `rol` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rutina`
--

DROP TABLE IF EXISTS `rutina`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rutina` (
  `id_rutina` bigint NOT NULL AUTO_INCREMENT,
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_asignacion` date DEFAULT NULL,
  `nombre_rutina` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_entrenador` bigint NOT NULL,
  `id_socio` bigint NOT NULL,
  PRIMARY KEY (`id_rutina`),
  KEY `FKkd42jf7ysq8hxi2nwun3tdx90` (`id_entrenador`),
  KEY `FKxo0evnl93qjhywrog4oirwle` (`id_socio`),
  CONSTRAINT `FKkd42jf7ysq8hxi2nwun3tdx90` FOREIGN KEY (`id_entrenador`) REFERENCES `entrenador` (`id_entrenador`),
  CONSTRAINT `FKxo0evnl93qjhywrog4oirwle` FOREIGN KEY (`id_socio`) REFERENCES `socio` (`id_socio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rutina`
--

LOCK TABLES `rutina` WRITE;
/*!40000 ALTER TABLE `rutina` DISABLE KEYS */;
/*!40000 ALTER TABLE `rutina` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rutina_ejercicio`
--

DROP TABLE IF EXISTS `rutina_ejercicio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rutina_ejercicio` (
  `id_rutina_ejercicio` bigint NOT NULL AUTO_INCREMENT,
  `completado` bit(1) DEFAULT NULL,
  `repeticiones` int DEFAULT NULL,
  `series` int DEFAULT NULL,
  `id_ejercicio` bigint NOT NULL,
  `id_rutina` bigint NOT NULL,
  PRIMARY KEY (`id_rutina_ejercicio`),
  KEY `FKl5sn6h67cl8dae2ff8a9m5eqd` (`id_ejercicio`),
  KEY `FKp3pwmcjo7gjcgupm9nw8eiil` (`id_rutina`),
  CONSTRAINT `FKl5sn6h67cl8dae2ff8a9m5eqd` FOREIGN KEY (`id_ejercicio`) REFERENCES `ejercicio` (`id_ejercicio`),
  CONSTRAINT `FKp3pwmcjo7gjcgupm9nw8eiil` FOREIGN KEY (`id_rutina`) REFERENCES `rutina` (`id_rutina`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rutina_ejercicio`
--

LOCK TABLES `rutina_ejercicio` WRITE;
/*!40000 ALTER TABLE `rutina_ejercicio` DISABLE KEYS */;
/*!40000 ALTER TABLE `rutina_ejercicio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `socio`
--

DROP TABLE IF EXISTS `socio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `socio` (
  `id_socio` bigint NOT NULL AUTO_INCREMENT,
  `apellidos` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dni` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `nombres` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_usuario` bigint NOT NULL,
  PRIMARY KEY (`id_socio`),
  UNIQUE KEY `UKphmbaelrt52slqsjsomwkr47l` (`id_usuario`),
  UNIQUE KEY `UKiyfehmpa2qw82c2h79wve9aab` (`dni`),
  CONSTRAINT `FKj084h79gn7jsh0plo9mm81umc` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `socio`
--

LOCK TABLES `socio` WRITE;
/*!40000 ALTER TABLE `socio` DISABLE KEYS */;
INSERT INTO `socio` VALUES (1,'Rodriguez','72345678','1998-05-14','Carlos','987654321',1),(2,'García',NULL,NULL,'María',NULL,6),(3,'Díaz',NULL,NULL,'Jacob',NULL,7),(4,'Benito Lopez',NULL,NULL,'Jacob',NULL,8),(5,'lopez',NULL,NULL,'Jacob',NULL,9);
/*!40000 ALTER TABLE `socio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id_usuario` bigint NOT NULL AUTO_INCREMENT,
  `contrasena` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `correo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` bit(1) NOT NULL,
  `id_rol` bigint NOT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `UK2mlfr087gb1ce55f2j87o74t` (`correo`),
  KEY `FKmyv3138vvci6kaq3y5kt4cntu` (`id_rol`),
  CONSTRAINT `FKmyv3138vvci6kaq3y5kt4cntu` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,'$2a$10$6q9GFZLbcm61/dCqGdoqyOk9smRMNmOLuBpcIK6zTUYdCPILXmosy','socio@gym.com',_binary '',5),(2,'$2a$10$6q9GFZLbcm61/dCqGdoqyOk9smRMNmOLuBpcIK6zTUYdCPILXmosy','entrenador@gym.com',_binary '',4),(3,'$2a$10$6q9GFZLbcm61/dCqGdoqyOk9smRMNmOLuBpcIK6zTUYdCPILXmosy','gerente@gym.com',_binary '',1),(4,'$2a$10$6q9GFZLbcm61/dCqGdoqyOk9smRMNmOLuBpcIK6zTUYdCPILXmosy','recepcion@gym.com',_binary '',3),(5,'$2a$10$6q9GFZLbcm61/dCqGdoqyOk9smRMNmOLuBpcIK6zTUYdCPILXmosy','admin@gym.com',_binary '',2),(6,'$2a$10$GpPnf3os3dEseEylyZ.uhe4qgVun/BIB//7dpevxg7w/vWIvTZXEu','maria.garcia@gmail.com',_binary '',5),(7,'$2a$10$UkYuciTyKHd6mrR3Pbu7W.b210gkaxoMCFtA/S9qAnjpqfnwuhR.6','jacob.diaz@gmail.com',_binary '',5),(8,'$2a$10$12XGLnZV5CDogda17pvh1.O0K.3COoyCKVgzoCFmpQKc17BNC29Bm','benitolopezjacob@gmail.com',_binary '',5),(9,'$2a$10$AIh3/XMQ8D8UDTUhqluChegrr.T80oHrMafJpoOMEhiwkNtZ64Bdi','blopezjacob@gmail.com',_binary '',5);
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'gym_system'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-05 17:30:32
