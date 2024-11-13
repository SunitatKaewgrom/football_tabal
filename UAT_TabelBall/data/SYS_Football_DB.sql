-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Nov 13, 2024 at 12:53 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `SYS_Football_DB`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `username`, `password`, `created_at`) VALUES
(1, 'admin', '$2b$12$C2zyllUw35sn6yy0ysX1eOdXj0zABZm9uiWBnhqoT3pkSKFaBM7y6', '2024-10-26 07:55:50');

-- --------------------------------------------------------

--
-- Table structure for table `community_expert`
--

CREATE TABLE `community_expert` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `pick_rounds` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`pick_rounds`)),
  `stat_percentage` decimal(5,2) DEFAULT NULL,
  `match_detail` varchar(255) DEFAULT NULL,
  `betting_tip` varchar(100) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `community_expert`
--

INSERT INTO `community_expert` (`id`, `name`, `pick_rounds`, `stat_percentage`, `match_detail`, `betting_tip`, `image_url`, `created_at`, `updated_at`) VALUES
(9, 'ทดสอบ', '{\"round1\": \"\\u0e16\\u0e39\\u0e01\", \"round2\": \"\\u0e44\\u0e21\\u0e48\\u0e17\\u0e23\\u0e32\\u0e1a\\u0e1c\\u0e25\", \"round3\": \"\\u0e44\\u0e21\\u0e48\\u0e17\\u0e23\\u0e32\\u0e1a\\u0e1c\\u0e25\", \"round4\": \"\\u0e16\\u0e39\\u0e01\", \"round5\": \"\\u0e1c\\u0e34\\u0e14\", \"round6\": \"\\u0e1c\\u0e34\\u0e14\", \"round7\": \"\\u0e1c\\u0e34\\u0e14\", \"round8\": \"\\u0e16\\u0e39\\u0e01\", \"round9\": \"\\u0e16\\u0e39\\u0e01\", \"round10\": \"\\u0e44\\u0e21\\u0e48\\u0e17\\u0e23\\u0e32\\u0e1a\\u0e1c\\u0e25\"}', 40.00, 'ข้อความ', 'รอง', 'static/uploads/img_community_expert/btff1-2.png', '2024-11-10 12:21:36', '2024-11-10 13:07:53'),
(11, 'เซียนบอล', '{\"round1\": \"\\u0e16\\u0e39\\u0e01\", \"round2\": \"\\u0e16\\u0e39\\u0e01\", \"round3\": \"\\u0e16\\u0e39\\u0e01\", \"round4\": \"\\u0e16\\u0e39\\u0e01\", \"round5\": \"\\u0e16\\u0e39\\u0e01\", \"round6\": \"\\u0e16\\u0e39\\u0e01\", \"round7\": \"\\u0e16\\u0e39\\u0e01\", \"round8\": \"\\u0e16\\u0e39\\u0e01\", \"round9\": \"\\u0e44\\u0e21\\u0e48\\u0e17\\u0e23\\u0e32\\u0e1a\\u0e1c\\u0e25\", \"round10\": \"\\u0e44\\u0e21\\u0e48\\u0e17\\u0e23\\u0e32\\u0e1a\\u0e1c\\u0e25\"}', 80.00, '5555555555', 'รองสิบล้าน', 'static/uploads/img_community_expert/bttf2-1.png', '2024-11-10 13:23:03', '2024-11-10 13:23:14');

-- --------------------------------------------------------

--
-- Table structure for table `experts`
--

CREATE TABLE `experts` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `experts`
--

INSERT INTO `experts` (`id`, `name`, `image_url`) VALUES
(11, 'ทดสอบ', 'static/uploads/img_experts/btff1-2.png'),
(14, 'เซียน 101', 'static/uploads/img_experts/bttf2-1.png'),
(16, 'เซียนมวย', 'static/uploads/img_experts/bttf2-1.png');

-- --------------------------------------------------------

--
-- Table structure for table `expert_predictions`
--

CREATE TABLE `expert_predictions` (
  `id` int(11) NOT NULL,
  `expert_id` int(11) DEFAULT NULL,
  `tips_table_id` int(11) DEFAULT NULL,
  `prediction` enum('ชนะ','เสมอ','แพ้') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `header_messages`
--

CREATE TABLE `header_messages` (
  `id` int(11) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `link_url` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `header_messages`
--

INSERT INTO `header_messages` (`id`, `description`, `image_url`, `link_url`, `updated_at`) VALUES
(4, 'ทดสอบ 101', 'l333.png', 'https://www.google.com/', '2024-11-10 13:22:08');

-- --------------------------------------------------------

--
-- Table structure for table `leagues`
--

CREATE TABLE `leagues` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `leagues`
--

INSERT INTO `leagues` (`id`, `name`, `logo_url`, `created_at`, `updated_at`) VALUES
(1, 'ไทย', 'static/uploads/img_league/bttf3-2.png', '2024-11-02 15:33:23', '2024-11-05 15:06:33'),
(2, 'มาเลย์2', 'static/uploads/img_league/btff1-2.png', '2024-11-02 15:37:58', '2024-11-02 15:56:14'),
(6, 'เมกาใต้', 'static/uploads/img_league/playmember.7c5964e.png', '2024-11-10 09:51:22', '2024-11-10 12:51:28'),
(7, 'ญี่ปุ่น 2', 'static/uploads/img_league/playmember.7c5964e.png', '2024-11-10 13:24:14', '2024-11-10 13:24:21');

-- --------------------------------------------------------

--
-- Table structure for table `teams`
--

CREATE TABLE `teams` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `league_id` int(11) DEFAULT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `teams`
--

INSERT INTO `teams` (`id`, `name`, `league_id`, `logo_url`, `created_at`, `updated_at`) VALUES
(2, 'ไทย', 1, 'static/uploads/img_team/bttf2-4-2.gif', '2024-11-04 13:37:38', '2024-11-04 13:37:38'),
(21, 'ทดสอบ', 6, 'static/uploads/img_team/bttf2-1.png', '2024-11-10 13:01:32', '2024-11-10 13:02:02'),
(23, 'จีน', 6, 'static/uploads/img_team/bttf2-4-2.gif', '2024-11-11 15:33:57', '2024-11-11 15:34:05'),
(24, 'มาเลย์', 2, 'static/uploads/img_team/playmember.7c5964e.png', '2024-11-11 15:34:15', '2024-11-11 15:34:15');

-- --------------------------------------------------------

--
-- Table structure for table `tips_table`
--

CREATE TABLE `tips_table` (
  `id` int(11) NOT NULL,
  `home_team` varchar(255) DEFAULT NULL,
  `away_team` varchar(255) DEFAULT NULL,
  `match_date` datetime DEFAULT NULL,
  `home_team_result` enum('ชนะ','เสมอ','แพ้') DEFAULT NULL,
  `away_team_result` enum('ชนะ','เสมอ','แพ้') DEFAULT NULL,
  `betting_tip` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `community_expert`
--
ALTER TABLE `community_expert`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `experts`
--
ALTER TABLE `experts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `expert_predictions`
--
ALTER TABLE `expert_predictions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `expert_id` (`expert_id`),
  ADD KEY `tips_table_id` (`tips_table_id`);

--
-- Indexes for table `header_messages`
--
ALTER TABLE `header_messages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `leagues`
--
ALTER TABLE `leagues`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `teams`
--
ALTER TABLE `teams`
  ADD PRIMARY KEY (`id`),
  ADD KEY `league_id` (`league_id`);

--
-- Indexes for table `tips_table`
--
ALTER TABLE `tips_table`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `community_expert`
--
ALTER TABLE `community_expert`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `experts`
--
ALTER TABLE `experts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `expert_predictions`
--
ALTER TABLE `expert_predictions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `header_messages`
--
ALTER TABLE `header_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `leagues`
--
ALTER TABLE `leagues`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `teams`
--
ALTER TABLE `teams`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `tips_table`
--
ALTER TABLE `tips_table`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `expert_predictions`
--
ALTER TABLE `expert_predictions`
  ADD CONSTRAINT `expert_predictions_ibfk_1` FOREIGN KEY (`expert_id`) REFERENCES `experts` (`id`),
  ADD CONSTRAINT `expert_predictions_ibfk_2` FOREIGN KEY (`tips_table_id`) REFERENCES `tips_table` (`id`);

--
-- Constraints for table `teams`
--
ALTER TABLE `teams`
  ADD CONSTRAINT `teams_ibfk_1` FOREIGN KEY (`league_id`) REFERENCES `leagues` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
