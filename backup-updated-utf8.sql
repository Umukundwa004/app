mysqldump.exe : mysqldump: [Warning] Using a password on the command line interface can be insecure.
At line:1 char:71
+ ... ldump.exe"; & $mysql -u root -pvestine004 rwanda_eats_reserve > backu ...
+                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (mysqldump: [War...an be insecure.:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: rwanda_eats_reserve
-- ------------------------------------------------------
-- Server version	8.0.40

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
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `resource_type` varchar(50) DEFAULT NULL,
  `resource_id` int DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `details` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=309 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,7,'USER_REGISTER','user',7,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"mukundwau@gmail.com\", \"user_type\": \"customer\"}','2025-11-07 09:37:40'),(2,7,'USER_LOGIN','user',7,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"mukundwau@gmail.com\"}','2025-11-07 09:38:03'),(3,7,'USER_LOGIN','user',7,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.105.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36','{\"email\": \"mukundwau@gmail.com\"}','2025-11-07 16:53:08'),(4,8,'USER_AUTO_CREATED','user',8,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.105.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36','{\"email\": \"umukundwa@gmail.com\"}','2025-11-07 17:25:30'),(5,8,'RESERVATION_CREATED','reservation',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.105.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36','{\"restaurant_id\": \"2\", \"reservation_date\": \"2025-11-08\", \"reservation_time\": \"13:00:00\"}','2025-11-07 17:25:30'),(6,2,'USER_LOGIN','user',2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@millecollines.rw\"}','2025-11-07 18:42:50'),(7,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.105.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36','{\"email\": \"admin@rwandaeats.com\"}','2025-11-07 18:43:56'),(8,2,'USER_LOGIN','user',2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.105.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36','{\"email\": \"admin@millecollines.rw\"}','2025-11-07 18:44:46'),(9,2,'USER_LOGIN','user',2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.105.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36','{\"email\": \"admin@millecollines.rw\"}','2025-11-07 18:56:02'),(10,2,'USER_LOGIN','user',2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.105.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36','{\"email\": \"admin@millecollines.rw\"}','2025-11-07 19:06:37'),(11,2,'USER_LOGIN','user',2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@millecollines.rw\"}','2025-11-07 19:13:33'),(12,2,'USER_LOGIN','user',2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@millecollines.rw\"}','2025-11-07 19:38:31'),(13,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-07 19:42:44'),(14,2,'USER_LOGIN','user',2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@millecollines.rw\"}','2025-11-10 09:13:06'),(15,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-10 09:16:45'),(16,1,'RESERVATION_STATUS_UPDATED','reservation',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"status\": \"confirmed\"}','2025-11-10 09:17:20'),(17,7,'USER_LOGIN','user',7,'::1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36 Edg/142.0.0.0','{\"email\": \"mukundwau@gmail.com\"}','2025-11-10 09:36:00'),(18,8,'PASSWORD_RESET_REQUEST','user',8,'::1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36 Edg/142.0.0.0','{}','2025-11-10 09:38:40'),(19,8,'PASSWORD_RESET_REQUEST','user',8,'::1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36 Edg/142.0.0.0','{}','2025-11-10 09:39:01'),(20,8,'PASSWORD_RESET_REQUEST','user',8,'::1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36 Edg/142.0.0.0','{}','2025-11-10 09:39:09'),(21,7,'USER_LOGIN','user',7,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"mukundwau@gmail.com\"}','2025-11-10 09:41:55'),(22,7,'RESERVATION_CREATED','reservation',2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"restaurant_id\": \"1\", \"reservation_date\": \"2025-11-10\", \"reservation_time\": \"10:00:00\"}','2025-11-10 09:42:52'),(23,2,'USER_LOGIN','user',2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@millecollines.rw\"}','2025-11-10 09:43:53'),(24,2,'RESERVATION_STATUS_UPDATED','reservation',2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"status\": \"confirmed\"}','2025-11-10 09:44:07'),(25,7,'USER_LOGIN','user',7,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"mukundwau@gmail.com\"}','2025-11-10 09:44:57'),(26,7,'USER_LOGIN','user',7,'::1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36 Edg/142.0.0.0','{\"email\": \"mukundwau@gmail.com\"}','2025-11-10 09:53:56'),(27,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-10 10:11:15'),(28,2,'USER_LOGIN','user',2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@millecollines.rw\"}','2025-11-10 10:12:50'),(29,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-10 10:16:14'),(30,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-10 10:33:02'),(31,7,'PASSWORD_RESET_REQUEST','user',7,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{}','2025-11-10 10:34:04'),(32,7,'PASSWORD_RESET_REQUEST','user',7,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{}','2025-11-10 10:34:59'),(33,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-13 09:38:12'),(34,2,'USER_LOGIN','user',2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@millecollines.rw\"}','2025-11-13 09:42:01'),(35,2,'USER_LOGOUT','user',2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{}','2025-11-13 09:42:25'),(36,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-13 09:42:44'),(37,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019','{\"email\": \"admin@rwandaeats.com\"}','2025-11-13 09:58:11'),(38,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019','{\"email\": \"admin@rwandaeats.com\"}','2025-11-13 10:00:43'),(39,1,'USER_CREATED','user',9,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019','{\"user_type\": \"restaurant_admin\"}','2025-11-13 10:00:44'),(40,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019','{\"email\": \"admin@rwandaeats.com\"}','2025-11-13 10:15:51'),(41,1,'USER_CREATED','user',10,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019','{\"user_type\": \"restaurant_admin\"}','2025-11-13 10:15:52'),(42,1,'USER_PASSWORD_RESET','user',10,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019','{}','2025-11-13 10:15:52'),(43,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019','{\"email\": \"admin@rwandaeats.com\"}','2025-11-13 10:16:11'),(44,1,'USER_CREATED','user',11,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019','{\"user_type\": \"restaurant_admin\"}','2025-11-13 10:16:12'),(45,1,'USER_PASSWORD_RESET','user',11,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019','{}','2025-11-13 10:16:12'),(46,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019','{\"email\": \"admin@rwandaeats.com\"}','2025-11-13 10:16:30'),(47,1,'USER_CREATED','user',12,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019','{\"user_type\": \"restaurant_admin\"}','2025-11-13 10:16:31'),(48,1,'USER_PASSWORD_RESET','user',12,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019','{}','2025-11-13 10:16:32'),(49,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019','{\"email\": \"admin@rwandaeats.com\"}','2025-11-13 10:17:03'),(50,1,'USER_CREATED','user',13,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019','{\"user_type\": \"restaurant_admin\"}','2025-11-13 10:17:03'),(51,1,'USER_PASSWORD_RESET','user',13,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019','{}','2025-11-13 10:17:04'),(52,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019','{\"email\": \"admin@rwandaeats.com\"}','2025-11-13 10:19:16'),(53,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019','{\"email\": \"admin@rwandaeats.com\"}','2025-11-13 10:19:32'),(54,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019','{\"email\": \"admin@rwandaeats.com\"}','2025-11-13 10:20:35'),(55,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019','{\"email\": \"admin@rwandaeats.com\"}','2025-11-13 10:21:54'),(56,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019','{\"email\": \"admin@rwandaeats.com\"}','2025-11-13 10:23:10'),(57,1,'USER_CREATED','user',14,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019','{\"user_type\": \"restaurant_admin\"}','2025-11-13 10:23:10'),(58,1,'USER_PASSWORD_RESET','user',14,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019','{}','2025-11-13 10:23:12'),(59,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019','{\"email\": \"admin@rwandaeats.com\"}','2025-11-13 10:23:42'),(60,1,'USER_CREATED','user',15,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019','{\"user_type\": \"restaurant_admin\"}','2025-11-13 10:23:42'),(61,1,'USER_PASSWORD_RESET','user',15,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019','{}','2025-11-13 10:23:43'),(62,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019','{\"email\": \"admin@rwandaeats.com\"}','2025-11-13 10:27:00'),(63,1,'USER_CREATED','user',16,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019','{\"user_type\": \"restaurant_admin\"}','2025-11-13 10:27:02'),(64,1,'USER_PASSWORD_RESET','user',16,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019','{}','2025-11-13 10:27:04'),(65,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019','{\"email\": \"admin@rwandaeats.com\"}','2025-11-13 10:29:26'),(66,1,'USER_CREATED','user',17,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019','{\"user_type\": \"restaurant_admin\"}','2025-11-13 10:29:26'),(67,1,'USER_PASSWORD_RESET','user',17,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019','{}','2025-11-13 10:29:27'),(68,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019','{\"email\": \"admin@rwandaeats.com\"}','2025-11-13 10:29:47'),(69,1,'USER_CREATED','user',18,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019','{\"user_type\": \"restaurant_admin\"}','2025-11-13 10:29:47'),(70,1,'USER_PASSWORD_RESET','user',18,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019','{}','2025-11-13 10:29:48'),(71,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019','{\"email\": \"admin@rwandaeats.com\"}','2025-11-13 10:43:46'),(72,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019','{\"email\": \"admin@rwandaeats.com\"}','2025-11-13 10:44:29'),(73,1,'RESTAURANT_DELETED','restaurant',8,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019','{\"adminDeleted\": true}','2025-11-13 10:44:29'),(74,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019','{\"email\": \"admin@rwandaeats.com\"}','2025-11-13 10:47:11'),(75,1,'RESTAURANT_DELETED','restaurant',9,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019','{\"adminDeleted\": true}','2025-11-13 10:47:12'),(76,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019','{\"email\": \"admin@rwandaeats.com\"}','2025-11-13 10:49:47'),(77,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019','{\"email\": \"admin@rwandaeats.com\"}','2025-11-13 10:51:31'),(78,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019','{\"email\": \"admin@rwandaeats.com\"}','2025-11-13 10:51:48'),(79,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019','{\"email\": \"admin@rwandaeats.com\"}','2025-11-13 10:54:08'),(80,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019','{\"email\": \"admin@rwandaeats.com\"}','2025-11-13 11:04:00'),(81,1,'USER_CREATED','user',19,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019','{\"user_type\": \"restaurant_admin\"}','2025-11-13 11:04:00'),(82,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019','{\"email\": \"admin@rwandaeats.com\"}','2025-11-13 11:06:08'),(83,1,'USER_CREATED','user',20,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019','{\"user_type\": \"restaurant_admin\"}','2025-11-13 11:06:08'),(84,1,'RESTAURANT_CREATED','restaurant',17,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019','{\"name\": \"Test-Flow-R-20251113130608\"}','2025-11-13 11:06:08'),(85,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019','{\"email\": \"admin@rwandaeats.com\"}','2025-11-13 11:15:26'),(86,1,'USER_CREATED','user',21,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019','{\"user_type\": \"restaurant_admin\"}','2025-11-13 11:15:26'),(87,1,'RESTAURANT_CREATED','restaurant',18,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019','{\"name\": \"Test-Flow-R-20251113131526\"}','2025-11-13 11:15:26'),(88,1,'USER_PASSWORD_RESET','user',21,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019','{}','2025-11-13 11:15:27'),(89,1,'RESTAURANT_DELETED','restaurant',18,'::1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019','{\"adminDeleted\": true}','2025-11-13 11:15:27'),(90,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-13 11:18:35'),(91,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-13 11:21:45'),(92,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-13 12:05:05'),(93,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-13 14:22:33'),(94,1,'RESTAURANT_DELETED','restaurant',11,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"adminDeleted\": true}','2025-11-13 14:23:28'),(95,1,'RESTAURANT_DELETED','restaurant',13,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"adminDeleted\": true}','2025-11-13 14:23:31'),(96,1,'RESTAURANT_DELETED','restaurant',15,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"adminDeleted\": true}','2025-11-13 14:23:35'),(97,1,'RESTAURANT_DELETED','restaurant',16,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"adminDeleted\": true}','2025-11-13 14:23:39'),(98,1,'RESTAURANT_DELETED','restaurant',17,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"adminDeleted\": true}','2025-11-13 14:23:44'),(99,1,'RESTAURANT_DELETED','restaurant',14,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"adminDeleted\": true}','2025-11-13 14:23:48'),(100,1,'RESTAURANT_DELETED','restaurant',7,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"adminDeleted\": true}','2025-11-13 14:23:51'),(101,1,'RESTAURANT_DELETED','restaurant',10,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"adminDeleted\": true}','2025-11-13 14:23:54'),(102,1,'RESTAURANT_DELETED','restaurant',12,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"adminDeleted\": true}','2025-11-13 14:23:58'),(103,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-13 14:36:12'),(104,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-13 15:06:33'),(105,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-13 15:15:20'),(106,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-13 15:25:48'),(107,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-13 15:37:32'),(108,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-13 15:49:38'),(109,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-13 16:02:23'),(110,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-13 16:11:30'),(111,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-15 17:35:36'),(112,1,'RESTAURANT_DELETED','restaurant',4,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"adminDeleted\": true}','2025-11-15 17:36:08'),(113,1,'USER_LOGOUT','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{}','2025-11-15 17:45:19'),(114,2,'USER_LOGIN','user',2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@millecollines.rw\"}','2025-11-15 17:45:36'),(115,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-15 17:49:54'),(116,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-15 18:02:05'),(117,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-15 18:14:18'),(118,1,'USER_LOGOUT','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{}','2025-11-15 19:06:37'),(119,5,'USER_LOGIN','user',5,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"john@example.com\"}','2025-11-15 19:07:02'),(120,5,'USER_LOGIN','user',5,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"john@example.com\"}','2025-11-15 19:07:02'),(121,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-15 19:09:26'),(122,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-15 19:14:23'),(123,1,'USER_LOGOUT','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{}','2025-11-15 19:36:13'),(124,5,'USER_LOGIN','user',5,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"john@example.com\"}','2025-11-15 19:36:53'),(125,5,'USER_LOGIN','user',5,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"john@example.com\"}','2025-11-15 19:45:40'),(126,5,'USER_LOGIN','user',5,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"john@example.com\"}','2025-11-15 19:52:02'),(127,5,'USER_LOGIN','user',5,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"john@example.com\"}','2025-11-18 09:50:43'),(128,7,'PASSWORD_RESET_REQUEST','user',7,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{}','2025-11-19 16:23:10'),(129,7,'PASSWORD_RESET_REQUEST','user',7,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{}','2025-11-19 16:28:39'),(130,7,'PASSWORD_RESET_REQUEST','user',7,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{}','2025-11-19 16:28:40'),(131,5,'USER_LOGIN','user',5,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"john@example.com\"}','2025-11-19 16:39:54'),(132,5,'USER_LOGIN','user',5,'::1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36 Edg/142.0.0.0','{\"email\": \"john@example.com\"}','2025-11-19 16:40:53'),(133,5,'USER_LOGIN','user',5,'::1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36 Edg/142.0.0.0','{\"email\": \"john@example.com\"}','2025-11-19 16:42:14'),(134,7,'PASSWORD_RESET_REQUEST','user',7,'::1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36 Edg/142.0.0.0','{}','2025-11-19 16:46:05'),(135,7,'PASSWORD_RESET_REQUEST','user',7,'::1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36 Edg/142.0.0.0','{}','2025-11-19 16:46:06'),(136,7,'PASSWORD_RESET_REQUEST','user',7,'::1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36 Edg/142.0.0.0','{}','2025-11-19 16:46:23'),(137,7,'PASSWORD_RESET_REQUEST','user',7,'::1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36 Edg/142.0.0.0','{}','2025-11-19 16:48:28'),(138,5,'USER_LOGIN','user',5,'::1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36 Edg/142.0.0.0','{\"email\": \"john@example.com\"}','2025-11-19 16:49:58'),(139,7,'RESERVATION_CREATED','reservation',3,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"restaurant_id\": \"6\", \"reservation_date\": \"2025-11-28\", \"reservation_time\": \"16:30:00\"}','2025-11-19 17:01:53'),(140,7,'PASSWORD_RESET_REQUEST','user',7,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{}','2025-11-20 09:58:03'),(141,7,'PASSWORD_RESET_REQUEST','user',7,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{}','2025-11-20 09:59:16'),(142,7,'PASSWORD_RESET_REQUEST','user',7,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{}','2025-11-20 09:59:17'),(143,7,'PASSWORD_RESET_REQUEST','user',7,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{}','2025-11-20 10:02:46'),(144,5,'USER_LOGIN','user',5,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"john@example.com\"}','2025-11-20 10:03:02'),(145,2,'USER_LOGIN','user',2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@millecollines.rw\"}','2025-11-20 12:04:26'),(146,2,'RESERVATION_STATUS_UPDATED','reservation',3,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"status\": \"confirmed\"}','2025-11-20 13:18:22'),(147,2,'USER_LOGOUT','user',2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{}','2025-11-20 13:18:28'),(148,7,'USER_LOGIN','user',7,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"mukundwau@gmail.com\"}','2025-11-20 13:18:41'),(149,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-20 14:08:30'),(150,2,'USER_LOGIN','user',2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@millecollines.rw\"}','2025-11-24 07:53:36'),(151,2,'USER_LOGOUT','user',2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{}','2025-11-24 07:56:41'),(152,5,'USER_LOGIN','user',5,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"john@example.com\"}','2025-11-24 07:56:59'),(153,2,'USER_LOGIN','user',2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@millecollines.rw\"}','2025-11-24 08:03:36'),(154,5,'RESERVATION_CREATED','reservation',4,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"restaurant_id\": \"1\", \"reservation_date\": \"2025-11-25\", \"reservation_time\": \"17:00:00\"}','2025-11-24 08:11:00'),(155,2,'USER_LOGIN','user',2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@millecollines.rw\"}','2025-11-24 08:11:18'),(156,2,'RESERVATION_STATUS_UPDATED','reservation',4,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"status\": \"confirmed\"}','2025-11-24 08:11:49'),(157,2,'RESERVATION_STATUS_UPDATED','reservation',4,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"status\": \"confirmed\"}','2025-11-24 08:11:51'),(158,5,'USER_LOGIN','user',5,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"john@example.com\"}','2025-11-24 10:14:28'),(159,5,'RESERVATION_CREATED','reservation',5,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"restaurant_id\": \"2\", \"reservation_date\": \"2025-11-24\", \"reservation_time\": \"17:30:00\"}','2025-11-24 10:15:04'),(160,5,'USER_LOGIN','user',5,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"john@example.com\"}','2025-11-24 13:27:36'),(161,5,'USER_LOGIN','user',5,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"john@example.com\"}','2025-11-24 13:35:30'),(162,5,'USER_LOGIN','user',5,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"john@example.com\"}','2025-11-24 13:55:47'),(163,5,'USER_LOGIN','user',5,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"john@example.com\"}','2025-11-24 14:00:05'),(164,5,'USER_LOGIN','user',5,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"john@example.com\"}','2025-11-24 14:01:15'),(165,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-24 14:04:04'),(166,1,'RESERVATION_STATUS_UPDATED','reservation',5,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"status\": \"confirmed\"}','2025-11-24 14:04:21'),(167,5,'USER_LOGIN','user',5,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"john@example.com\"}','2025-11-24 14:05:09'),(168,5,'USER_LOGOUT','user',5,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{}','2025-11-24 14:30:56'),(169,7,'PASSWORD_RESET_REQUEST','user',7,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{}','2025-11-24 14:37:47'),(170,7,'PASSWORD_RESET_REQUEST','user',7,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{}','2025-11-24 14:39:59'),(171,7,'PASSWORD_RESET_REQUEST','user',7,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{}','2025-11-24 18:37:53'),(172,7,'PASSWORD_RESET_REQUEST','user',7,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{}','2025-11-24 18:39:01'),(173,7,'PASSWORD_RESET_REQUEST','user',7,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{}','2025-11-24 18:39:01'),(174,2,'USER_LOGIN','user',2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@millecollines.rw\"}','2025-11-25 09:47:23'),(175,7,'PASSWORD_RESET_REQUEST','user',7,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{}','2025-11-25 10:33:21'),(176,7,'PASSWORD_RESET_REQUEST','user',7,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{}','2025-11-25 10:33:23'),(177,5,'USER_LOGIN','user',5,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"john@example.com\"}','2025-11-25 10:40:19'),(178,5,'RESERVATION_CANCELLED','reservation',4,'::1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36 Edg/142.0.0.0','{}','2025-11-25 10:41:09'),(179,5,'USER_LOGIN','user',5,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"john@example.com\"}','2025-11-25 10:53:32'),(180,2,'USER_LOGIN','user',2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@millecollines.rw\"}','2025-11-25 11:54:21'),(181,2,'USER_LOGIN','user',2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@millecollines.rw\"}','2025-11-25 12:03:44'),(182,5,'USER_LOGIN','user',5,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"john@example.com\"}','2025-11-25 13:55:21'),(183,5,'USER_LOGIN','user',5,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"john@example.com\"}','2025-11-25 13:55:21'),(184,5,'USER_LOGIN','user',5,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"john@example.com\"}','2025-11-25 13:55:21'),(185,5,'USER_LOGIN','user',5,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"john@example.com\"}','2025-11-25 13:55:22'),(186,5,'USER_LOGIN','user',5,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"john@example.com\"}','2025-11-25 13:55:22'),(187,5,'USER_LOGIN','user',5,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"john@example.com\"}','2025-11-25 14:03:56'),(188,2,'USER_LOGIN','user',2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@millecollines.rw\"}','2025-11-25 15:27:49'),(189,5,'USER_LOGIN','user',5,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"john@example.com\"}','2025-11-25 17:49:35'),(190,2,'USER_LOGIN','user',2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@millecollines.rw\"}','2025-11-25 17:53:27'),(191,2,'USER_LOGIN','user',2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@millecollines.rw\"}','2025-11-25 18:06:39'),(192,2,'USER_LOGOUT','user',2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{}','2025-11-25 18:07:05'),(193,5,'USER_LOGIN','user',5,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"john@example.com\"}','2025-11-25 18:07:22'),(194,5,'USER_LOGIN','user',5,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"john@example.com\"}','2025-11-25 18:09:33'),(195,5,'USER_LOGIN','user',5,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"john@example.com\"}','2025-11-25 18:14:34'),(196,5,'USER_LOGIN','user',5,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"john@example.com\"}','2025-11-25 18:20:46'),(197,5,'RESERVATION_CREATED','reservation',6,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"restaurant_id\": \"1\", \"reservation_date\": \"2025-11-25\", \"reservation_time\": \"19:00:00\"}','2025-11-25 18:31:43'),(198,5,'USER_LOGOUT','user',5,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{}','2025-11-25 18:32:08'),(199,2,'USER_LOGIN','user',2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@millecollines.rw\"}','2025-11-25 18:32:21'),(200,2,'RESERVATION_STATUS_UPDATED','reservation',6,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"status\": \"confirmed\"}','2025-11-25 18:33:03'),(201,2,'USER_LOGOUT','user',2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{}','2025-11-25 18:33:09'),(202,5,'USER_LOGIN','user',5,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"john@example.com\"}','2025-11-25 18:33:21'),(203,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-25 18:40:48'),(204,2,'USER_LOGIN','user',2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@millecollines.rw\"}','2025-11-26 07:41:07'),(205,5,'USER_LOGIN','user',5,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','{\"email\": \"john@example.com\"}','2025-11-26 07:42:15'),(206,7,'RESERVATION_CREATED','reservation',7,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','{\"restaurant_id\": \"1\", \"reservation_date\": \"2025-11-26\", \"reservation_time\": \"12:30:00\"}','2025-11-26 07:48:22'),(207,2,'USER_LOGIN','user',2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@millecollines.rw\"}','2025-11-26 07:53:47'),(208,5,'USER_LOGIN','user',5,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','{\"email\": \"john@example.com\"}','2025-11-26 07:55:59'),(209,2,'RESERVATION_STATUS_UPDATED','reservation',7,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"status\": \"confirmed\"}','2025-11-26 07:59:36'),(210,7,'USER_LOGIN','user',7,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','{\"email\": \"mukundwau@gmail.com\"}','2025-11-26 08:01:13'),(211,2,'USER_LOGIN','user',2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@millecollines.rw\"}','2025-11-26 08:15:21'),(212,2,'USER_LOGIN','user',2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@millecollines.rw\"}','2025-11-26 08:26:25'),(213,2,'USER_LOGIN','user',2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@millecollines.rw\"}','2025-11-26 08:35:34'),(214,2,'USER_LOGIN','user',2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@millecollines.rw\"}','2025-11-26 08:44:13'),(215,2,'USER_LOGIN','user',2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@millecollines.rw\"}','2025-11-26 08:56:25'),(216,2,'USER_LOGIN','user',2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@millecollines.rw\"}','2025-11-26 09:05:40'),(217,5,'USER_LOGIN','user',5,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','{\"email\": \"john@example.com\"}','2025-11-26 09:09:20'),(218,2,'USER_LOGIN','user',2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@millecollines.rw\"}','2025-11-26 09:15:40'),(219,2,'USER_LOGIN','user',2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@millecollines.rw\"}','2025-11-26 09:19:47'),(220,2,'USER_LOGIN','user',2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@millecollines.rw\"}','2025-11-26 09:22:18'),(221,2,'USER_LOGIN','user',2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@millecollines.rw\"}','2025-11-26 09:26:24'),(222,2,'USER_LOGIN','user',2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@millecollines.rw\"}','2025-11-26 09:29:06'),(223,2,'USER_LOGIN','user',2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@millecollines.rw\"}','2025-11-26 09:31:37'),(224,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 09:32:26'),(225,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 09:35:22'),(226,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 09:42:46'),(227,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 09:49:55'),(228,1,'USER_LOGOUT','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{}','2025-11-26 09:51:42'),(229,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 09:57:50'),(230,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 10:02:45'),(231,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 10:05:03'),(232,4,'USER_LOGIN','user',4,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"hut@gmail.com\"}','2025-11-26 10:05:59'),(233,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 10:06:43'),(234,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 10:14:29'),(235,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 10:19:56'),(236,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 10:24:49'),(237,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 11:01:10'),(238,1,'RESTAURANT_CREATED','restaurant',19,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"name\": \"ayoka` restaurant\"}','2025-11-26 11:01:27'),(239,2,'USER_LOGIN','user',2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@millecollines.rw\"}','2025-11-26 11:18:27'),(240,5,'USER_LOGIN','user',5,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"john@example.com\"}','2025-11-26 11:48:46'),(241,5,'USER_LOGIN','user',5,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"john@example.com\"}','2025-11-26 12:05:13'),(242,2,'USER_LOGIN','user',2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@millecollines.rw\"}','2025-11-26 12:06:58'),(243,2,'USER_LOGIN','user',2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@millecollines.rw\"}','2025-11-26 12:07:15'),(244,2,'USER_LOGIN','user',2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@millecollines.rw\"}','2025-11-26 12:08:01'),(245,4,'USER_LOGIN','user',4,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"hut@gmail.com\"}','2025-11-26 12:08:17'),(246,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 12:09:40'),(247,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 12:10:51'),(248,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 12:11:15'),(249,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 12:14:14'),(250,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 12:14:27'),(251,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 12:15:10'),(252,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 12:17:50'),(253,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 12:20:08'),(254,5,'USER_LOGIN','user',5,'::1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36 Edg/142.0.0.0','{\"email\": \"john@example.com\"}','2025-11-26 12:20:21'),(255,5,'USER_LOGOUT','user',5,'::1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36 Edg/142.0.0.0','{}','2025-11-26 12:20:33'),(256,2,'USER_LOGIN','user',2,'::1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@millecollines.rw\"}','2025-11-26 12:20:44'),(257,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 12:23:25'),(258,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 12:26:47'),(259,2,'USER_LOGIN','user',2,'::1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@millecollines.rw\"}','2025-11-26 12:27:06'),(260,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.106.2 Chrome/138.0.7204.251 Electron/37.7.0 Safari/537.36','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 12:27:46'),(261,2,'USER_LOGIN','user',2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.106.2 Chrome/138.0.7204.251 Electron/37.7.0 Safari/537.36','{\"email\": \"admin@millecollines.rw\"}','2025-11-26 12:31:47'),(262,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 12:37:02'),(263,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 12:37:14'),(264,1,'USER_LOGOUT','user',1,'::1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36 Edg/142.0.0.0','{}','2025-11-26 12:37:46'),(265,5,'USER_LOGIN','user',5,'::1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36 Edg/142.0.0.0','{\"email\": \"john@example.com\"}','2025-11-26 12:37:59'),(266,5,'USER_LOGOUT','user',5,'::1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36 Edg/142.0.0.0','{}','2025-11-26 12:38:05'),(267,2,'USER_LOGIN','user',2,'::1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@millecollines.rw\"}','2025-11-26 12:38:26'),(268,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 12:42:55'),(269,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.106.2 Chrome/138.0.7204.251 Electron/37.7.0 Safari/537.36','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 12:43:56'),(270,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 12:46:24'),(271,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 12:54:33'),(272,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 12:54:59'),(273,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 12:55:51'),(274,2,'USER_LOGIN','user',2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@millecollines.rw\"}','2025-11-26 12:56:51'),(275,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 12:57:50'),(276,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 13:02:05'),(277,2,'USER_LOGIN','user',2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@millecollines.rw\"}','2025-11-26 13:02:29'),(278,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 13:03:46'),(279,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 13:04:13'),(280,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 13:05:41'),(281,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 13:51:00'),(282,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 13:51:26'),(283,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 13:54:59'),(284,2,'USER_LOGIN','user',2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@millecollines.rw\"}','2025-11-26 13:55:12'),(285,2,'USER_LOGIN','user',2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@millecollines.rw\"}','2025-11-26 13:59:11'),(286,2,'USER_LOGIN','user',2,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@millecollines.rw\"}','2025-11-26 13:59:41'),(287,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 14:12:53'),(288,1,'USER_LOGOUT','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{}','2025-11-26 14:13:07'),(289,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 14:13:16'),(290,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 14:16:03'),(291,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 14:18:12'),(292,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 14:35:37'),(293,5,'USER_LOGIN','user',5,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"john@example.com\"}','2025-11-26 14:36:35'),(294,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 16:39:40'),(295,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 16:41:22'),(296,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 16:47:14'),(297,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 16:49:22'),(298,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 16:55:35'),(299,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 16:57:38'),(300,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 17:00:04'),(301,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 17:03:13'),(302,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 17:08:23'),(303,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 17:13:19'),(304,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-26 17:22:48'),(305,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-27 10:40:22'),(306,1,'USER_LOGOUT','user',1,'::1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36 Edg/142.0.0.0','{}','2025-11-27 10:43:23'),(307,5,'USER_LOGIN','user',5,'::1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36 Edg/142.0.0.0','{\"email\": \"john@example.com\"}','2025-11-27 10:43:36'),(308,1,'USER_LOGIN','user',1,'::1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36 Edg/142.0.0.0','{\"email\": \"admin@rwandaeats.com\"}','2025-11-27 14:30:59');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `email_templates`
--

DROP TABLE IF EXISTS `email_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `email_templates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `body` text NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email_templates`
--

LOCK TABLES `email_templates` WRITE;
/*!40000 ALTER TABLE `email_templates` DISABLE KEYS */;
INSERT INTO `email_templates` VALUES (1,'welcome','Welcome to Rwanda Eats Reserve!','<h1>Welcome {{name}}!</h1><p>Thank you for joining Rwanda Eats Reserve. Please verify your email by clicking the link below:</p><p><a href=\"{{verification_url}}\">Verify Email</a></p>',1,'2025-11-07 09:36:26','2025-11-07 09:36:26'),(2,'reservation_confirmation','Your Reservation is Confirmed!','<h1>Reservation Confirmed</h1><p>Dear {{customer_name}},</p><p>Your reservation at <strong>{{restaurant_name}}</strong> has been confirmed!</p><p><strong>Date:</strong> {{reservation_date}}<br><strong>Time:</strong> {{reservation_time}}<br><strong>Party Size:</strong> {{party_size}}</p>',1,'2025-11-07 09:36:26','2025-11-07 09:36:26');
/*!40000 ALTER TABLE `email_templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menu_items`
--

DROP TABLE IF EXISTS `menu_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `restaurant_id` int DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `category` varchar(50) DEFAULT NULL,
  `cuisine` varchar(50) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `is_available` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `restaurant_id` (`restaurant_id`),
  CONSTRAINT `menu_items_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu_items`
--

LOCK TABLES `menu_items` WRITE;
/*!40000 ALTER TABLE `menu_items` DISABLE KEYS */;
INSERT INTO `menu_items` VALUES (1,1,'Grilled Tilapia','Fresh lake tilapia with herbs and spices',18000.00,'Main Course',NULL,NULL,1,'2025-11-07 09:36:26'),(2,1,'Beef Brochette','Grilled beef skewers with vegetables',15000.00,'Main Course',NULL,NULL,1,'2025-11-07 09:36:26'),(3,1,'Caesar Salad','Classic Caesar with grilled chicken',12000.00,'Appetizer',NULL,NULL,1,'2025-11-07 09:36:26'),(4,2,'Goat Cheese Salad','Fresh greens with warm goat cheese',14000.00,'Appetizer',NULL,NULL,1,'2025-11-07 09:36:26'),(5,2,'Lamb Chops','Grilled lamb with rosemary and garlic',25000.00,'Main Course',NULL,NULL,1,'2025-11-07 09:36:26'),(6,3,'Ugali with Fish','Traditional Rwandan meal with grilled fish',10000.00,'Main Course',NULL,NULL,1,'2025-11-07 09:36:26'),(7,3,'Isombe','Cassava leaves with peanut sauce',8000.00,'Main Course',NULL,NULL,1,'2025-11-07 09:36:26'),(9,5,'Butter Chicken','Creamy tomato-based chicken curry',18000.00,'Main Course',NULL,NULL,1,'2025-11-07 09:36:26'),(10,5,'Biryani','Fragrant rice with mixed vegetables or chicken',16000.00,'Main Course',NULL,NULL,1,'2025-11-07 09:36:26'),(11,1,'matoke','good',5000.00,'main course','rwandan',NULL,1,'2025-11-26 09:08:29');
/*!40000 ALTER TABLE `menu_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` varchar(50) DEFAULT 'system',
  `channel` enum('in_app','email','sms') DEFAULT 'in_app',
  `related_reservation_id` int DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `is_sent` tinyint(1) DEFAULT '0',
  `sent_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `related_reservation_id` (`related_reservation_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`related_reservation_id`) REFERENCES `reservations` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,3,'New Reservation Request','New reservation request from vestine for 2025-11-08 at 13:00:00','new_reservation','in_app',1,0,0,NULL,'2025-11-07 17:25:30'),(2,8,'Reservation Request Sent','Your reservation request at Heaven Restaurant has been received and is pending confirmation.','reservation_status','in_app',1,0,0,NULL,'2025-11-07 17:25:30'),(3,8,'Reservation Confirmed!','Your reservation at Heaven Restaurant has been confirmed for Sat Nov 08 2025 00:00:00 GMT+0200 (Eastern European Standard Time) at 13:00:00.','reservation_status','in_app',1,0,0,NULL,'2025-11-10 09:17:20'),(4,2,'New Reservation Request','New reservation request from vestine umukundwa for 2025-11-10 at 10:00:00','new_reservation','in_app',2,1,0,NULL,'2025-11-10 09:42:52'),(5,7,'Reservation Request Sent','Your reservation request at Hotel des Mille Collines has been received and is pending confirmation.','reservation_status','in_app',2,1,0,NULL,'2025-11-10 09:42:52'),(6,7,'Reservation Confirmed!','Your reservation at Hotel des Mille Collines has been confirmed for Mon Nov 10 2025 00:00:00 GMT+0200 (Eastern European Standard Time) at 10:00:00.','reservation_status','in_app',2,1,0,NULL,'2025-11-10 09:44:07'),(7,2,'New Reservation Request','New reservation request from vestine umukundwa for 2025-11-28 at 16:30:00','new_reservation','in_app',3,1,0,NULL,'2025-11-19 17:01:53'),(8,7,'Reservation Request Sent','Your reservation request at deluxe has been received and is pending confirmation.','reservation_status','in_app',3,1,0,NULL,'2025-11-19 17:01:53'),(9,7,'Reservation Confirmed!','Your reservation at deluxe has been confirmed for Fri Nov 28 2025 00:00:00 GMT+0200 (Eastern European Standard Time) at 16:30:00.','reservation_status','in_app',3,1,0,NULL,'2025-11-20 13:18:22'),(10,2,'New Reservation Request','New reservation request from John Doe for 2025-11-25 at 17:00:00','new_reservation','in_app',4,1,0,NULL,'2025-11-24 08:10:59'),(11,5,'Reservation Request Sent','Your reservation request at Hotel des Mille Collines has been received and is pending confirmation.','reservation_status','in_app',4,1,0,NULL,'2025-11-24 08:10:59'),(12,5,'Reservation Confirmed!','Your reservation at Hotel des Mille Collines has been confirmed for Tue Nov 25 2025 00:00:00 GMT+0200 (Eastern European Standard Time) at 17:00:00.','reservation_status','in_app',4,1,0,NULL,'2025-11-24 08:11:49'),(13,5,'Reservation Confirmed!','Your reservation at Hotel des Mille Collines has been confirmed for Tue Nov 25 2025 00:00:00 GMT+0200 (Eastern European Standard Time) at 17:00:00.','reservation_status','in_app',4,1,0,NULL,'2025-11-24 08:11:51'),(14,3,'New Reservation Request','New reservation request from John Doe for 2025-11-24 at 17:30:00','new_reservation','in_app',5,0,0,NULL,'2025-11-24 10:15:04'),(15,5,'Reservation Request Sent','Your reservation request at Heaven Restaurant has been received and is pending confirmation.','reservation_status','in_app',5,1,0,NULL,'2025-11-24 10:15:04'),(16,5,'Reservation Confirmed!','Your reservation at Heaven Restaurant has been confirmed for Mon Nov 24 2025 00:00:00 GMT+0200 (Eastern European Standard Time) at 17:30:00.','reservation_status','in_app',5,1,0,NULL,'2025-11-24 14:04:21'),(17,5,'Reservation Reminder','Reminder: You have a reservation at Hotel des Mille Collines tomorrow at 17:00:00','reminder','in_app',4,1,0,NULL,'2025-11-24 15:41:44'),(18,5,'Reservation Cancelled','Your reservation at Hotel des Mille Collines for Tue Nov 25 2025 00:00:00 GMT+0200 (Eastern European Standard Time) 17:00:00 has been cancelled.','reservation_status','in_app',4,1,0,NULL,'2025-11-25 10:41:09'),(19,2,'Reservation Cancelled','Reservation for John Doe at Hotel des Mille Collines on Tue Nov 25 2025 00:00:00 GMT+0200 (Eastern European Standard Time) 17:00:00 was cancelled.','reservation_status','in_app',4,1,0,NULL,'2025-11-25 10:41:09'),(20,2,'New Reservation Request','New reservation request from John Doe for 2025-11-25 at 19:00:00','new_reservation','in_app',6,1,0,NULL,'2025-11-25 18:31:43'),(21,5,'Reservation Request Sent','Your reservation request at Hotel des Mille Collines has been received and is pending confirmation.','reservation_status','in_app',6,1,0,NULL,'2025-11-25 18:31:43'),(22,5,'Reservation Confirmed!','Your reservation at Hotel des Mille Collines has been confirmed for Tue Nov 25 2025 00:00:00 GMT+0200 (Eastern European Standard Time) at 19:00:00.','reservation_status','in_app',6,1,0,NULL,'2025-11-25 18:33:03'),(23,2,'New Reservation Request','New reservation request from umukundwa vestine for 2025-11-26 at 12:30:00','new_reservation','in_app',7,1,0,NULL,'2025-11-26 07:48:22'),(24,7,'Reservation Request Sent','Your reservation request at Hotel des Mille Collines has been received and is pending confirmation.','reservation_status','in_app',7,0,0,NULL,'2025-11-26 07:48:22'),(25,7,'Reservation Confirmed!','Your reservation at Hotel des Mille Collines has been confirmed for Wed Nov 26 2025 00:00:00 GMT+0200 (Eastern European Standard Time) at 12:30:00.','reservation_status','in_app',7,0,0,NULL,'2025-11-26 07:59:36');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reservations`
--

DROP TABLE IF EXISTS `reservations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reservations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int DEFAULT NULL,
  `restaurant_id` int DEFAULT NULL,
  `reservation_date` date NOT NULL,
  `reservation_time` time NOT NULL,
  `party_size` int NOT NULL,
  `occasion` varchar(50) DEFAULT NULL,
  `special_requests` text,
  `status` enum('pending','confirmed','rejected','cancelled','completed') DEFAULT 'pending',
  `notification_sent` tinyint(1) DEFAULT '0',
  `reminder_sent` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `customer_id` (`customer_id`),
  KEY `restaurant_id` (`restaurant_id`),
  CONSTRAINT `reservations_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reservations_ibfk_2` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reservations`
--

LOCK TABLES `reservations` WRITE;
/*!40000 ALTER TABLE `reservations` DISABLE KEYS */;
INSERT INTO `reservations` VALUES (1,8,2,'2025-11-08','13:00:00',1,'','moth','confirmed',0,0,'2025-11-07 17:25:30','2025-11-10 09:17:20'),(2,7,1,'2025-11-10','10:00:00',10,'Family Gathering','no','confirmed',0,0,'2025-11-10 09:42:52','2025-11-10 09:44:06'),(3,7,6,'2025-11-28','16:30:00',7,'','no','confirmed',0,0,'2025-11-19 17:01:53','2025-11-20 13:18:19'),(4,5,1,'2025-11-25','17:00:00',8,'Birthday','no','cancelled',0,1,'2025-11-24 08:10:59','2025-11-25 10:41:09'),(5,5,2,'2025-11-24','17:30:00',8,'Date Night','no','confirmed',0,0,'2025-11-24 10:15:04','2025-11-24 14:04:19'),(6,5,1,'2025-11-25','19:00:00',4,'','not','confirmed',0,0,'2025-11-25 18:31:43','2025-11-25 18:33:01'),(7,7,1,'2025-11-26','12:30:00',4,'Anniversary','drinks must be readly when we alive','confirmed',0,0,'2025-11-26 07:48:22','2025-11-26 07:59:34');
/*!40000 ALTER TABLE `reservations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restaurant_amenities`
--

DROP TABLE IF EXISTS `restaurant_amenities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurant_amenities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `restaurant_id` int NOT NULL,
  `amenity_type` enum('wifi','parking','outdoor_seating','vegetarian','halal','delivery','takeout','reservation','air_conditioning','live_music','pet_friendly','wheelchair_accessible') NOT NULL,
  `is_visible` tinyint(1) DEFAULT '1',
  `added_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_restaurant_amenity` (`restaurant_id`,`amenity_type`),
  KEY `added_by` (`added_by`),
  KEY `idx_visible` (`restaurant_id`,`is_visible`),
  CONSTRAINT `restaurant_amenities_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `restaurant_amenities_ibfk_2` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurant_amenities`
--

LOCK TABLES `restaurant_amenities` WRITE;
/*!40000 ALTER TABLE `restaurant_amenities` DISABLE KEYS */;
INSERT INTO `restaurant_amenities` VALUES (1,1,'wifi',1,1,'2025-11-25 12:15:01','2025-11-25 12:15:01'),(2,1,'parking',1,1,'2025-11-25 12:15:01','2025-11-25 12:15:01'),(3,1,'air_conditioning',1,1,'2025-11-25 12:15:01','2025-11-25 12:15:01'),(4,6,'live_music',1,2,'2025-11-26 08:16:16','2025-11-26 08:16:16');
/*!40000 ALTER TABLE `restaurant_amenities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restaurant_cuisines`
--

DROP TABLE IF EXISTS `restaurant_cuisines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurant_cuisines` (
  `id` int NOT NULL AUTO_INCREMENT,
  `restaurant_id` int NOT NULL,
  `cuisine_name` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_restaurant_cuisine` (`restaurant_id`,`cuisine_name`),
  KEY `idx_cuisine` (`cuisine_name`),
  CONSTRAINT `restaurant_cuisines_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurant_cuisines`
--

LOCK TABLES `restaurant_cuisines` WRITE;
/*!40000 ALTER TABLE `restaurant_cuisines` DISABLE KEYS */;
INSERT INTO `restaurant_cuisines` VALUES (1,1,'International','2025-11-25 12:57:23'),(2,2,'Fusion','2025-11-25 12:57:23'),(3,3,'Rwandan','2025-11-25 12:57:23'),(4,5,'Indian','2025-11-25 12:57:23'),(5,6,'International','2025-11-25 12:57:23');
/*!40000 ALTER TABLE `restaurant_cuisines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restaurant_images`
--

DROP TABLE IF EXISTS `restaurant_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurant_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `restaurant_id` int NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `image_type` enum('gallery','menu','interior','exterior','food') DEFAULT 'gallery',
  `caption` varchar(255) DEFAULT NULL,
  `display_order` int DEFAULT '0',
  `is_visible` tinyint(1) DEFAULT '1',
  `uploaded_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `uploaded_by` (`uploaded_by`),
  KEY `idx_restaurant_visible` (`restaurant_id`,`is_visible`,`display_order`),
  CONSTRAINT `restaurant_images_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `restaurant_images_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurant_images`
--

LOCK TABLES `restaurant_images` WRITE;
/*!40000 ALTER TABLE `restaurant_images` DISABLE KEYS */;
INSERT INTO `restaurant_images` VALUES (1,6,'/uploads/restaurants/images-1764147963308-707077532.png','gallery',NULL,0,1,NULL,'2025-11-26 09:06:03'),(2,1,'/uploads/restaurants/images-1764148135560-551160086.png','gallery',NULL,0,1,NULL,'2025-11-26 09:08:55');
/*!40000 ALTER TABLE `restaurant_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restaurants`
--

DROP TABLE IF EXISTS `restaurants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `location` varchar(255) DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `contact_phone` varchar(20) DEFAULT NULL,
  `contact_email` varchar(100) DEFAULT NULL,
  `opening_time` time DEFAULT NULL,
  `closing_time` time DEFAULT NULL,
  `cuisine_type` varchar(50) DEFAULT NULL,
  `price_range` enum('1','2','3') DEFAULT '2',
  `image_url` varchar(255) DEFAULT NULL,
  `video_url` varchar(255) DEFAULT NULL,
  `tables_count` int DEFAULT '10',
  `restaurant_admin_id` int DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `amenities` json DEFAULT NULL,
  `rating_display` tinyint(1) DEFAULT '1',
  `reviews_enabled` tinyint(1) DEFAULT '1',
  `video_enabled` tinyint(1) DEFAULT '1',
  `gallery_enabled` tinyint(1) DEFAULT '1',
  `cuisines` json DEFAULT NULL,
  `menu` text,
  `menu_pdf_url` varchar(255) DEFAULT NULL,
  `certificate_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `restaurant_admin_id` (`restaurant_admin_id`),
  CONSTRAINT `restaurants_ibfk_1` FOREIGN KEY (`restaurant_admin_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurants`
--

LOCK TABLES `restaurants` WRITE;
/*!40000 ALTER TABLE `restaurants` DISABLE KEYS */;
INSERT INTO `restaurants` VALUES (1,'Hotel des Mille Collines','Iconic hotel with exceptional dining experience overlooking Kigali','Kigali City Center',NULL,NULL,'+250788111111','reservations@millecollines.rw','06:00:00','22:00:00','International','3','/uploads/restaurants/image-1762769676974-878883191.jpeg','/uploads/restaurants/video-1762769676975-253225281.mp4',20,2,1,'2025-11-07 09:36:26','2025-11-26 08:27:11',NULL,1,0,0,1,'[\"International\"]',NULL,NULL,NULL),(2,'Heaven Restaurant','Rooftop dining with panoramic views and fusion cuisine','Kiyovu, Kigali',NULL,NULL,'+250788222222','info@heaven.rw','11:00:00','23:00:00','Fusion','3',NULL,NULL,15,3,1,'2025-11-07 09:36:26','2025-11-25 12:57:22',NULL,1,1,1,1,'[\"Fusion\"]',NULL,NULL,NULL),(3,'The Hut','Traditional Rwandan cuisine in a cozy atmosphere','Remera, Kigali',NULL,NULL,'+250788333333','bookings@thehut.rw','10:00:00','21:00:00','Rwandan','2',NULL,NULL,12,4,1,'2025-11-07 09:36:26','2025-11-25 12:57:22',NULL,1,1,1,1,'[\"Rwandan\"]',NULL,NULL,NULL),(5,'Khana Khazana','Authentic Indian cuisine in the heart of Kigali','Nyarutarama, Kigali',NULL,NULL,'+250788555555','info@khana.rw','11:30:00','22:00:00','Indian','2',NULL,NULL,10,3,1,'2025-11-07 09:36:26','2025-11-25 12:57:22',NULL,1,1,1,1,'[\"Indian\"]',NULL,NULL,NULL),(6,'deluxe','everyone is welcome','Kigali City Center',NULL,NULL,'07895559654','mukundwa@gmail.com','00:00:00','23:00:00','International','2',NULL,NULL,50,2,1,'2025-11-07 18:47:43','2025-11-26 09:16:06',NULL,0,0,0,1,'[\"International\"]',NULL,'/uploads/restaurants/menu_pdf-1764148566767-840273147.png',NULL),(19,'ayoka` restaurant',NULL,'Kigali City Center',NULL,NULL,'07895559000','ayoka@gmail.com',NULL,NULL,'International','2',NULL,NULL,41,NULL,1,'2025-11-26 11:01:27','2025-11-26 11:01:27',NULL,1,1,1,1,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `restaurants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `restaurant_id` int NOT NULL,
  `customer_id` int NOT NULL,
  `rating` int NOT NULL,
  `comment` text,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `is_visible` tinyint(1) DEFAULT '0',
  `admin_notes` text,
  `reviewed_by` int DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `customer_id` (`customer_id`),
  KEY `idx_restaurant_status` (`restaurant_id`,`status`),
  KEY `idx_visible` (`is_visible`,`created_at`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_chk_1` CHECK (((`rating` >= 1) and (`rating` <= 5)))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,1,4,5,'Amazing food and excellent service! The ambiance is perfect for special occasions.','approved',1,NULL,NULL,NULL,'2025-11-25 12:15:01','2025-11-25 12:15:01'),(2,2,4,4,'Authentic Rwandan cuisine. The Isombe was delicious!','approved',1,NULL,NULL,NULL,'2025-11-25 12:15:01','2025-11-25 12:15:01'),(3,2,5,4,'nice place to visit','pending',0,NULL,NULL,NULL,'2025-11-25 18:21:23','2025-11-25 18:21:23'),(4,1,5,3,'nice place','pending',0,NULL,NULL,NULL,'2025-11-26 07:56:18','2025-11-26 07:56:18'),(5,1,7,3,'nice','pending',0,NULL,NULL,NULL,'2025-11-26 08:04:41','2025-11-26 08:04:41');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int unsigned NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sms_templates`
--

DROP TABLE IF EXISTS `sms_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sms_templates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `message` text NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sms_templates`
--

LOCK TABLES `sms_templates` WRITE;
/*!40000 ALTER TABLE `sms_templates` DISABLE KEYS */;
INSERT INTO `sms_templates` VALUES (1,'reservation_confirmation_sms','Your reservation at {{restaurant_name}} is confirmed for {{reservation_date}} at {{reservation_time}} for {{party_size}} people.',1,'2025-11-07 09:36:26','2025-11-07 09:36:26');
/*!40000 ALTER TABLE `sms_templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `table_availability`
--

DROP TABLE IF EXISTS `table_availability`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `table_availability` (
  `id` int NOT NULL AUTO_INCREMENT,
  `restaurant_id` int DEFAULT NULL,
  `date` date NOT NULL,
  `time_slot` time NOT NULL,
  `available_tables` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_slot` (`restaurant_id`,`date`,`time_slot`),
  CONSTRAINT `table_availability_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=91 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `table_availability`
--

LOCK TABLES `table_availability` WRITE;
/*!40000 ALTER TABLE `table_availability` DISABLE KEYS */;
INSERT INTO `table_availability` VALUES (1,6,'2025-11-07','08:00:00',16,'2025-11-07 18:48:30'),(2,6,'2025-11-07','08:30:00',16,'2025-11-07 18:48:30'),(3,6,'2025-11-07','09:00:00',20,'2025-11-07 18:48:30'),(4,6,'2025-11-07','09:30:00',20,'2025-11-07 18:48:30'),(5,6,'2025-11-07','10:00:00',20,'2025-11-07 18:48:30'),(6,6,'2025-11-07','10:30:00',20,'2025-11-07 18:48:30'),(7,6,'2025-11-07','11:00:00',20,'2025-11-07 18:48:30'),(8,6,'2025-11-07','11:30:00',20,'2025-11-07 18:48:30'),(9,6,'2025-11-07','12:00:00',20,'2025-11-07 18:48:30'),(10,6,'2025-11-07','12:30:00',20,'2025-11-07 18:48:30'),(11,6,'2025-11-07','13:00:00',20,'2025-11-07 18:48:30'),(12,6,'2025-11-07','13:30:00',20,'2025-11-07 18:48:30'),(13,6,'2025-11-07','14:00:00',20,'2025-11-07 18:48:30'),(14,6,'2025-11-07','14:30:00',20,'2025-11-07 18:48:30'),(15,6,'2025-11-07','15:00:00',20,'2025-11-07 18:48:30'),(16,6,'2025-11-07','15:30:00',20,'2025-11-07 18:48:30'),(17,6,'2025-11-07','16:00:00',20,'2025-11-07 18:48:30'),(18,6,'2025-11-07','16:30:00',20,'2025-11-07 18:48:30'),(19,6,'2025-11-07','17:00:00',20,'2025-11-07 18:48:30'),(20,6,'2025-11-07','17:30:00',20,'2025-11-07 18:48:30'),(21,6,'2025-11-07','18:00:00',20,'2025-11-07 18:48:30'),(22,6,'2025-11-07','18:30:00',20,'2025-11-07 18:48:30'),(23,6,'2025-11-07','19:00:00',20,'2025-11-07 18:48:30'),(24,6,'2025-11-07','19:30:00',20,'2025-11-07 18:48:30'),(25,6,'2025-11-07','20:00:00',20,'2025-11-07 18:48:30'),(26,6,'2025-11-07','20:30:00',20,'2025-11-07 18:48:30'),(27,6,'2025-11-07','21:00:00',20,'2025-11-07 18:48:30'),(28,6,'2025-11-07','21:30:00',20,'2025-11-07 18:48:30'),(29,6,'2025-11-07','22:00:00',20,'2025-11-07 18:48:30'),(30,6,'2025-11-07','22:30:00',20,'2025-11-07 18:48:30'),(61,6,'2025-11-30','08:00:00',0,'2025-11-25 18:06:58'),(62,6,'2025-11-30','08:30:00',50,'2025-11-25 18:06:58'),(63,6,'2025-11-30','09:00:00',50,'2025-11-25 18:06:58'),(64,6,'2025-11-30','09:30:00',50,'2025-11-25 18:06:58'),(65,6,'2025-11-30','10:00:00',50,'2025-11-25 18:06:58'),(66,6,'2025-11-30','10:30:00',50,'2025-11-25 18:06:58'),(67,6,'2025-11-30','11:00:00',50,'2025-11-25 18:06:58'),(68,6,'2025-11-30','11:30:00',50,'2025-11-25 18:06:58'),(69,6,'2025-11-30','12:00:00',50,'2025-11-25 18:06:58'),(70,6,'2025-11-30','12:30:00',50,'2025-11-25 18:06:58'),(71,6,'2025-11-30','13:00:00',50,'2025-11-25 18:06:58'),(72,6,'2025-11-30','13:30:00',50,'2025-11-25 18:06:59'),(73,6,'2025-11-30','14:00:00',50,'2025-11-25 18:06:59'),(74,6,'2025-11-30','14:30:00',50,'2025-11-25 18:06:59'),(75,6,'2025-11-30','15:00:00',50,'2025-11-25 18:06:59'),(76,6,'2025-11-30','15:30:00',50,'2025-11-25 18:06:59'),(77,6,'2025-11-30','16:00:00',50,'2025-11-25 18:06:59'),(78,6,'2025-11-30','16:30:00',50,'2025-11-25 18:06:59'),(79,6,'2025-11-30','17:00:00',50,'2025-11-25 18:06:59'),(80,6,'2025-11-30','17:30:00',50,'2025-11-25 18:06:59'),(81,6,'2025-11-30','18:00:00',50,'2025-11-25 18:06:59'),(82,6,'2025-11-30','18:30:00',50,'2025-11-25 18:06:59'),(83,6,'2025-11-30','19:00:00',50,'2025-11-25 18:06:59'),(84,6,'2025-11-30','19:30:00',50,'2025-11-25 18:06:59'),(85,6,'2025-11-30','20:00:00',50,'2025-11-25 18:06:59'),(86,6,'2025-11-30','20:30:00',50,'2025-11-25 18:06:59'),(87,6,'2025-11-30','21:00:00',50,'2025-11-25 18:06:59'),(88,6,'2025-11-30','21:30:00',50,'2025-11-25 18:06:59'),(89,6,'2025-11-30','22:00:00',50,'2025-11-25 18:06:59'),(90,6,'2025-11-30','22:30:00',50,'2025-11-25 18:06:59');
/*!40000 ALTER TABLE `table_availability` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_sessions`
--

DROP TABLE IF EXISTS `user_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `session_token` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `session_token` (`session_token`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_sessions`
--

LOCK TABLES `user_sessions` WRITE;
/*!40000 ALTER TABLE `user_sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `user_type` enum('customer','restaurant_admin','system_admin') DEFAULT 'customer',
  `email_verified` tinyint(1) DEFAULT '0',
  `phone_verified` tinyint(1) DEFAULT '0',
  `verification_token` varchar(100) DEFAULT NULL,
  `reset_token` varchar(100) DEFAULT NULL,
  `reset_token_expires` datetime DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  `login_attempts` int DEFAULT '0',
  `account_locked` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'System Admin','admin@rwandaeats.com','$2a$12$Ne3Yf4sonUzbePFUFSlLeekIAsPsM5BLMa66gNtQoOxtjd1dVO.am','+250788000001','system_admin',1,0,NULL,NULL,NULL,'2025-11-27 16:30:59',0,0,'2025-11-07 09:36:26','2025-11-27 14:47:53'),(2,'Hotel des Mille Collines','admin@millecollines.rw','$2a$12$9G2adEZYi49MCBuPXtbhienT45J1Q96voUqhINQOeO7NWh/6sSG/e','+250788000002','restaurant_admin',1,0,NULL,NULL,NULL,'2025-11-26 15:59:41',0,0,'2025-11-07 09:36:26','2025-11-27 14:47:53'),(3,'Heaven Restaurant','admin@heaven.rw','$2a$10$H0vDu.6RI5iLe2lRj.OcxuvG/ti2hed.vIMGqdaOABcw7yJ9FBRqS','+250788000003','restaurant_admin',1,0,NULL,NULL,NULL,NULL,0,0,'2025-11-07 09:36:26','2025-11-26 08:43:31'),(4,'The Hut','hut@gmail.com','$2a$12$b1piSJ5bnQU7o0vzXDH2Re4q4bN/OTwEQHG4FWW2DcgXFwlRPKoLu','+250788000004','restaurant_admin',1,0,NULL,NULL,NULL,'2025-11-26 14:08:17',0,0,'2025-11-07 09:36:26','2025-11-26 12:08:17'),(5,'John Doe','john@example.com','$2a$12$MLWBo9z1RJbQaWy8G3CMdOMTZtepTZHUm2qlCv9BEYwT5A3qdR6zi','+250788000007','customer',1,0,NULL,NULL,NULL,'2025-11-27 12:43:36',0,0,'2025-11-07 09:36:26','2025-11-27 14:47:54'),(6,'Jane Smith','jane@example.com','$2a$12$qXBi5eXcIhX1HlyCqCTbM.UxbKj8Wnv6Fy1hqlw1GwLmmfl0.72QW','+250788000006','customer',1,0,NULL,NULL,NULL,NULL,0,0,'2025-11-07 09:36:26','2025-11-07 18:41:10'),(7,'vestine umukundwa','mukundwau@gmail.com','$2a$12$Mj32nfCyan/BDYy50RqAmORhbDLe/EZj2iw/WPds3Jqy0ItHcxDiO','0798559654','customer',0,0,'4b646346817d53e77c37b602e5b343414ea5c32403fcf48ba878b45396dd5c03','75016538ced6816b81674dd1100243e421e7fb6419e45f62301cddd6ec8b1a35','2025-11-25 12:48:22','2025-11-26 10:01:13',0,0,'2025-11-07 09:37:40','2025-11-26 08:01:13'),(8,'vestine','umukundwa@gmail.com','$2a$12$Btw/8cQFp/DcEsBI689mluVpER/iPWjTI89JVhKqPwsZJkM90ZmSO','0796665555','customer',0,0,NULL,'1485e1eca3ff655d8b10172e8464e4025bfd7ea821adf7006df96634e818c7f0','2025-11-10 12:39:09',NULL,3,0,'2025-11-07 17:25:30','2025-11-10 09:41:34'),(22,'mane ayoka','ayoka@gmail.com','$2a$12$/GyWH0F5qlkROHz8zI3.O.mENVC5x3UFfZCLaEf/IfNoZwsweYnZ2','+250788000004','restaurant_admin',1,0,NULL,NULL,NULL,NULL,0,0,'2025-11-26 10:07:33','2025-11-26 16:52:54');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-27 16:50:58

