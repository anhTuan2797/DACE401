-- MySQL dump 10.13  Distrib 8.0.22, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: schooldb
-- ------------------------------------------------------
-- Server version	8.0.22

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `attendance_tbl`
--

DROP TABLE IF EXISTS `attendance_tbl`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance_tbl` (
  `session_id` int NOT NULL,
  `class_id` varchar(10) NOT NULL,
  `student_id` varchar(10) NOT NULL,
  `attendance_time` int DEFAULT NULL,
  PRIMARY KEY (`session_id`,`class_id`,`student_id`),
  KEY `attendanceToStudent_idx` (`student_id`),
  CONSTRAINT `attendanceToSession` FOREIGN KEY (`session_id`, `class_id`) REFERENCES `session_tbl` (`session_id`, `class_id`),
  CONSTRAINT `attendanceToStudent` FOREIGN KEY (`student_id`) REFERENCES `student_tbl` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance_tbl`
--

LOCK TABLES `attendance_tbl` WRITE;
/*!40000 ALTER TABLE `attendance_tbl` DISABLE KEYS */;
INSERT INTO `attendance_tbl` VALUES (1,'class1','16521376',39843);
/*!40000 ALTER TABLE `attendance_tbl` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class_detail_tbl`
--

DROP TABLE IF EXISTS `class_detail_tbl`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `class_detail_tbl` (
  `class_id` varchar(10) NOT NULL,
  `student_id` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`class_id`),
  KEY `classDetailToStudent_idx` (`student_id`),
  CONSTRAINT `classDeatilToClass` FOREIGN KEY (`class_id`) REFERENCES `class_tbl` (`class_id`),
  CONSTRAINT `classDetailToStudent` FOREIGN KEY (`student_id`) REFERENCES `student_tbl` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_detail_tbl`
--

LOCK TABLES `class_detail_tbl` WRITE;
/*!40000 ALTER TABLE `class_detail_tbl` DISABLE KEYS */;
INSERT INTO `class_detail_tbl` VALUES ('class1','16521376');
/*!40000 ALTER TABLE `class_detail_tbl` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class_tbl`
--

DROP TABLE IF EXISTS `class_tbl`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `class_tbl` (
  `class_id` varchar(10) NOT NULL,
  `class_name` varchar(45) DEFAULT NULL,
  `teacher_id` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`class_id`),
  KEY `classToTeacher_idx` (`teacher_id`),
  CONSTRAINT `classToTeacher` FOREIGN KEY (`teacher_id`) REFERENCES `teacher_tbl` (`teacher_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_tbl`
--

LOCK TABLES `class_tbl` WRITE;
/*!40000 ALTER TABLE `class_tbl` DISABLE KEYS */;
INSERT INTO `class_tbl` VALUES ('class1','class1','teacher1'),('class2','class2','teacher1');
/*!40000 ALTER TABLE `class_tbl` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `machine_tbl`
--

DROP TABLE IF EXISTS `machine_tbl`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `machine_tbl` (
  `machine_id` varchar(10) NOT NULL,
  `machine_name` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`machine_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `machine_tbl`
--

LOCK TABLES `machine_tbl` WRITE;
/*!40000 ALTER TABLE `machine_tbl` DISABLE KEYS */;
INSERT INTO `machine_tbl` VALUES ('may1','may1'),('may2','may2');
/*!40000 ALTER TABLE `machine_tbl` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `room_tbl`
--

DROP TABLE IF EXISTS `room_tbl`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `room_tbl` (
  `room_id` varchar(10) NOT NULL,
  `room_name` varchar(45) DEFAULT NULL,
  `machine_id` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`room_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `room_tbl`
--

LOCK TABLES `room_tbl` WRITE;
/*!40000 ALTER TABLE `room_tbl` DISABLE KEYS */;
INSERT INTO `room_tbl` VALUES ('C305','C305','may2'),('C306','C306','may1');
/*!40000 ALTER TABLE `room_tbl` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `session_tbl`
--

DROP TABLE IF EXISTS `session_tbl`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `session_tbl` (
  `session_id` int NOT NULL,
  `session_date` varchar(45) DEFAULT NULL,
  `room_id` varchar(10) DEFAULT NULL,
  `class_id` varchar(45) NOT NULL,
  PRIMARY KEY (`session_id`,`class_id`),
  KEY `sessionToClass_idx` (`class_id`),
  KEY `sessionToRoom_idx` (`room_id`),
  CONSTRAINT `sessionToClass` FOREIGN KEY (`class_id`) REFERENCES `class_tbl` (`class_id`),
  CONSTRAINT `sessionToRoom` FOREIGN KEY (`room_id`) REFERENCES `room_tbl` (`room_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `session_tbl`
--

LOCK TABLES `session_tbl` WRITE;
/*!40000 ALTER TABLE `session_tbl` DISABLE KEYS */;
INSERT INTO `session_tbl` VALUES (1,'11/11/2021','C305','class1'),(2,'12/12/2022','C305','class1');
/*!40000 ALTER TABLE `session_tbl` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_tbl`
--

DROP TABLE IF EXISTS `student_tbl`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_tbl` (
  `student_id` varchar(10) NOT NULL,
  `student_name` varchar(45) DEFAULT NULL,
  `student_sex` varchar(10) DEFAULT NULL,
  `student_birthday` varchar(45) DEFAULT NULL,
  `student_mail` varchar(45) DEFAULT NULL,
  `student_tel` varchar(45) DEFAULT NULL,
  `student_major` varchar(45) DEFAULT NULL,
  `student_password` varchar(45) DEFAULT NULL,
  `student_fpLink` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_tbl`
--

LOCK TABLES `student_tbl` WRITE;
/*!40000 ALTER TABLE `student_tbl` DISABLE KEYS */;
INSERT INTO `student_tbl` VALUES ('1','nguyen van a','MALE','1111-11-11','sdsd','swww','wwwqq','test','dfdfdf'),('16521376','nguyen anh tuan','MALE','2121-12-22','sdsdss','sdsdsd','sdsdsdsd','test',NULL);
/*!40000 ALTER TABLE `student_tbl` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teacher_tbl`
--

DROP TABLE IF EXISTS `teacher_tbl`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teacher_tbl` (
  `teacher_id` varchar(10) NOT NULL,
  `teacher_name` varchar(45) DEFAULT NULL,
  `teacher_password` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`teacher_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teacher_tbl`
--

LOCK TABLES `teacher_tbl` WRITE;
/*!40000 ALTER TABLE `teacher_tbl` DISABLE KEYS */;
INSERT INTO `teacher_tbl` VALUES ('teacher1','teacher1','test');
/*!40000 ALTER TABLE `teacher_tbl` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'schooldb'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-01-05 23:59:35
