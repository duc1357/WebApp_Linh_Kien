-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Apr 16, 2026 at 04:14 PM
-- Server version: 8.4.3
-- PHP Version: 8.3.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `web_linh_kien`
--

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `description` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`) VALUES
(1, 'CPU', NULL),
(2, 'Mainboard', NULL),
(3, 'RAM', NULL),
(4, 'VGA', NULL),
(5, 'Nguồn (PSU)', NULL),
(6, 'Vỏ Case', NULL),
(7, 'Ổ Cứng', NULL),
(8, 'Tản Nhiệt', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `laptop_models`
--

CREATE TABLE `laptop_models` (
  `id` int NOT NULL,
  `name` varchar(200) DEFAULT NULL,
  `brand` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `laptop_models`
--

INSERT INTO `laptop_models` (`id`, `name`, `brand`) VALUES
(1, 'Dell XPS 9500', 'Dell'),
(2, 'Asus TUF Dash F15', 'Asus');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `total_amount` float DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `shipping_address` text,
  `created_at` datetime DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT 'COD',
  `payment_status` varchar(50) DEFAULT 'UNPAID'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `total_amount`, `status`, `shipping_address`, `created_at`, `payment_method`, `payment_status`) VALUES
(1, 3, 1900000, 'CANCELLED', '441 điện biên phủ, TP. Hồ Chí Minh', '2026-04-12 08:52:00', 'COD', 'UNPAID'),
(2, 3, 1900000, 'CANCELLED', 'QL64, TP. Hồ Chí Minh', '2026-04-12 08:59:16', 'SEPAY_30', 'UNPAID'),
(3, 3, 5000, 'PAID', '441 điện biên phủ, TP. Hồ Chí Minh', '2026-04-12 09:09:40', 'SEPAY_100', 'PAID'),
(4, 3, 5000, 'PAID', '441 điện biên phủ, TP. Hồ Chí Minh', '2026-04-12 11:09:23', 'SEPAY_100', 'PAID'),
(5, 3, 1900000, 'CANCELLED', '441 điện biên phủ, TP. Hồ Chí Minh', '2026-04-14 09:16:47', 'SEPAY_30', 'UNPAID'),
(6, 3, 1900000, 'CANCELLED', '441 điện biên phủ, TP. Hồ Chí Minh', '2026-04-14 09:23:01', 'SEPAY_30', 'UNPAID'),
(7, 3, 1900000, 'CANCELLED', '441 điện biên phủ, TP. Hồ Chí Minh', '2026-04-14 09:26:22', 'SEPAY_30', 'UNPAID');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int NOT NULL,
  `order_id` int DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `price_at_purchase` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `price_at_purchase`) VALUES
(1, 1, 1, 1, 1900000),
(2, 2, 1, 1, 1900000),
(3, 3, 401, 1, 5000),
(4, 4, 401, 1, 5000),
(5, 5, 1, 1, 1900000),
(6, 6, 1, 1, 1900000),
(7, 7, 1, 1, 1900000);

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `id` int NOT NULL,
  `token` varchar(255) NOT NULL,
  `user_id` int NOT NULL,
  `expires_at` datetime NOT NULL,
  `is_used` tinyint(1) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `password_reset_tokens`
--

INSERT INTO `password_reset_tokens` (`id`, `token`, `user_id`, `expires_at`, `is_used`, `created_at`) VALUES
(3, '385504', 3, '2026-04-11 21:12:31', 1, '2026-04-11 20:57:31'),
(5, '684720', 3, '2026-04-11 21:15:07', 0, '2026-04-11 21:00:07');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int NOT NULL,
  `name` varchar(200) DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `price` float DEFAULT NULL,
  `stock` int DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `specs` text,
  `is_active` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `category_id`, `price`, `stock`, `image`, `specs`, `is_active`) VALUES
(1, 'AMD CPU Ryzen 5 3600 Box Fullbox', 1, 1900000, 6, 'https://placehold.co/600x600/450a0a/f87171?text=AMD+Ryzen+5', 'AM4 | 6 Cores 12 Threads | 65W', 1),
(2, 'AMD CPU Ryzen 7 7800X3D Box Fullbox', 1, 10000000, 31, 'https://placehold.co/600x600/450a0a/f87171?text=AMD+Ryzen+7', 'AM5 | 8 Cores 16 Threads | 120W', 1),
(3, 'AMD CPU Ryzen 9 7900X Box Fullbox', 1, 11300000, 34, 'https://placehold.co/600x600/450a0a/f87171?text=AMD+Ryzen+9', 'AM5 | 12 Cores 24 Threads | 170W', 1),
(4, 'Intel CPU Core i7-13700K Tray', 1, 9700000, 9, 'https://placehold.co/600x600/0f172a/60a5fa?text=Intel+Core+i7', 'LGA1700 | 16 Cores 24 Threads | 125W', 1),
(5, 'Intel CPU Core i3-10100F Tray', 1, 1500000, 8, 'https://placehold.co/600x600/0f172a/60a5fa?text=Intel+Core+i3', 'LGA1200 | 4 Cores 8 Threads | 65W', 1),
(6, 'Intel CPU Core i9-13900K Box Chính Hãng', 1, 12600000, 6, 'https://placehold.co/600x600/0f172a/60a5fa?text=Intel+Core+i9', 'LGA1700 | 24 Cores 32 Threads | 125W', 1),
(7, 'AMD CPU Ryzen 7 7800X3D Nhập Khẩu', 1, 10100000, 29, 'https://placehold.co/600x600/450a0a/f87171?text=AMD+Ryzen+7', 'AM5 | 8 Cores 16 Threads | 120W', 1),
(8, 'AMD CPU Ryzen 9 7950X Box Fullbox', 1, 15400000, 7, 'https://placehold.co/600x600/450a0a/f87171?text=AMD+Ryzen+9', 'AM5 | 16 Cores 32 Threads | 170W', 1),
(9, 'AMD CPU Ryzen 7 7700X Tray', 1, 7600000, 16, 'https://placehold.co/600x600/450a0a/f87171?text=AMD+Ryzen+7', 'AM5 | 8 Cores 16 Threads | 105W', 1),
(10, 'Intel CPU Core i5-12400F Tray', 1, 3100000, 50, 'https://placehold.co/600x600/0f172a/60a5fa?text=Intel+Core+i5', 'LGA1700 | 6 Cores 12 Threads | 65W', 1),
(11, 'Intel CPU Core i9-13900K Tray', 1, 12600000, 43, 'https://placehold.co/600x600/0f172a/60a5fa?text=Intel+Core+i9', 'LGA1700 | 24 Cores 32 Threads | 125W', 1),
(12, 'Intel CPU Core i5-13400F Nhập Khẩu', 1, 4600000, 19, 'https://placehold.co/600x600/0f172a/60a5fa?text=Intel+Core+i5', 'LGA1700 | 10 Cores 16 Threads | 65W', 1),
(13, 'AMD CPU Ryzen 9 7900X Tray', 1, 11700000, 34, 'https://placehold.co/600x600/450a0a/f87171?text=AMD+Ryzen+9', 'AM5 | 12 Cores 24 Threads | 170W', 1),
(14, 'Intel CPU Core i5-12400F Box Fullbox', 1, 3000000, 27, 'https://placehold.co/600x600/0f172a/60a5fa?text=Intel+Core+i5', 'LGA1700 | 6 Cores 12 Threads | 65W', 1),
(15, 'AMD CPU Ryzen 9 7900X Tray (2)', 1, 11400000, 40, 'https://placehold.co/600x600/450a0a/f87171?text=AMD+Ryzen+9', 'AM5 | 12 Cores 24 Threads | 170W', 1),
(16, 'Intel CPU Core i3-10100F Box Fullbox', 1, 1500000, 21, 'https://placehold.co/600x600/0f172a/60a5fa?text=Intel+Core+i3', 'LGA1200 | 4 Cores 8 Threads | 65W', 1),
(17, 'AMD CPU Ryzen 7 5800X3D Nhập Khẩu', 1, 7700000, 7, 'https://placehold.co/600x600/450a0a/f87171?text=AMD+Ryzen+7', 'AM4 | 8 Cores 16 Threads | 105W', 1),
(18, 'AMD CPU Ryzen 5 3600 Box Fullbox (2)', 1, 1600000, 50, 'https://placehold.co/600x600/450a0a/f87171?text=AMD+Ryzen+5', 'AM4 | 6 Cores 12 Threads | 65W', 1),
(19, 'AMD CPU Ryzen 9 7900X Box Fullbox (2)', 1, 11700000, 20, 'https://placehold.co/600x600/450a0a/f87171?text=AMD+Ryzen+9', 'AM5 | 12 Cores 24 Threads | 170W', 1),
(20, 'Intel CPU Core i7-13700K Tray (2)', 1, 9600000, 49, 'https://placehold.co/600x600/0f172a/60a5fa?text=Intel+Core+i7', 'LGA1700 | 16 Cores 24 Threads | 125W', 1),
(21, 'Intel CPU Core i5-13400F Box Chính Hãng', 1, 4300000, 31, 'https://placehold.co/600x600/0f172a/60a5fa?text=Intel+Core+i5', 'LGA1700 | 10 Cores 16 Threads | 65W', 1),
(22, 'AMD CPU Ryzen 5 3600 Box Chính Hãng', 1, 1700000, 23, 'https://placehold.co/600x600/450a0a/f87171?text=AMD+Ryzen+5', 'AM4 | 6 Cores 12 Threads | 65W', 1),
(23, 'Intel CPU Core i5-13400F Tray', 1, 4300000, 43, 'https://placehold.co/600x600/0f172a/60a5fa?text=Intel+Core+i5', 'LGA1700 | 10 Cores 16 Threads | 65W', 1),
(24, 'AMD CPU Ryzen 7 7800X3D Box Chính Hãng', 1, 10400000, 39, 'https://placehold.co/600x600/450a0a/f87171?text=AMD+Ryzen+7', 'AM5 | 8 Cores 16 Threads | 120W', 1),
(25, 'AMD CPU Ryzen 5 3600 Tray', 1, 1900000, 18, 'https://placehold.co/600x600/450a0a/f87171?text=AMD+Ryzen+5', 'AM4 | 6 Cores 12 Threads | 65W', 1),
(26, 'Intel CPU Core i3-10100F Nhập Khẩu', 1, 1400000, 8, 'https://placehold.co/600x600/0f172a/60a5fa?text=Intel+Core+i3', 'LGA1200 | 4 Cores 8 Threads | 65W', 1),
(27, 'AMD CPU Ryzen 7 5700X Nhập Khẩu', 1, 3900000, 35, 'https://placehold.co/600x600/450a0a/f87171?text=AMD+Ryzen+7', 'AM4 | 8 Cores 16 Threads | 65W', 1),
(28, 'AMD CPU Ryzen 7 5800X3D Nhập Khẩu (2)', 1, 7400000, 9, 'https://placehold.co/600x600/450a0a/f87171?text=AMD+Ryzen+7', 'AM4 | 8 Cores 16 Threads | 105W', 1),
(29, 'Intel CPU Core i7-12700K Tray', 1, 8200000, 46, 'https://placehold.co/600x600/0f172a/60a5fa?text=Intel+Core+i7', 'LGA1700 | 12 Cores 20 Threads | 125W', 1),
(30, 'AMD CPU Ryzen 7 7700X Box Chính Hãng', 1, 7800000, 32, 'https://placehold.co/600x600/450a0a/f87171?text=AMD+Ryzen+7', 'AM5 | 8 Cores 16 Threads | 105W', 1),
(31, 'Intel CPU Core i9-14900K Nhập Khẩu', 1, 14600000, 38, 'https://placehold.co/600x600/0f172a/60a5fa?text=Intel+Core+i9', 'LGA1700 | 24 Cores 32 Threads | 125W', 1),
(32, 'Intel CPU Core i7-12700K Box Chính Hãng', 1, 8100000, 19, 'https://placehold.co/600x600/0f172a/60a5fa?text=Intel+Core+i7', 'LGA1700 | 12 Cores 20 Threads | 125W', 1),
(33, 'AMD CPU Ryzen 7 5800X3D Box Chính Hãng', 1, 7700000, 34, 'https://placehold.co/600x600/450a0a/f87171?text=AMD+Ryzen+7', 'AM4 | 8 Cores 16 Threads | 105W', 1),
(34, 'Intel CPU Core i5-13400F Box Chính Hãng (2)', 1, 4400000, 5, 'https://placehold.co/600x600/0f172a/60a5fa?text=Intel+Core+i5', 'LGA1700 | 10 Cores 16 Threads | 65W', 1),
(35, 'AMD CPU Ryzen 7 7700X Box Chính Hãng (2)', 1, 7600000, 39, 'https://placehold.co/600x600/450a0a/f87171?text=AMD+Ryzen+7', 'AM5 | 8 Cores 16 Threads | 105W', 1),
(36, 'AMD CPU Ryzen 7 7800X3D Box Fullbox (2)', 1, 10400000, 44, 'https://placehold.co/600x600/450a0a/f87171?text=AMD+Ryzen+7', 'AM5 | 8 Cores 16 Threads | 120W', 1),
(37, 'AMD CPU Ryzen 9 7900X Nhập Khẩu', 1, 11600000, 14, 'https://placehold.co/600x600/450a0a/f87171?text=AMD+Ryzen+9', 'AM5 | 12 Cores 24 Threads | 170W', 1),
(38, 'AMD CPU Ryzen 5 7600X Box Chính Hãng', 1, 5200000, 8, 'https://placehold.co/600x600/450a0a/f87171?text=AMD+Ryzen+5', 'AM5 | 6 Cores 12 Threads | 105W', 1),
(39, 'AMD CPU Ryzen 7 5800X3D Tray', 1, 7300000, 10, 'https://placehold.co/600x600/450a0a/f87171?text=AMD+Ryzen+7', 'AM4 | 8 Cores 16 Threads | 105W', 1),
(40, 'Intel CPU Core i9-13900K Box Chính Hãng (2)', 1, 12500000, 47, 'https://placehold.co/600x600/0f172a/60a5fa?text=Intel+Core+i9', 'LGA1700 | 24 Cores 32 Threads | 125W', 1),
(41, 'AMD CPU Ryzen 9 7950X Nhập Khẩu', 1, 15300000, 39, 'https://placehold.co/600x600/450a0a/f87171?text=AMD+Ryzen+9', 'AM5 | 16 Cores 32 Threads | 170W', 1),
(42, 'AMD CPU Ryzen 7 7800X3D Box Chính Hãng (2)', 1, 10100000, 8, 'https://placehold.co/600x600/450a0a/f87171?text=AMD+Ryzen+7', 'AM5 | 8 Cores 16 Threads | 120W', 1),
(43, 'Intel CPU Core i7-12700K Nhập Khẩu', 1, 7900000, 18, 'https://placehold.co/600x600/0f172a/60a5fa?text=Intel+Core+i7', 'LGA1700 | 12 Cores 20 Threads | 125W', 1),
(44, 'Intel CPU Core i5-10400F Box Fullbox', 1, 2300000, 22, 'https://placehold.co/600x600/0f172a/60a5fa?text=Intel+Core+i5', 'LGA1200 | 6 Cores 12 Threads | 65W', 1),
(45, 'AMD CPU Ryzen 7 7800X3D Box Chính Hãng (3)', 1, 10100000, 19, 'https://placehold.co/600x600/450a0a/f87171?text=AMD+Ryzen+7', 'AM5 | 8 Cores 16 Threads | 120W', 1),
(46, 'AMD CPU Ryzen 9 7900X Box Fullbox (3)', 1, 11400000, 37, 'https://placehold.co/600x600/450a0a/f87171?text=AMD+Ryzen+9', 'AM5 | 12 Cores 24 Threads | 170W', 1),
(47, 'AMD CPU Ryzen 7 7800X3D Tray', 1, 10400000, 5, 'https://placehold.co/600x600/450a0a/f87171?text=AMD+Ryzen+7', 'AM5 | 8 Cores 16 Threads | 120W', 1),
(48, 'AMD CPU Ryzen 7 5700X Box Fullbox', 1, 4300000, 16, 'https://placehold.co/600x600/450a0a/f87171?text=AMD+Ryzen+7', 'AM4 | 8 Cores 16 Threads | 65W', 1),
(49, 'AMD CPU Ryzen 7 7700X Box Fullbox', 1, 7700000, 27, 'https://placehold.co/600x600/450a0a/f87171?text=AMD+Ryzen+7', 'AM5 | 8 Cores 16 Threads | 105W', 1),
(50, 'AMD CPU Ryzen 7 5800X3D Box Chính Hãng (2)', 1, 7500000, 18, 'https://placehold.co/600x600/450a0a/f87171?text=AMD+Ryzen+7', 'AM4 | 8 Cores 16 Threads | 105W', 1),
(51, 'Mainboard ASRock Phantom Gaming B550M', 2, 2700000, 30, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard', 'Micro-ATX | AM4 | DDR4', 1),
(52, 'Mainboard MSI MAG Mortar H410M', 2, 1400000, 14, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+MSI', 'Micro-ATX | LGA1200 | DDR4', 1),
(53, 'Mainboard ASUS ROG Strix B450M', 2, 1800000, 9, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+ROG', 'Micro-ATX | AM4 | DDR4', 1),
(54, 'Mainboard ASUS TUF Gaming X670E', 2, 7300000, 13, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard', 'ATX | AM5 | DDR5', 1),
(55, 'Mainboard ASRock Phantom Gaming H610M', 2, 1500000, 41, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard', 'Micro-ATX | LGA1700 | DDR4', 1),
(56, 'Mainboard ASUS TUF Gaming B650M', 2, 4400000, 42, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard', 'Micro-ATX | AM5 | DDR5', 1),
(57, 'Mainboard ASUS TUF Gaming Z790', 2, 6800000, 18, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard', 'Mini-ITX | LGA1700 | DDR5', 1),
(58, 'Mainboard ASUS TUF Gaming A620M', 2, 2300000, 12, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard', 'Micro-ATX | AM5 | DDR5', 1),
(59, 'Mainboard ASUS PRIME X670E', 2, 7200000, 24, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard', 'Mini-ITX | AM5 | DDR5', 1),
(60, 'Mainboard ASUS PRIME A620M', 2, 1900000, 32, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard', 'Micro-ATX | AM5 | DDR5', 1),
(61, 'Mainboard ASUS ROG Strix Z790', 2, 6400000, 50, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+ROG', 'Micro-ATX | LGA1700 | DDR5', 1),
(62, 'Mainboard ASUS TUF Gaming B660M', 2, 3000000, 31, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard', 'Micro-ATX | LGA1700 | DDR4', 1),
(63, 'Mainboard MSI MAG Mortar B660M', 2, 2800000, 27, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+MSI', 'Micro-ATX | LGA1700 | DDR4', 1),
(64, 'Mainboard GIGABYTE Aorus Elite Z790', 2, 6400000, 49, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+Gigabyte', 'Mini-ITX | LGA1700 | DDR5', 1),
(65, 'Mainboard MSI PRO B450M', 2, 1800000, 46, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+MSI', 'Micro-ATX | AM4 | DDR4', 1),
(66, 'Mainboard GIGABYTE Aorus Elite A620M', 2, 2100000, 50, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+Gigabyte', 'Micro-ATX | AM5 | DDR5', 1),
(67, 'Mainboard MSI PRO X670E', 2, 7700000, 19, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+MSI', 'Micro-ATX | AM5 | DDR5', 1),
(68, 'Mainboard GIGABYTE Aorus Elite X670E', 2, 7500000, 39, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+Gigabyte', 'ATX | AM5 | DDR5', 1),
(69, 'Mainboard MSI MAG Mortar B550M', 2, 2400000, 11, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+MSI', 'Micro-ATX | AM4 | DDR4', 1),
(70, 'Mainboard ASUS TUF Gaming B560M', 2, 2300000, 34, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard', 'Micro-ATX | LGA1200 | DDR4', 1),
(71, 'Mainboard ASUS TUF Gaming H410M', 2, 1100000, 8, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard', 'Micro-ATX | LGA1200 | DDR4', 1),
(72, 'Mainboard MSI PRO X570', 2, 4000000, 12, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+MSI', 'Micro-ATX | AM4 | DDR4', 1),
(73, 'Mainboard ASRock Phantom Gaming Z790', 2, 6500000, 40, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard', 'Mini-ITX | LGA1700 | DDR5', 1),
(74, 'Mainboard ASUS ROG Strix A620M', 2, 1900000, 40, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+ROG', 'Micro-ATX | AM5 | DDR5', 1),
(75, 'Mainboard MSI PRO X670E (2)', 2, 7300000, 14, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+MSI', 'Micro-ATX | AM5 | DDR5', 1),
(76, 'Mainboard ASUS ROG Strix X570', 2, 4000000, 21, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+ROG', 'Mini-ITX | AM4 | DDR4', 1),
(77, 'Mainboard MSI PRO A620M', 2, 2300000, 13, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+MSI', 'Micro-ATX | AM5 | DDR5', 1),
(78, 'Mainboard ASUS ROG Strix B650M', 2, 4300000, 31, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+ROG', 'Micro-ATX | AM5 | DDR5', 1),
(79, 'Mainboard ASUS ROG Strix B550M', 2, 2700000, 11, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+ROG', 'Micro-ATX | AM4 | DDR4', 1),
(80, 'Mainboard ASUS ROG Strix B660M', 2, 2900000, 10, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+ROG', 'Micro-ATX | LGA1700 | DDR4', 1),
(81, 'Mainboard ASUS PRIME B760M', 2, 3500000, 41, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard', 'Micro-ATX | LGA1700 | DDR5', 1),
(82, 'Mainboard GIGABYTE Aorus Elite B550M', 2, 2700000, 47, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+Gigabyte', 'Micro-ATX | AM4 | DDR4', 1),
(83, 'Mainboard ASUS PRIME B660M', 2, 2500000, 24, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard', 'Micro-ATX | LGA1700 | DDR4', 1),
(84, 'Mainboard ASUS TUF Gaming H610M', 2, 1700000, 12, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard', 'Micro-ATX | LGA1700 | DDR4', 1),
(85, 'Mainboard ASUS ROG Strix H610M', 2, 1900000, 5, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+ROG', 'Micro-ATX | LGA1700 | DDR4', 1),
(86, 'Mainboard ASUS ROG Strix B760M', 2, 3400000, 50, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+ROG', 'Micro-ATX | LGA1700 | DDR5', 1),
(87, 'Mainboard ASUS TUF Gaming X570', 2, 3700000, 7, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard', 'Mini-ITX | AM4 | DDR4', 1),
(88, 'Mainboard ASRock Phantom Gaming B660M', 2, 2800000, 20, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard', 'Micro-ATX | LGA1700 | DDR4', 1),
(89, 'Mainboard ASUS TUF Gaming B550M', 2, 2300000, 8, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard', 'Micro-ATX | AM4 | DDR4', 1),
(90, 'Mainboard MSI PRO B650M', 2, 3900000, 18, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+MSI', 'Micro-ATX | AM5 | DDR5', 1),
(91, 'Mainboard GIGABYTE Aorus Elite B760M', 2, 3400000, 7, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+Gigabyte', 'Micro-ATX | LGA1700 | DDR5', 1),
(92, 'Mainboard MSI MAG Mortar B760M', 2, 3500000, 14, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+MSI', 'Micro-ATX | LGA1700 | DDR5', 1),
(93, 'Mainboard MSI PRO H410M', 2, 1200000, 39, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+MSI', 'Micro-ATX | LGA1200 | DDR4', 1),
(94, 'Mainboard ASUS PRIME Z790', 2, 6600000, 50, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard', 'Mini-ITX | LGA1700 | DDR5', 1),
(95, 'Mainboard ASUS ROG Strix Z790 (2)', 2, 6700000, 45, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+ROG', 'ATX | LGA1700 | DDR5', 1),
(96, 'Mainboard MSI MAG Mortar B450M', 2, 1700000, 36, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+MSI', 'Micro-ATX | AM4 | DDR4', 1),
(97, 'Mainboard ASUS TUF Gaming B560M (2)', 2, 2300000, 25, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard', 'Micro-ATX | LGA1200 | DDR4', 1),
(98, 'Mainboard ASUS PRIME B760M (2)', 2, 3300000, 10, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard', 'Micro-ATX | LGA1700 | DDR5', 1),
(99, 'Mainboard GIGABYTE Aorus Elite X670E (2)', 2, 7300000, 31, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+Gigabyte', 'Mini-ITX | AM5 | DDR5', 1),
(100, 'Mainboard ASUS ROG Strix A620M (2)', 2, 1900000, 35, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+ROG', 'Micro-ATX | AM5 | DDR5', 1),
(101, 'RAM Corsair Vengeance 8GB 3200MHz', 3, 350000, 12, 'https://placehold.co/600x600/1f2937/fcd34d?text=Corsair+RAM', '8GB (1x8GB) DDR4 3200MHz', 1),
(102, 'RAM Kingston Fury Beast 16GB 4800MHz', 3, 1100000, 40, 'https://placehold.co/600x600/1f2937/ef4444?text=Kingston+RAM', '16GB (1x16GB) DDR5 4800MHz', 1),
(103, 'RAM Kingston Fury Beast 64GB 6000MHz', 3, 5700000, 25, 'https://placehold.co/600x600/1f2937/ef4444?text=Kingston+RAM', '64GB (2x32GB) DDR5 6000MHz', 1),
(104, 'RAM Corsair Vengeance RGB 32GB 3600MHz', 3, 1800000, 42, 'https://placehold.co/600x600/1f2937/fcd34d?text=Corsair+RAM', '32GB (2x16GB) DDR4 3600MHz', 1),
(105, 'RAM PNY XLR8 RGB 32GB 6000MHz', 3, 3000000, 21, 'https://placehold.co/600x600/1f2937/cbd5e1?text=DDR+RAM', '32GB (2x16GB) DDR5 6000MHz', 1),
(106, 'RAM Teamgroup T-Force Delta 32GB 5600MHz', 3, 2300000, 11, 'https://placehold.co/600x600/1f2937/cbd5e1?text=DDR+RAM', '32GB (2x16GB) DDR5 5600MHz', 1),
(107, 'RAM G.Skill Trident Z RGB 32GB 6000MHz', 3, 3000000, 42, 'https://placehold.co/600x600/1f2937/cbd5e1?text=G.Skill+RAM', '32GB (2x16GB) DDR5 6000MHz', 1),
(108, 'RAM Kingston Fury Beast ARGB 8GB 3200MHz', 3, 650000, 28, 'https://placehold.co/600x600/1f2937/ef4444?text=Kingston+RAM', '8GB (1x8GB) DDR4 3200MHz', 1),
(109, 'RAM PNY XLR8 RGB 32GB 5600MHz', 3, 2200000, 29, 'https://placehold.co/600x600/1f2937/cbd5e1?text=DDR+RAM', '32GB (2x16GB) DDR5 5600MHz', 1),
(110, 'RAM Teamgroup T-Force Delta 64GB 6000MHz', 3, 5400000, 6, 'https://placehold.co/600x600/1f2937/cbd5e1?text=DDR+RAM', '64GB (2x32GB) DDR5 6000MHz', 1),
(111, 'RAM Corsair Vengeance 64GB 6000MHz', 3, 5600000, 27, 'https://placehold.co/600x600/1f2937/fcd34d?text=Corsair+RAM', '64GB (2x32GB) DDR5 6000MHz', 1),
(112, 'RAM Corsair Vengeance ARGB 64GB 6000MHz', 3, 5700000, 39, 'https://placehold.co/600x600/1f2937/fcd34d?text=Corsair+RAM', '64GB (2x32GB) DDR5 6000MHz', 1),
(113, 'RAM Teamgroup T-Force Delta RGB 32GB 6000MHz', 3, 3000000, 37, 'https://placehold.co/600x600/1f2937/cbd5e1?text=DDR+RAM', '32GB (2x16GB) DDR5 6000MHz', 1),
(114, 'RAM Adata XPG Lancer RGB 16GB 3200MHz', 3, 950000, 15, 'https://placehold.co/600x600/1f2937/cbd5e1?text=DDR+RAM', '16GB (2x8GB) DDR4 3200MHz', 1),
(115, 'RAM Kingston Fury Beast RGB 32GB 5600MHz', 3, 2000000, 11, 'https://placehold.co/600x600/1f2937/ef4444?text=Kingston+RAM', '32GB (2x16GB) DDR5 5600MHz', 1),
(116, 'RAM Kingston Fury Beast 16GB 3200MHz', 3, 1150000, 32, 'https://placehold.co/600x600/1f2937/ef4444?text=Kingston+RAM', '16GB (2x8GB) DDR4 3200MHz', 1),
(117, 'RAM Adata XPG Lancer 32GB 5600MHz', 3, 2100000, 7, 'https://placehold.co/600x600/1f2937/cbd5e1?text=DDR+RAM', '32GB (2x16GB) DDR5 5600MHz', 1),
(118, 'RAM PNY XLR8 ARGB 16GB 4800MHz', 3, 1100000, 35, 'https://placehold.co/600x600/1f2937/cbd5e1?text=DDR+RAM', '16GB (1x16GB) DDR5 4800MHz', 1),
(119, 'RAM Kingston Fury Beast 32GB 5600MHz', 3, 2200000, 30, 'https://placehold.co/600x600/1f2937/ef4444?text=Kingston+RAM', '32GB (2x16GB) DDR5 5600MHz', 1),
(120, 'RAM Corsair Vengeance 8GB 3200MHz (2)', 3, 350000, 43, 'https://placehold.co/600x600/1f2937/fcd34d?text=Corsair+RAM', '8GB (1x8GB) DDR4 3200MHz', 1),
(121, 'RAM Kingston Fury Beast 32GB 6000MHz', 3, 3000000, 28, 'https://placehold.co/600x600/1f2937/ef4444?text=Kingston+RAM', '32GB (2x16GB) DDR5 6000MHz', 1),
(122, 'RAM PNY XLR8 ARGB 8GB 3200MHz', 3, 650000, 20, 'https://placehold.co/600x600/1f2937/cbd5e1?text=DDR+RAM', '8GB (1x8GB) DDR4 3200MHz', 1),
(123, 'RAM Corsair Vengeance ARGB 16GB 3200MHz', 3, 850000, 50, 'https://placehold.co/600x600/1f2937/fcd34d?text=Corsair+RAM', '16GB (2x8GB) DDR4 3200MHz', 1),
(124, 'RAM G.Skill Trident Z RGB 32GB 6000MHz (2)', 3, 2900000, 24, 'https://placehold.co/600x600/1f2937/cbd5e1?text=G.Skill+RAM', '32GB (2x16GB) DDR5 6000MHz', 1),
(125, 'RAM Corsair Vengeance ARGB 32GB 6000MHz', 3, 3100000, 10, 'https://placehold.co/600x600/1f2937/fcd34d?text=Corsair+RAM', '32GB (2x16GB) DDR5 6000MHz', 1),
(126, 'RAM Kingston Fury Beast 8GB 3200MHz', 3, 350000, 5, 'https://placehold.co/600x600/1f2937/ef4444?text=Kingston+RAM', '8GB (1x8GB) DDR4 3200MHz', 1),
(127, 'RAM Teamgroup T-Force Delta 32GB 3600MHz', 3, 2000000, 38, 'https://placehold.co/600x600/1f2937/cbd5e1?text=DDR+RAM', '32GB (2x16GB) DDR4 3600MHz', 1),
(128, 'RAM G.Skill Trident Z ARGB 32GB 3600MHz', 3, 1800000, 31, 'https://placehold.co/600x600/1f2937/cbd5e1?text=G.Skill+RAM', '32GB (2x16GB) DDR4 3600MHz', 1),
(129, 'RAM Kingston Fury Beast RGB 32GB 6000MHz', 3, 3000000, 49, 'https://placehold.co/600x600/1f2937/ef4444?text=Kingston+RAM', '32GB (2x16GB) DDR5 6000MHz', 1),
(130, 'RAM G.Skill Trident Z ARGB 16GB 3200MHz', 3, 1150000, 46, 'https://placehold.co/600x600/1f2937/cbd5e1?text=G.Skill+RAM', '16GB (2x8GB) DDR4 3200MHz', 1),
(131, 'RAM G.Skill Trident Z ARGB 16GB 4800MHz', 3, 1000000, 49, 'https://placehold.co/600x600/1f2937/cbd5e1?text=G.Skill+RAM', '16GB (1x16GB) DDR5 4800MHz', 1),
(132, 'RAM PNY XLR8 ARGB 64GB 6000MHz', 3, 5700000, 18, 'https://placehold.co/600x600/1f2937/cbd5e1?text=DDR+RAM', '64GB (2x32GB) DDR5 6000MHz', 1),
(133, 'RAM Teamgroup T-Force Delta RGB 32GB 5600MHz', 3, 2100000, 42, 'https://placehold.co/600x600/1f2937/cbd5e1?text=DDR+RAM', '32GB (2x16GB) DDR5 5600MHz', 1),
(134, 'RAM Kingston Fury Beast ARGB 16GB 4800MHz', 3, 1200000, 22, 'https://placehold.co/600x600/1f2937/ef4444?text=Kingston+RAM', '16GB (1x16GB) DDR5 4800MHz', 1),
(135, 'RAM G.Skill Trident Z 32GB 5600MHz', 3, 2200000, 50, 'https://placehold.co/600x600/1f2937/cbd5e1?text=G.Skill+RAM', '32GB (2x16GB) DDR5 5600MHz', 1),
(136, 'RAM Teamgroup T-Force Delta ARGB 16GB 3200MHz', 3, 1050000, 40, 'https://placehold.co/600x600/1f2937/cbd5e1?text=DDR+RAM', '16GB (2x8GB) DDR4 3200MHz', 1),
(137, 'RAM Teamgroup T-Force Delta 16GB 3200MHz', 3, 950000, 34, 'https://placehold.co/600x600/1f2937/cbd5e1?text=DDR+RAM', '16GB (2x8GB) DDR4 3200MHz', 1),
(138, 'RAM Adata XPG Lancer 64GB 6000MHz', 3, 5700000, 8, 'https://placehold.co/600x600/1f2937/cbd5e1?text=DDR+RAM', '64GB (2x32GB) DDR5 6000MHz', 1),
(139, 'RAM Adata XPG Lancer RGB 32GB 3600MHz', 3, 1900000, 48, 'https://placehold.co/600x600/1f2937/cbd5e1?text=DDR+RAM', '32GB (2x16GB) DDR4 3600MHz', 1),
(140, 'RAM G.Skill Trident Z RGB 32GB 5600MHz', 3, 2300000, 49, 'https://placehold.co/600x600/1f2937/cbd5e1?text=G.Skill+RAM', '32GB (2x16GB) DDR5 5600MHz', 1),
(141, 'RAM Teamgroup T-Force Delta 16GB 4800MHz', 3, 1200000, 24, 'https://placehold.co/600x600/1f2937/cbd5e1?text=DDR+RAM', '16GB (1x16GB) DDR5 4800MHz', 1),
(142, 'RAM Adata XPG Lancer 32GB 6000MHz', 3, 2900000, 44, 'https://placehold.co/600x600/1f2937/cbd5e1?text=DDR+RAM', '32GB (2x16GB) DDR5 6000MHz', 1),
(143, 'RAM PNY XLR8 RGB 16GB 3200MHz', 3, 1050000, 24, 'https://placehold.co/600x600/1f2937/cbd5e1?text=DDR+RAM', '16GB (2x8GB) DDR4 3200MHz', 1),
(144, 'RAM Teamgroup T-Force Delta ARGB 16GB 4800MHz', 3, 1000000, 30, 'https://placehold.co/600x600/1f2937/cbd5e1?text=DDR+RAM', '16GB (1x16GB) DDR5 4800MHz', 1),
(145, 'RAM Teamgroup T-Force Delta ARGB 32GB 5600MHz', 3, 2300000, 13, 'https://placehold.co/600x600/1f2937/cbd5e1?text=DDR+RAM', '32GB (2x16GB) DDR5 5600MHz', 1),
(146, 'RAM Adata XPG Lancer 8GB 3200MHz', 3, 350000, 39, 'https://placehold.co/600x600/1f2937/cbd5e1?text=DDR+RAM', '8GB (1x8GB) DDR4 3200MHz', 1),
(147, 'RAM G.Skill Trident Z 32GB 3600MHz', 3, 1800000, 5, 'https://placehold.co/600x600/1f2937/cbd5e1?text=G.Skill+RAM', '32GB (2x16GB) DDR4 3600MHz', 1),
(148, 'RAM Corsair Vengeance RGB 32GB 6000MHz', 3, 2900000, 29, 'https://placehold.co/600x600/1f2937/fcd34d?text=Corsair+RAM', '32GB (2x16GB) DDR5 6000MHz', 1),
(149, 'RAM Teamgroup T-Force Delta ARGB 8GB 3200MHz', 3, 550000, 27, 'https://placehold.co/600x600/1f2937/cbd5e1?text=DDR+RAM', '8GB (1x8GB) DDR4 3200MHz', 1),
(150, 'RAM Kingston Fury Beast ARGB 16GB 4800MHz (2)', 3, 1200000, 9, 'https://placehold.co/600x600/1f2937/ef4444?text=Kingston+RAM', '16GB (1x16GB) DDR5 4800MHz', 1),
(151, 'Card Màn Hình MSI Ventus 2X RTX 3070 Ti 8GB', 4, 11100000, 23, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+MSI', '3070 | TDP: 290W', 1),
(152, 'Card Màn Hình MSI Ventus 2X RX 6700 XT 12GB White OC', 4, 9900000, 23, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+MSI', '6700 | TDP: 230W', 1),
(153, 'Card Màn Hình MSI Ventus 2X GTX 1650 4GB OC Edition', 4, 2800000, 24, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+MSI', '1650 | TDP: 75W', 1),
(154, 'Card Màn Hình GIGABYTE Windforce RTX 4060 8GB White OC', 4, 8100000, 34, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+Gigabyte', '4060 | TDP: 115W', 1),
(155, 'Card Màn Hình ASUS Dual RX 6600 8GB OC', 4, 4800000, 23, 'https://placehold.co/600x600/450a0a/fca5a5?text=Radeon+RX', '6600 | TDP: 132W', 1),
(156, 'Card Màn Hình ZOTAC Gaming Twin Edge RX 7800 XT 16GB White OC', 4, 14000000, 5, 'https://placehold.co/600x600/450a0a/fca5a5?text=Radeon+RX', '7800 | TDP: 263W', 1),
(157, 'Card Màn Hình ASUS ROG Strix RX 6600 8GB OC', 4, 5700000, 13, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+ROG', '6600 | TDP: 132W', 1),
(158, 'Card Màn Hình MSI Gaming X Trio RX 6600 8GB', 4, 4800000, 37, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+MSI', '6600 | TDP: 132W', 1),
(159, 'Card Màn Hình GIGABYTE Windforce RTX 3060 12GB OC Edition', 4, 7200000, 36, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+Gigabyte', '3060 | TDP: 170W', 1),
(160, 'Card Màn Hình ASUS Dual RTX 3050 8GB OC', 4, 5900000, 30, 'https://placehold.co/600x600/14532d/86efac?text=GeForce+RTX+3000', '3050 | TDP: 130W', 1),
(161, 'Card Màn Hình ASUS ROG Strix RTX 4060 Ti 16GB', 4, 11800000, 37, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+ROG', '4060 | TDP: 165W', 1),
(162, 'Card Màn Hình MSI Gaming X Trio RX 7800 XT 16GB OC', 4, 14300000, 9, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+MSI', '7800 | TDP: 263W', 1),
(163, 'Card Màn Hình ZOTAC Gaming Twin Edge RTX 4060 8GB', 4, 8600000, 35, 'https://placehold.co/600x600/14532d/86efac?text=GeForce+RTX+4000', '4060 | TDP: 115W', 1),
(164, 'Card Màn Hình ZOTAC Gaming Twin Edge GTX 1650 4GB OC Edition', 4, 3300000, 16, 'https://placehold.co/600x600/14532d/86efac?text=GeForce+GTX', '1650 | TDP: 75W', 1),
(165, 'Card Màn Hình ASUS Dual GTX 1650 4GB OC Edition', 4, 3500000, 49, 'https://placehold.co/600x600/14532d/86efac?text=GeForce+GTX', '1650 | TDP: 75W', 1),
(166, 'Card Màn Hình ASUS ROG Strix RTX 3070 Ti 8GB OC Edition', 4, 11400000, 31, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+ROG', '3070 | TDP: 290W', 1),
(167, 'Card Màn Hình ZOTAC Gaming Twin Edge GTX 1650 4GB OC', 4, 2700000, 16, 'https://placehold.co/600x600/14532d/86efac?text=GeForce+GTX', '1650 | TDP: 75W', 1),
(168, 'Card Màn Hình MSI Ventus 2X RTX 4070 SUPER 12GB White OC', 4, 17300000, 45, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+MSI', '4070 | TDP: 220W', 1),
(169, 'Card Màn Hình MSI Ventus 2X RTX 4060 8GB', 4, 8500000, 9, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+MSI', '4060 | TDP: 115W', 1),
(170, 'Card Màn Hình ASUS ROG Strix GTX 1650 4GB White OC', 4, 3500000, 32, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+ROG', '1650 | TDP: 75W', 1),
(171, 'Card Màn Hình ASUS Dual RTX 3060 12GB', 4, 7700000, 22, 'https://placehold.co/600x600/14532d/86efac?text=GeForce+RTX+3000', '3060 | TDP: 170W', 1),
(172, 'Card Màn Hình ZOTAC Gaming Twin Edge RTX 4070 SUPER 12GB White OC', 4, 17400000, 21, 'https://placehold.co/600x600/14532d/86efac?text=GeForce+RTX+4000', '4070 | TDP: 220W', 1),
(173, 'Card Màn Hình MSI Gaming X Trio RX 6600 8GB (2)', 4, 5700000, 37, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+MSI', '6600 | TDP: 132W', 1),
(174, 'Card Màn Hình MSI Gaming X Trio RX 6600 8GB OC Edition', 4, 5200000, 5, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+MSI', '6600 | TDP: 132W', 1),
(175, 'Card Màn Hình MSI Gaming X Trio RX 6600 8GB OC', 4, 5000000, 34, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+MSI', '6600 | TDP: 132W', 1),
(176, 'Card Màn Hình ASUS ROG Strix RTX 4060 8GB', 4, 8700000, 39, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+ROG', '4060 | TDP: 115W', 1),
(177, 'Card Màn Hình ASUS Dual RX 6600 8GB OC (2)', 4, 5200000, 46, 'https://placehold.co/600x600/450a0a/fca5a5?text=Radeon+RX', '6600 | TDP: 132W', 1),
(178, 'Card Màn Hình MSI Gaming X Trio RTX 4070 SUPER 12GB', 4, 17500000, 50, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+MSI', '4070 | TDP: 220W', 1),
(179, 'Card Màn Hình GIGABYTE Windforce RX 6600 8GB OC Edition', 4, 4800000, 39, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+Gigabyte', '6600 | TDP: 132W', 1),
(180, 'Card Màn Hình ZOTAC Gaming Twin Edge RTX 3050 8GB OC', 4, 6000000, 47, 'https://placehold.co/600x600/14532d/86efac?text=GeForce+RTX+3000', '3050 | TDP: 130W', 1),
(181, 'Card Màn Hình ASUS ROG Strix RTX 4080 SUPER 16GB White OC', 4, 32000000, 8, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+ROG', '4080 | TDP: 320W', 1),
(182, 'Card Màn Hình ASUS ROG Strix RTX 4080 SUPER 16GB OC Edition', 4, 32000000, 41, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+ROG', '4080 | TDP: 320W', 1),
(183, 'Card Màn Hình GIGABYTE Windforce RTX 3050 8GB OC', 4, 5700000, 35, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+Gigabyte', '3050 | TDP: 130W', 1),
(184, 'Card Màn Hình ASUS Dual RTX 3070 Ti 8GB', 4, 11300000, 11, 'https://placehold.co/600x600/14532d/86efac?text=GeForce+RTX+3000', '3070 | TDP: 290W', 1),
(185, 'Card Màn Hình ZOTAC Gaming Twin Edge GTX 1650 4GB White OC', 4, 3300000, 16, 'https://placehold.co/600x600/14532d/86efac?text=GeForce+GTX', '1650 | TDP: 75W', 1),
(186, 'Card Màn Hình MSI Ventus 2X RTX 3070 Ti 8GB White OC', 4, 11400000, 9, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+MSI', '3070 | TDP: 290W', 1),
(187, 'Card Màn Hình ASUS Dual RTX 4060 8GB', 4, 8600000, 41, 'https://placehold.co/600x600/14532d/86efac?text=GeForce+RTX+4000', '4060 | TDP: 115W', 1),
(188, 'Card Màn Hình ASUS Dual RTX 4070 SUPER 12GB White OC', 4, 17400000, 33, 'https://placehold.co/600x600/14532d/86efac?text=GeForce+RTX+4000', '4070 | TDP: 220W', 1),
(189, 'Card Màn Hình ASUS ROG Strix RTX 4060 8GB OC Edition', 4, 8900000, 14, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+ROG', '4060 | TDP: 115W', 1),
(190, 'Card Màn Hình MSI Ventus 2X RX 7800 XT 16GB', 4, 14700000, 37, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+MSI', '7800 | TDP: 263W', 1),
(191, 'Card Màn Hình ASUS ROG Strix RX 7800 XT 16GB', 4, 14900000, 22, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+ROG', '7800 | TDP: 263W', 1),
(192, 'Card Màn Hình MSI Gaming X Trio RTX 4060 8GB OC Edition', 4, 8900000, 22, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+MSI', '4060 | TDP: 115W', 1),
(193, 'Card Màn Hình MSI Gaming X Trio RTX 4060 Ti 16GB White OC', 4, 11600000, 7, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+MSI', '4060 | TDP: 165W', 1),
(194, 'Card Màn Hình ZOTAC Gaming Twin Edge RTX 4060 8GB White OC', 4, 8100000, 15, 'https://placehold.co/600x600/14532d/86efac?text=GeForce+RTX+4000', '4060 | TDP: 115W', 1),
(195, 'Card Màn Hình ASUS ROG Strix RX 6700 XT 12GB White OC', 4, 9700000, 36, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+ROG', '6700 | TDP: 230W', 1),
(196, 'Card Màn Hình ASUS Dual RX 7800 XT 16GB OC', 4, 14700000, 18, 'https://placehold.co/600x600/450a0a/fca5a5?text=Radeon+RX', '7800 | TDP: 263W', 1),
(197, 'Card Màn Hình MSI Gaming X Trio RX 6600 8GB OC Edition (2)', 4, 5000000, 7, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+MSI', '6600 | TDP: 132W', 1),
(198, 'Card Màn Hình ASUS Dual RTX 3050 8GB White OC', 4, 5400000, 16, 'https://placehold.co/600x600/14532d/86efac?text=GeForce+RTX+3000', '3050 | TDP: 130W', 1),
(199, 'Card Màn Hình MSI Gaming X Trio RTX 3070 Ti 8GB White OC', 4, 10800000, 31, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+MSI', '3070 | TDP: 290W', 1),
(200, 'Card Màn Hình MSI Gaming X Trio RX 6700 XT 12GB', 4, 9300000, 23, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+MSI', '6700 | TDP: 230W', 1),
(201, 'Nguồn Cooler Master 450W 80 Plus White', 5, 750000, 38, 'https://placehold.co/600x600/27272a/fde047?text=Power+Supply', '450W | 80 Plus White', 1),
(202, 'Nguồn SeaSonic 1200W 80 Plus Titanium', 5, 7600000, 21, 'https://placehold.co/600x600/27272a/fde047?text=Power+Supply', '1200W | 80 Plus Titanium', 1),
(203, 'Nguồn MSI MAG 550W 80 Plus Bronze', 5, 1000000, 16, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+MSI', '550W | 80 Plus Bronze', 1),
(204, 'Nguồn SeaSonic 550W 80 Plus Bronze', 5, 1050000, 32, 'https://placehold.co/600x600/27272a/fde047?text=Power+Supply', '550W | 80 Plus Bronze', 1),
(205, 'Nguồn Cooler Master 450W 80 Plus White (2)', 5, 750000, 37, 'https://placehold.co/600x600/27272a/fde047?text=Power+Supply', '450W | 80 Plus White', 1),
(206, 'Nguồn MSI MAG 450W 80 Plus White', 5, 600000, 31, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+MSI', '450W | 80 Plus White', 1),
(207, 'Nguồn Deepcool 850W 80 Plus Gold ATX 3.0', 5, 3150000, 5, 'https://placehold.co/600x600/27272a/fde047?text=Power+Supply', '850W | 80 Plus Gold ATX 3.0', 1),
(208, 'Nguồn Corsair 450W 80 Plus White', 5, 650000, 36, 'https://placehold.co/600x600/1f2937/fcd34d?text=Corsair+RAM', '450W | 80 Plus White', 1),
(209, 'Nguồn Antec 650W 80 Plus Bronze Full Modular', 5, 1400000, 14, 'https://placehold.co/600x600/27272a/fde047?text=Power+Supply', '650W | 80 Plus Bronze Full Modular', 1),
(210, 'Nguồn Xigmatek 750W 80 Plus Gold', 5, 2150000, 21, 'https://placehold.co/600x600/27272a/fde047?text=Power+Supply', '750W | 80 Plus Gold', 1),
(211, 'Nguồn Xigmatek 450W 80 Plus White', 5, 700000, 21, 'https://placehold.co/600x600/27272a/fde047?text=Power+Supply', '450W | 80 Plus White', 1),
(212, 'Nguồn Deepcool 450W 80 Plus White', 5, 700000, 8, 'https://placehold.co/600x600/27272a/fde047?text=Power+Supply', '450W | 80 Plus White', 1),
(213, 'Nguồn Corsair 1200W 80 Plus Titanium', 5, 7600000, 40, 'https://placehold.co/600x600/1f2937/fcd34d?text=Corsair+RAM', '1200W | 80 Plus Titanium', 1),
(214, 'Nguồn MSI MAG 1000W 80 Plus Platinum', 5, 4450000, 45, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+MSI', '1000W | 80 Plus Platinum', 1),
(215, 'Nguồn SeaSonic 450W 80 Plus White', 5, 750000, 38, 'https://placehold.co/600x600/27272a/fde047?text=Power+Supply', '450W | 80 Plus White', 1),
(216, 'Nguồn SeaSonic 650W 80 Plus Bronze Full Modular', 5, 1500000, 15, 'https://placehold.co/600x600/27272a/fde047?text=Power+Supply', '650W | 80 Plus Bronze Full Modular', 1),
(217, 'Nguồn Xigmatek 1200W 80 Plus Titanium', 5, 7600000, 45, 'https://placehold.co/600x600/27272a/fde047?text=Power+Supply', '1200W | 80 Plus Titanium', 1),
(218, 'Nguồn Xigmatek 650W 80 Plus Bronze Full Modular', 5, 1500000, 44, 'https://placehold.co/600x600/27272a/fde047?text=Power+Supply', '650W | 80 Plus Bronze Full Modular', 1),
(219, 'Nguồn MSI MAG 650W 80 Plus Bronze Full Modular', 5, 1500000, 28, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+MSI', '650W | 80 Plus Bronze Full Modular', 1),
(220, 'Nguồn Corsair 1000W 80 Plus Platinum', 5, 4450000, 23, 'https://placehold.co/600x600/1f2937/fcd34d?text=Corsair+RAM', '1000W | 80 Plus Platinum', 1),
(221, 'Nguồn Deepcool 1000W 80 Plus Platinum', 5, 4500000, 31, 'https://placehold.co/600x600/27272a/fde047?text=Power+Supply', '1000W | 80 Plus Platinum', 1),
(222, 'Nguồn Cooler Master 450W 80 Plus White (3)', 5, 700000, 16, 'https://placehold.co/600x600/27272a/fde047?text=Power+Supply', '450W | 80 Plus White', 1),
(223, 'Nguồn Corsair 850W 80 Plus Gold ATX 3.0', 5, 3200000, 25, 'https://placehold.co/600x600/1f2937/fcd34d?text=Corsair+RAM', '850W | 80 Plus Gold ATX 3.0', 1),
(224, 'Nguồn Deepcool 650W 80 Plus Bronze Full Modular', 5, 1400000, 23, 'https://placehold.co/600x600/27272a/fde047?text=Power+Supply', '650W | 80 Plus Bronze Full Modular', 1),
(225, 'Nguồn Corsair 550W 80 Plus Bronze', 5, 900000, 28, 'https://placehold.co/600x600/1f2937/fcd34d?text=Corsair+RAM', '550W | 80 Plus Bronze', 1),
(226, 'Nguồn Antec 850W 80 Plus Gold ATX 3.0', 5, 3100000, 48, 'https://placehold.co/600x600/27272a/fde047?text=Power+Supply', '850W | 80 Plus Gold ATX 3.0', 1),
(227, 'Nguồn MSI MAG 850W 80 Plus Gold ATX 3.0', 5, 3050000, 46, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+MSI', '850W | 80 Plus Gold ATX 3.0', 1),
(228, 'Nguồn Cooler Master 1000W 80 Plus Platinum', 5, 4450000, 38, 'https://placehold.co/600x600/27272a/fde047?text=Power+Supply', '1000W | 80 Plus Platinum', 1),
(229, 'Nguồn Cooler Master 650W 80 Plus Bronze Full Modular', 5, 1500000, 39, 'https://placehold.co/600x600/27272a/fde047?text=Power+Supply', '650W | 80 Plus Bronze Full Modular', 1),
(230, 'Nguồn Cooler Master 550W 80 Plus Bronze', 5, 1000000, 36, 'https://placehold.co/600x600/27272a/fde047?text=Power+Supply', '550W | 80 Plus Bronze', 1),
(231, 'Nguồn Deepcool 550W 80 Plus Bronze', 5, 1050000, 49, 'https://placehold.co/600x600/27272a/fde047?text=Power+Supply', '550W | 80 Plus Bronze', 1),
(232, 'Nguồn MSI MAG 850W 80 Plus Gold ATX 3.0 (2)', 5, 3200000, 30, 'https://placehold.co/600x600/1e293b/cbd5e1?text=Mainboard+MSI', '850W | 80 Plus Gold ATX 3.0', 1),
(233, 'Nguồn Xigmatek 750W 80 Plus Gold (2)', 5, 2150000, 49, 'https://placehold.co/600x600/27272a/fde047?text=Power+Supply', '750W | 80 Plus Gold', 1),
(234, 'Nguồn Cooler Master 450W 80 Plus White (4)', 5, 650000, 30, 'https://placehold.co/600x600/27272a/fde047?text=Power+Supply', '450W | 80 Plus White', 1),
(235, 'Nguồn Cooler Master 1000W 80 Plus Platinum (2)', 5, 4450000, 39, 'https://placehold.co/600x600/27272a/fde047?text=Power+Supply', '1000W | 80 Plus Platinum', 1),
(236, 'Nguồn Corsair 650W 80 Plus Bronze Full Modular', 5, 1450000, 28, 'https://placehold.co/600x600/1f2937/fcd34d?text=Corsair+RAM', '650W | 80 Plus Bronze Full Modular', 1),
(237, 'Nguồn Xigmatek 850W 80 Plus Gold ATX 3.0', 5, 3100000, 37, 'https://placehold.co/600x600/27272a/fde047?text=Power+Supply', '850W | 80 Plus Gold ATX 3.0', 1),
(238, 'Nguồn SeaSonic 750W 80 Plus Gold', 5, 2050000, 49, 'https://placehold.co/600x600/27272a/fde047?text=Power+Supply', '750W | 80 Plus Gold', 1),
(239, 'Nguồn Xigmatek 1200W 80 Plus Titanium (2)', 5, 7600000, 45, 'https://placehold.co/600x600/27272a/fde047?text=Power+Supply', '1200W | 80 Plus Titanium', 1),
(240, 'Nguồn Deepcool 650W 80 Plus Bronze Full Modular (2)', 5, 1450000, 13, 'https://placehold.co/600x600/27272a/fde047?text=Power+Supply', '650W | 80 Plus Bronze Full Modular', 1),
(241, 'Nguồn Cooler Master 550W 80 Plus Bronze (2)', 5, 950000, 30, 'https://placehold.co/600x600/27272a/fde047?text=Power+Supply', '550W | 80 Plus Bronze', 1),
(242, 'Nguồn Corsair 750W 80 Plus Gold', 5, 2200000, 13, 'https://placehold.co/600x600/1f2937/fcd34d?text=Corsair+RAM', '750W | 80 Plus Gold', 1),
(243, 'Nguồn Cooler Master 650W 80 Plus Bronze Full Modular (2)', 5, 1500000, 39, 'https://placehold.co/600x600/27272a/fde047?text=Power+Supply', '650W | 80 Plus Bronze Full Modular', 1),
(244, 'Nguồn Corsair 850W 80 Plus Gold ATX 3.0 (2)', 5, 3100000, 29, 'https://placehold.co/600x600/1f2937/fcd34d?text=Corsair+RAM', '850W | 80 Plus Gold ATX 3.0', 1),
(245, 'Nguồn SeaSonic 1000W 80 Plus Platinum', 5, 4550000, 46, 'https://placehold.co/600x600/27272a/fde047?text=Power+Supply', '1000W | 80 Plus Platinum', 1),
(246, 'Nguồn SeaSonic 550W 80 Plus Bronze (2)', 5, 900000, 17, 'https://placehold.co/600x600/27272a/fde047?text=Power+Supply', '550W | 80 Plus Bronze', 1),
(247, 'Nguồn Xigmatek 550W 80 Plus Bronze', 5, 900000, 7, 'https://placehold.co/600x600/27272a/fde047?text=Power+Supply', '550W | 80 Plus Bronze', 1),
(248, 'Nguồn Xigmatek 750W 80 Plus Gold (3)', 5, 2150000, 23, 'https://placehold.co/600x600/27272a/fde047?text=Power+Supply', '750W | 80 Plus Gold', 1),
(249, 'Nguồn SeaSonic 1000W 80 Plus Platinum (2)', 5, 4550000, 25, 'https://placehold.co/600x600/27272a/fde047?text=Power+Supply', '1000W | 80 Plus Platinum', 1),
(250, 'Nguồn Xigmatek 1200W 80 Plus Titanium (3)', 5, 7500000, 47, 'https://placehold.co/600x600/27272a/fde047?text=Power+Supply', '1200W | 80 Plus Titanium', 1),
(251, 'Vỏ Case Montech Air White', 6, 3200000, 17, 'https://placehold.co/600x600/18181b/ffffff?text=PC+Case', 'Hỗ trợ: Full Tower ATX | Màu: White | Kèm Fan: 2', 1),
(252, 'Vỏ Case Corsair 4000D Pink', 6, 3300000, 31, 'https://placehold.co/600x600/1f2937/fcd34d?text=Corsair+RAM', 'Hỗ trợ: Micro-ATX Mini Tower | Màu: Pink | Kèm Fan: 0', 1),
(253, 'Vỏ Case MIK Crusher Black', 6, 1100000, 40, 'https://placehold.co/600x600/18181b/ffffff?text=PC+Case', 'Hỗ trợ: ATX Mid Tower | Màu: Black | Kèm Fan: 2', 1),
(254, 'Vỏ Case MIK Crusher Gray', 6, 2700000, 36, 'https://placehold.co/600x600/18181b/ffffff?text=PC+Case', 'Hỗ trợ: ATX Mid Tower | Màu: Gray | Kèm Fan: 0', 1),
(255, 'Vỏ Case Xigmatek Windmill White', 6, 3900000, 24, 'https://placehold.co/600x600/18181b/ffffff?text=PC+Case', 'Hỗ trợ: Full Tower ATX | Màu: White | Kèm Fan: 1', 1),
(256, 'Vỏ Case Corsair 4000D White', 6, 3400000, 17, 'https://placehold.co/600x600/1f2937/fcd34d?text=Corsair+RAM', 'Hỗ trợ: Mini-ITX Desktop | Màu: White | Kèm Fan: 2', 1),
(257, 'Vỏ Case NZXT H510 White', 6, 3200000, 49, 'https://placehold.co/600x600/18181b/ffffff?text=Case+NZXT', 'Hỗ trợ: Mini-ITX Desktop | Màu: White | Kèm Fan: 0', 1),
(258, 'Vỏ Case Lian Li Lancool Gray', 6, 800000, 28, 'https://placehold.co/600x600/18181b/ffffff?text=PC+Case', 'Hỗ trợ: ATX Mid Tower | Màu: Gray | Kèm Fan: 2', 1),
(259, 'Vỏ Case Lian Li Lancool Black', 6, 2400000, 17, 'https://placehold.co/600x600/18181b/ffffff?text=PC+Case', 'Hỗ trợ: Full Tower ATX | Màu: Black | Kèm Fan: 1', 1),
(260, 'Vỏ Case Montech Air Gray', 6, 700000, 15, 'https://placehold.co/600x600/18181b/ffffff?text=PC+Case', 'Hỗ trợ: ATX Mid Tower | Màu: Gray | Kèm Fan: 3', 1),
(261, 'Vỏ Case Xigmatek Windmill Black', 6, 2200000, 38, 'https://placehold.co/600x600/18181b/ffffff?text=PC+Case', 'Hỗ trợ: Mini-ITX Desktop | Màu: Black | Kèm Fan: 4', 1),
(262, 'Vỏ Case Xigmatek Windmill Gray', 6, 2300000, 29, 'https://placehold.co/600x600/18181b/ffffff?text=PC+Case', 'Hỗ trợ: Mini-ITX Desktop | Màu: Gray | Kèm Fan: 2', 1),
(263, 'Vỏ Case MIK Crusher Black (2)', 6, 2900000, 16, 'https://placehold.co/600x600/18181b/ffffff?text=PC+Case', 'Hỗ trợ: Micro-ATX Mini Tower | Màu: Black | Kèm Fan: 1', 1),
(264, 'Vỏ Case Xigmatek Windmill Black (2)', 6, 3700000, 18, 'https://placehold.co/600x600/18181b/ffffff?text=PC+Case', 'Hỗ trợ: Micro-ATX Mini Tower | Màu: Black | Kèm Fan: 3', 1),
(265, 'Vỏ Case NZXT H510 Gray', 6, 2800000, 29, 'https://placehold.co/600x600/18181b/ffffff?text=Case+NZXT', 'Hỗ trợ: Micro-ATX Mini Tower | Màu: Gray | Kèm Fan: 3', 1),
(266, 'Vỏ Case Lian Li Lancool Gray (2)', 6, 3400000, 31, 'https://placehold.co/600x600/18181b/ffffff?text=PC+Case', 'Hỗ trợ: Micro-ATX Mini Tower | Màu: Gray | Kèm Fan: 0', 1),
(267, 'Vỏ Case Montech Air Gray (2)', 6, 2400000, 14, 'https://placehold.co/600x600/18181b/ffffff?text=PC+Case', 'Hỗ trợ: Mini-ITX Desktop | Màu: Gray | Kèm Fan: 3', 1),
(268, 'Vỏ Case Corsair 4000D Gray', 6, 600000, 20, 'https://placehold.co/600x600/1f2937/fcd34d?text=Corsair+RAM', 'Hỗ trợ: Full Tower ATX | Màu: Gray | Kèm Fan: 2', 1),
(269, 'Vỏ Case Deepcool Matrexx White', 6, 2400000, 8, 'https://placehold.co/600x600/18181b/ffffff?text=PC+Case', 'Hỗ trợ: Micro-ATX Mini Tower | Màu: White | Kèm Fan: 4', 1),
(270, 'Vỏ Case Corsair 4000D Black', 6, 1700000, 9, 'https://placehold.co/600x600/1f2937/fcd34d?text=Corsair+RAM', 'Hỗ trợ: Micro-ATX Mini Tower | Màu: Black | Kèm Fan: 0', 1),
(271, 'Vỏ Case Xigmatek Windmill White (2)', 6, 2100000, 8, 'https://placehold.co/600x600/18181b/ffffff?text=PC+Case', 'Hỗ trợ: Mini-ITX Desktop | Màu: White | Kèm Fan: 1', 1),
(272, 'Vỏ Case Xigmatek Windmill Black (3)', 6, 1700000, 17, 'https://placehold.co/600x600/18181b/ffffff?text=PC+Case', 'Hỗ trợ: Full Tower ATX | Màu: Black | Kèm Fan: 3', 1),
(273, 'Vỏ Case MIK Crusher Pink', 6, 1600000, 44, 'https://placehold.co/600x600/18181b/ffffff?text=PC+Case', 'Hỗ trợ: Micro-ATX Mini Tower | Màu: Pink | Kèm Fan: 0', 1),
(274, 'Vỏ Case Xigmatek Windmill Pink', 6, 3100000, 17, 'https://placehold.co/600x600/18181b/ffffff?text=PC+Case', 'Hỗ trợ: Mini-ITX Desktop | Màu: Pink | Kèm Fan: 2', 1),
(275, 'Vỏ Case Corsair 4000D White (2)', 6, 2900000, 15, 'https://placehold.co/600x600/1f2937/fcd34d?text=Corsair+RAM', 'Hỗ trợ: Full Tower ATX | Màu: White | Kèm Fan: 3', 1),
(276, 'Vỏ Case MIK Crusher Black (3)', 6, 3500000, 37, 'https://placehold.co/600x600/18181b/ffffff?text=PC+Case', 'Hỗ trợ: Full Tower ATX | Màu: Black | Kèm Fan: 3', 1),
(277, 'Vỏ Case MIK Crusher Pink (2)', 6, 3400000, 29, 'https://placehold.co/600x600/18181b/ffffff?text=PC+Case', 'Hỗ trợ: Mini-ITX Desktop | Màu: Pink | Kèm Fan: 1', 1),
(278, 'Vỏ Case Xigmatek Windmill Pink (2)', 6, 1000000, 25, 'https://placehold.co/600x600/18181b/ffffff?text=PC+Case', 'Hỗ trợ: ATX Mid Tower | Màu: Pink | Kèm Fan: 0', 1),
(279, 'Vỏ Case Lian Li Lancool Pink', 6, 3300000, 27, 'https://placehold.co/600x600/18181b/ffffff?text=PC+Case', 'Hỗ trợ: Mini-ITX Desktop | Màu: Pink | Kèm Fan: 1', 1),
(280, 'Vỏ Case Xigmatek Windmill Gray (2)', 6, 2900000, 33, 'https://placehold.co/600x600/18181b/ffffff?text=PC+Case', 'Hỗ trợ: ATX Mid Tower | Màu: Gray | Kèm Fan: 3', 1),
(281, 'Vỏ Case Lian Li Lancool White', 6, 3900000, 46, 'https://placehold.co/600x600/18181b/ffffff?text=PC+Case', 'Hỗ trợ: ATX Mid Tower | Màu: White | Kèm Fan: 3', 1),
(282, 'Vỏ Case NZXT H510 Black', 6, 3200000, 20, 'https://placehold.co/600x600/18181b/ffffff?text=Case+NZXT', 'Hỗ trợ: Full Tower ATX | Màu: Black | Kèm Fan: 2', 1),
(283, 'Vỏ Case Lian Li Lancool Black (2)', 6, 3000000, 10, 'https://placehold.co/600x600/18181b/ffffff?text=PC+Case', 'Hỗ trợ: ATX Mid Tower | Màu: Black | Kèm Fan: 1', 1),
(284, 'Vỏ Case Montech Air White (2)', 6, 2700000, 33, 'https://placehold.co/600x600/18181b/ffffff?text=PC+Case', 'Hỗ trợ: ATX Mid Tower | Màu: White | Kèm Fan: 0', 1),
(285, 'Vỏ Case Lian Li Lancool White (2)', 6, 2500000, 30, 'https://placehold.co/600x600/18181b/ffffff?text=PC+Case', 'Hỗ trợ: Micro-ATX Mini Tower | Màu: White | Kèm Fan: 0', 1),
(286, 'Vỏ Case Lian Li Lancool Black (3)', 6, 3000000, 35, 'https://placehold.co/600x600/18181b/ffffff?text=PC+Case', 'Hỗ trợ: Mini-ITX Desktop | Màu: Black | Kèm Fan: 3', 1),
(287, 'Vỏ Case Xigmatek Windmill Pink (3)', 6, 1700000, 38, 'https://placehold.co/600x600/18181b/ffffff?text=PC+Case', 'Hỗ trợ: Mini-ITX Desktop | Màu: Pink | Kèm Fan: 4', 1),
(288, 'Vỏ Case Xigmatek Windmill Black (4)', 6, 1300000, 36, 'https://placehold.co/600x600/18181b/ffffff?text=PC+Case', 'Hỗ trợ: Full Tower ATX | Màu: Black | Kèm Fan: 4', 1),
(289, 'Vỏ Case Montech Air Pink', 6, 3000000, 14, 'https://placehold.co/600x600/18181b/ffffff?text=PC+Case', 'Hỗ trợ: ATX Mid Tower | Màu: Pink | Kèm Fan: 3', 1),
(290, 'Vỏ Case NZXT H510 Pink', 6, 3400000, 31, 'https://placehold.co/600x600/18181b/ffffff?text=Case+NZXT', 'Hỗ trợ: Micro-ATX Mini Tower | Màu: Pink | Kèm Fan: 1', 1),
(291, 'Vỏ Case Lian Li Lancool Black (4)', 6, 2200000, 15, 'https://placehold.co/600x600/18181b/ffffff?text=PC+Case', 'Hỗ trợ: ATX Mid Tower | Màu: Black | Kèm Fan: 1', 1),
(292, 'Vỏ Case Montech Air White (3)', 6, 2600000, 38, 'https://placehold.co/600x600/18181b/ffffff?text=PC+Case', 'Hỗ trợ: Full Tower ATX | Màu: White | Kèm Fan: 2', 1),
(293, 'Vỏ Case Xigmatek Windmill Pink (4)', 6, 2000000, 39, 'https://placehold.co/600x600/18181b/ffffff?text=PC+Case', 'Hỗ trợ: Full Tower ATX | Màu: Pink | Kèm Fan: 1', 1),
(294, 'Vỏ Case Montech Air Black', 6, 2600000, 23, 'https://placehold.co/600x600/18181b/ffffff?text=PC+Case', 'Hỗ trợ: Micro-ATX Mini Tower | Màu: Black | Kèm Fan: 2', 1),
(295, 'Vỏ Case Lian Li Lancool Black (5)', 6, 3400000, 24, 'https://placehold.co/600x600/18181b/ffffff?text=PC+Case', 'Hỗ trợ: ATX Mid Tower | Màu: Black | Kèm Fan: 3', 1),
(296, 'Vỏ Case Lian Li Lancool Pink (2)', 6, 2900000, 32, 'https://placehold.co/600x600/18181b/ffffff?text=PC+Case', 'Hỗ trợ: Micro-ATX Mini Tower | Màu: Pink | Kèm Fan: 3', 1),
(297, 'Vỏ Case Corsair 4000D White (3)', 6, 2600000, 21, 'https://placehold.co/600x600/1f2937/fcd34d?text=Corsair+RAM', 'Hỗ trợ: Full Tower ATX | Màu: White | Kèm Fan: 1', 1),
(298, 'Vỏ Case NZXT H510 Gray (2)', 6, 3800000, 8, 'https://placehold.co/600x600/18181b/ffffff?text=Case+NZXT', 'Hỗ trợ: Micro-ATX Mini Tower | Màu: Gray | Kèm Fan: 2', 1),
(299, 'Vỏ Case Xigmatek Windmill Pink (5)', 6, 4000000, 9, 'https://placehold.co/600x600/18181b/ffffff?text=PC+Case', 'Hỗ trợ: Full Tower ATX | Màu: Pink | Kèm Fan: 4', 1),
(300, 'Vỏ Case NZXT H510 White (2)', 6, 2700000, 39, 'https://placehold.co/600x600/18181b/ffffff?text=Case+NZXT', 'Hỗ trợ: Full Tower ATX | Màu: White | Kèm Fan: 3', 1),
(301, 'Ổ Cứng Lexar 2TB HDD 7200RPM', 7, 1610000, 50, 'https://placehold.co/600x600/172554/cbd5e1?text=Hard+Drive', 'SATA III 7200RPM 512MB Cache', 1),
(302, 'Ổ Cứng Seagate 1TB SSD NVMe Gen 4', 7, 1930000, 17, 'https://placehold.co/600x600/172554/cbd5e1?text=SSD+Drive', 'NVMe PCIe 4.0 7000MB/s', 1),
(303, 'Ổ Cứng Crucial 500GB SSD NVMe Gen 3', 7, 890000, 39, 'https://placehold.co/600x600/172554/cbd5e1?text=SSD+Drive', 'NVMe PCIe 3.0 3500MB/s', 1),
(304, 'Ổ Cứng SK Hynix 2TB SSD NVMe Gen 4', 7, 3750000, 44, 'https://placehold.co/600x600/172554/cbd5e1?text=SSD+Drive', 'NVMe PCIe 4.0 7000MB/s', 1),
(305, 'Ổ Cứng Seagate 1TB HDD 7200RPM', 7, 910000, 45, 'https://placehold.co/600x600/172554/cbd5e1?text=Hard+Drive', 'SATA III 7200RPM 256MB Cache', 1),
(306, 'Ổ Cứng Lexar 2TB SSD NVMe Gen 4', 7, 3800000, 27, 'https://placehold.co/600x600/172554/cbd5e1?text=SSD+Drive', 'NVMe PCIe 4.0 7000MB/s', 1),
(307, 'Ổ Cứng WD 2TB SSD NVMe Gen 4', 7, 3780000, 45, 'https://placehold.co/600x600/172554/93c5fd?text=WD+Drive', 'NVMe PCIe 4.0 7000MB/s', 1),
(308, 'Ổ Cứng Kingston 2TB HDD 7200RPM', 7, 1640000, 42, 'https://placehold.co/600x600/1f2937/ef4444?text=Kingston+RAM', 'SATA III 7200RPM 512MB Cache', 1),
(309, 'Ổ Cứng Kingston 1TB HDD 7200RPM', 7, 980000, 23, 'https://placehold.co/600x600/1f2937/ef4444?text=Kingston+RAM', 'SATA III 7200RPM 256MB Cache', 1),
(310, 'Ổ Cứng Samsung 500GB SSD NVMe Gen 3', 7, 890000, 47, 'https://placehold.co/600x600/172554/93c5fd?text=SSD+Samsung', 'NVMe PCIe 3.0 3500MB/s', 1),
(311, 'Ổ Cứng Kingston 2TB HDD 7200RPM (2)', 7, 1600000, 33, 'https://placehold.co/600x600/1f2937/ef4444?text=Kingston+RAM', 'SATA III 7200RPM 512MB Cache', 1),
(312, 'Ổ Cứng Crucial 1TB SSD NVMe Gen 4', 7, 1870000, 17, 'https://placehold.co/600x600/172554/cbd5e1?text=SSD+Drive', 'NVMe PCIe 4.0 7000MB/s', 1);
INSERT INTO `products` (`id`, `name`, `category_id`, `price`, `stock`, `image`, `specs`, `is_active`) VALUES
(313, 'Ổ Cứng Crucial 2TB SSD NVMe Gen 4', 7, 3810000, 31, 'https://placehold.co/600x600/172554/cbd5e1?text=SSD+Drive', 'NVMe PCIe 4.0 7000MB/s', 1),
(314, 'Ổ Cứng Lexar 1TB HDD 7200RPM', 7, 980000, 9, 'https://placehold.co/600x600/172554/cbd5e1?text=Hard+Drive', 'SATA III 7200RPM 256MB Cache', 1),
(315, 'Ổ Cứng Kingston 2TB SSD NVMe Gen 4', 7, 3840000, 44, 'https://placehold.co/600x600/1f2937/ef4444?text=Kingston+RAM', 'NVMe PCIe 4.0 7000MB/s', 1),
(316, 'Ổ Cứng SK Hynix 500GB SSD NVMe Gen 3', 7, 850000, 35, 'https://placehold.co/600x600/172554/cbd5e1?text=SSD+Drive', 'NVMe PCIe 3.0 3500MB/s', 1),
(317, 'Ổ Cứng Lexar 2TB SSD NVMe Gen 4 (2)', 7, 3770000, 30, 'https://placehold.co/600x600/172554/cbd5e1?text=SSD+Drive', 'NVMe PCIe 4.0 7000MB/s', 1),
(318, 'Ổ Cứng Samsung 1TB HDD 7200RPM', 7, 930000, 48, 'https://placehold.co/600x600/172554/93c5fd?text=SSD+Samsung', 'SATA III 7200RPM 256MB Cache', 1),
(319, 'Ổ Cứng Kingston 2TB HDD 7200RPM (3)', 7, 1580000, 48, 'https://placehold.co/600x600/1f2937/ef4444?text=Kingston+RAM', 'SATA III 7200RPM 512MB Cache', 1),
(320, 'Ổ Cứng Crucial 2TB HDD 7200RPM', 7, 1580000, 45, 'https://placehold.co/600x600/172554/cbd5e1?text=Hard+Drive', 'SATA III 7200RPM 512MB Cache', 1),
(321, 'Ổ Cứng Lexar 500GB SSD NVMe Gen 3', 7, 880000, 16, 'https://placehold.co/600x600/172554/cbd5e1?text=SSD+Drive', 'NVMe PCIe 3.0 3500MB/s', 1),
(322, 'Ổ Cứng SK Hynix 1TB HDD 7200RPM', 7, 930000, 23, 'https://placehold.co/600x600/172554/cbd5e1?text=Hard+Drive', 'SATA III 7200RPM 256MB Cache', 1),
(323, 'Ổ Cứng SK Hynix 1TB HDD 7200RPM (2)', 7, 940000, 40, 'https://placehold.co/600x600/172554/cbd5e1?text=Hard+Drive', 'SATA III 7200RPM 256MB Cache', 1),
(324, 'Ổ Cứng SK Hynix 1TB SSD NVMe Gen 4', 7, 1920000, 17, 'https://placehold.co/600x600/172554/cbd5e1?text=SSD+Drive', 'NVMe PCIe 4.0 7000MB/s', 1),
(325, 'Ổ Cứng Seagate 256GB SSD SATA III', 7, 520000, 42, 'https://placehold.co/600x600/172554/cbd5e1?text=SSD+Drive', 'SATA III 560MB/s', 1),
(326, 'Ổ Cứng Samsung 1TB SSD NVMe Gen 4', 7, 1910000, 20, 'https://placehold.co/600x600/172554/93c5fd?text=SSD+Samsung', 'NVMe PCIe 4.0 7000MB/s', 1),
(327, 'Ổ Cứng WD 1TB SSD NVMe Gen 4', 7, 1850000, 20, 'https://placehold.co/600x600/172554/93c5fd?text=WD+Drive', 'NVMe PCIe 4.0 7000MB/s', 1),
(328, 'Ổ Cứng SK Hynix 2TB HDD 7200RPM', 7, 1550000, 47, 'https://placehold.co/600x600/172554/cbd5e1?text=Hard+Drive', 'SATA III 7200RPM 512MB Cache', 1),
(329, 'Ổ Cứng SK Hynix 1TB SSD NVMe Gen 4 (2)', 7, 1950000, 44, 'https://placehold.co/600x600/172554/cbd5e1?text=SSD+Drive', 'NVMe PCIe 4.0 7000MB/s', 1),
(330, 'Ổ Cứng Kingston 2TB SSD NVMe Gen 4 (2)', 7, 3820000, 5, 'https://placehold.co/600x600/1f2937/ef4444?text=Kingston+RAM', 'NVMe PCIe 4.0 7000MB/s', 1),
(331, 'Ổ Cứng Seagate 500GB SSD NVMe Gen 3', 7, 910000, 30, 'https://placehold.co/600x600/172554/cbd5e1?text=SSD+Drive', 'NVMe PCIe 3.0 3500MB/s', 1),
(332, 'Ổ Cứng WD 1TB HDD 7200RPM', 7, 920000, 45, 'https://placehold.co/600x600/172554/93c5fd?text=WD+Drive', 'SATA III 7200RPM 256MB Cache', 1),
(333, 'Ổ Cứng Seagate 2TB SSD NVMe Gen 4', 7, 3760000, 33, 'https://placehold.co/600x600/172554/cbd5e1?text=SSD+Drive', 'NVMe PCIe 4.0 7000MB/s', 1),
(334, 'Ổ Cứng Lexar 2TB HDD 7200RPM (2)', 7, 1560000, 36, 'https://placehold.co/600x600/172554/cbd5e1?text=Hard+Drive', 'SATA III 7200RPM 512MB Cache', 1),
(335, 'Ổ Cứng Crucial 1TB HDD 7200RPM', 7, 920000, 28, 'https://placehold.co/600x600/172554/cbd5e1?text=Hard+Drive', 'SATA III 7200RPM 256MB Cache', 1),
(336, 'Ổ Cứng Lexar 256GB SSD SATA III', 7, 550000, 35, 'https://placehold.co/600x600/172554/cbd5e1?text=SSD+Drive', 'SATA III 560MB/s', 1),
(337, 'Ổ Cứng SK Hynix 2TB HDD 7200RPM (2)', 7, 1570000, 33, 'https://placehold.co/600x600/172554/cbd5e1?text=Hard+Drive', 'SATA III 7200RPM 512MB Cache', 1),
(338, 'Ổ Cứng Crucial 2TB SSD NVMe Gen 4 (2)', 7, 3820000, 35, 'https://placehold.co/600x600/172554/cbd5e1?text=SSD+Drive', 'NVMe PCIe 4.0 7000MB/s', 1),
(339, 'Ổ Cứng Kingston 1TB SSD NVMe Gen 4', 7, 1880000, 50, 'https://placehold.co/600x600/1f2937/ef4444?text=Kingston+RAM', 'NVMe PCIe 4.0 7000MB/s', 1),
(340, 'Ổ Cứng Samsung 1TB SSD NVMe Gen 4 (2)', 7, 1920000, 37, 'https://placehold.co/600x600/172554/93c5fd?text=SSD+Samsung', 'NVMe PCIe 4.0 7000MB/s', 1),
(341, 'Ổ Cứng Kingston 500GB SSD NVMe Gen 3', 7, 910000, 26, 'https://placehold.co/600x600/1f2937/ef4444?text=Kingston+RAM', 'NVMe PCIe 3.0 3500MB/s', 1),
(342, 'Ổ Cứng Samsung 256GB SSD SATA III', 7, 530000, 5, 'https://placehold.co/600x600/172554/93c5fd?text=SSD+Samsung', 'SATA III 560MB/s', 1),
(343, 'Ổ Cứng Samsung 500GB SSD NVMe Gen 3 (2)', 7, 860000, 11, 'https://placehold.co/600x600/172554/93c5fd?text=SSD+Samsung', 'NVMe PCIe 3.0 3500MB/s', 1),
(344, 'Ổ Cứng Samsung 1TB HDD 7200RPM (2)', 7, 900000, 39, 'https://placehold.co/600x600/172554/93c5fd?text=SSD+Samsung', 'SATA III 7200RPM 256MB Cache', 1),
(345, 'Ổ Cứng Crucial 1TB SSD NVMe Gen 4 (2)', 7, 1910000, 24, 'https://placehold.co/600x600/172554/cbd5e1?text=SSD+Drive', 'NVMe PCIe 4.0 7000MB/s', 1),
(346, 'Ổ Cứng Kingston 256GB SSD SATA III', 7, 520000, 13, 'https://placehold.co/600x600/1f2937/ef4444?text=Kingston+RAM', 'SATA III 560MB/s', 1),
(347, 'Ổ Cứng SK Hynix 256GB SSD SATA III', 7, 500000, 27, 'https://placehold.co/600x600/172554/cbd5e1?text=SSD+Drive', 'SATA III 560MB/s', 1),
(348, 'Ổ Cứng Samsung 1TB HDD 7200RPM (3)', 7, 980000, 28, 'https://placehold.co/600x600/172554/93c5fd?text=SSD+Samsung', 'SATA III 7200RPM 256MB Cache', 1),
(349, 'Ổ Cứng Samsung 500GB SSD NVMe Gen 3 (3)', 7, 890000, 38, 'https://placehold.co/600x600/172554/93c5fd?text=SSD+Samsung', 'NVMe PCIe 3.0 3500MB/s', 1),
(350, 'Ổ Cứng Samsung 2TB SSD NVMe Gen 4', 7, 3810000, 35, 'https://placehold.co/600x600/172554/93c5fd?text=SSD+Samsung', 'NVMe PCIe 4.0 7000MB/s', 1),
(351, 'Tản Nhiệt ID-Cooling Tản Khí Tháp Đơn', 8, 350000, 31, 'https://placehold.co/600x600/0f172a/2dd4bf?text=Air+Cooler', 'Tản Khí | Hỗ trợ LGA1700/AM5', 1),
(352, 'Tản Nhiệt ID-Cooling Tản Khí Tháp Đơn (2)', 8, 250000, 27, 'https://placehold.co/600x600/0f172a/2dd4bf?text=Air+Cooler', 'Tản Khí | Hỗ trợ LGA1700/AM5', 1),
(353, 'Tản Nhiệt NZXT Tản Nước AIO 360mm ARGB', 8, 3200000, 18, 'https://placehold.co/600x600/18181b/ffffff?text=Case+NZXT', 'Tản Nước AIO 360mm | Hỗ trợ LGA1700/AM5', 1),
(354, 'Tản Nhiệt Noctua Tản Khí Tháp Đơn', 8, 850000, 47, 'https://placehold.co/600x600/0f172a/2dd4bf?text=Air+Cooler', 'Tản Khí | Hỗ trợ LGA1700/AM5', 1),
(355, 'Tản Nhiệt be quiet! Tản Khí Tháp Đôi ARGB', 8, 1350000, 41, 'https://placehold.co/600x600/0f172a/2dd4bf?text=Air+Cooler', 'Tản Khí Dual Fan | Hỗ trợ LGA1700/AM5', 1),
(356, 'Tản Nhiệt be quiet! Tản Khí Tháp Đơn', 8, 550000, 18, 'https://placehold.co/600x600/0f172a/2dd4bf?text=Air+Cooler', 'Tản Khí | Hỗ trợ LGA1700/AM5', 1),
(357, 'Tản Nhiệt Noctua Tản Nước AIO 280mm ARGB', 8, 2300000, 34, 'https://placehold.co/600x600/0f172a/2dd4bf?text=AIO+Cooler', 'Tản Nước AIO 280mm | Hỗ trợ LGA1700/AM5', 1),
(358, 'Tản Nhiệt NZXT Tản Nước AIO 280mm ARGB', 8, 2500000, 15, 'https://placehold.co/600x600/18181b/ffffff?text=Case+NZXT', 'Tản Nước AIO 280mm | Hỗ trợ LGA1700/AM5', 1),
(359, 'Tản Nhiệt Noctua Tản Khí Tháp Đơn (2)', 8, 250000, 31, 'https://placehold.co/600x600/0f172a/2dd4bf?text=Air+Cooler', 'Tản Khí | Hỗ trợ LGA1700/AM5', 1),
(360, 'Tản Nhiệt Thermalright Tản Khí Tháp Đơn', 8, 250000, 28, 'https://placehold.co/600x600/0f172a/2dd4bf?text=Air+Cooler', 'Tản Khí | Hỗ trợ LGA1700/AM5', 1),
(361, 'Tản Nhiệt Corsair Tản Nước AIO 280mm ARGB', 8, 2400000, 6, 'https://placehold.co/600x600/1f2937/fcd34d?text=Corsair+RAM', 'Tản Nước AIO 280mm | Hỗ trợ LGA1700/AM5', 1),
(362, 'Tản Nhiệt Noctua Tản Khí Tháp Đơn (3)', 8, 750000, 39, 'https://placehold.co/600x600/0f172a/2dd4bf?text=Air+Cooler', 'Tản Khí | Hỗ trợ LGA1700/AM5', 1),
(363, 'Tản Nhiệt Deepcool Tản Nước AIO 240mm ARGB', 8, 1600000, 18, 'https://placehold.co/600x600/0f172a/2dd4bf?text=AIO+Cooler', 'Tản Nước AIO 240mm | Hỗ trợ LGA1700/AM5', 1),
(364, 'Tản Nhiệt Thermalright Tản Khí Tháp Đôi ARGB', 8, 1350000, 13, 'https://placehold.co/600x600/0f172a/2dd4bf?text=Air+Cooler', 'Tản Khí Dual Fan | Hỗ trợ LGA1700/AM5', 1),
(365, 'Tản Nhiệt Corsair Tản Nước AIO 240mm ARGB', 8, 1700000, 13, 'https://placehold.co/600x600/1f2937/fcd34d?text=Corsair+RAM', 'Tản Nước AIO 240mm | Hỗ trợ LGA1700/AM5', 1),
(366, 'Tản Nhiệt be quiet! Tản Nước AIO 240mm ARGB', 8, 2200000, 23, 'https://placehold.co/600x600/0f172a/2dd4bf?text=AIO+Cooler', 'Tản Nước AIO 240mm | Hỗ trợ LGA1700/AM5', 1),
(367, 'Tản Nhiệt Deepcool Tản Khí Tháp Đôi ARGB', 8, 1150000, 10, 'https://placehold.co/600x600/0f172a/2dd4bf?text=Air+Cooler', 'Tản Khí Dual Fan | Hỗ trợ LGA1700/AM5', 1),
(368, 'Tản Nhiệt Deepcool Tản Nước AIO 240mm ARGB (2)', 8, 2000000, 13, 'https://placehold.co/600x600/0f172a/2dd4bf?text=AIO+Cooler', 'Tản Nước AIO 240mm | Hỗ trợ LGA1700/AM5', 1),
(369, 'Tản Nhiệt Corsair Tản Nước AIO 360mm ARGB', 8, 3300000, 30, 'https://placehold.co/600x600/1f2937/fcd34d?text=Corsair+RAM', 'Tản Nước AIO 360mm | Hỗ trợ LGA1700/AM5', 1),
(370, 'Tản Nhiệt Thermalright Tản Nước AIO 280mm ARGB', 8, 2000000, 26, 'https://placehold.co/600x600/0f172a/2dd4bf?text=AIO+Cooler', 'Tản Nước AIO 280mm | Hỗ trợ LGA1700/AM5', 1),
(371, 'Tản Nhiệt ID-Cooling Tản Nước AIO 240mm ARGB', 8, 2300000, 26, 'https://placehold.co/600x600/0f172a/2dd4bf?text=AIO+Cooler', 'Tản Nước AIO 240mm | Hỗ trợ LGA1700/AM5', 1),
(372, 'Tản Nhiệt Deepcool Tản Nước AIO 360mm ARGB', 8, 2900000, 45, 'https://placehold.co/600x600/0f172a/2dd4bf?text=AIO+Cooler', 'Tản Nước AIO 360mm | Hỗ trợ LGA1700/AM5', 1),
(373, 'Tản Nhiệt Deepcool Tản Nước AIO 360mm ARGB (2)', 8, 2600000, 49, 'https://placehold.co/600x600/0f172a/2dd4bf?text=AIO+Cooler', 'Tản Nước AIO 360mm | Hỗ trợ LGA1700/AM5', 1),
(374, 'Tản Nhiệt NZXT Tản Nước AIO 240mm ARGB', 8, 2300000, 20, 'https://placehold.co/600x600/18181b/ffffff?text=Case+NZXT', 'Tản Nước AIO 240mm | Hỗ trợ LGA1700/AM5', 1),
(375, 'Tản Nhiệt Thermalright Tản Nước AIO 360mm ARGB', 8, 2900000, 7, 'https://placehold.co/600x600/0f172a/2dd4bf?text=AIO+Cooler', 'Tản Nước AIO 360mm | Hỗ trợ LGA1700/AM5', 1),
(376, 'Tản Nhiệt ID-Cooling Tản Khí Tháp Đôi ARGB', 8, 1150000, 17, 'https://placehold.co/600x600/0f172a/2dd4bf?text=Air+Cooler', 'Tản Khí Dual Fan | Hỗ trợ LGA1700/AM5', 1),
(377, 'Tản Nhiệt Thermalright Tản Khí Tháp Đôi ARGB (2)', 8, 1050000, 12, 'https://placehold.co/600x600/0f172a/2dd4bf?text=Air+Cooler', 'Tản Khí Dual Fan | Hỗ trợ LGA1700/AM5', 1),
(378, 'Tản Nhiệt be quiet! Tản Khí Tháp Đôi ARGB (2)', 8, 1350000, 50, 'https://placehold.co/600x600/0f172a/2dd4bf?text=Air+Cooler', 'Tản Khí Dual Fan | Hỗ trợ LGA1700/AM5', 1),
(379, 'Tản Nhiệt be quiet! Tản Khí Tháp Đơn (2)', 8, 950000, 6, 'https://placehold.co/600x600/0f172a/2dd4bf?text=Air+Cooler', 'Tản Khí | Hỗ trợ LGA1700/AM5', 1),
(380, 'Tản Nhiệt Noctua Tản Khí Tháp Đơn (4)', 8, 450000, 21, 'https://placehold.co/600x600/0f172a/2dd4bf?text=Air+Cooler', 'Tản Khí | Hỗ trợ LGA1700/AM5', 1),
(381, 'Tản Nhiệt Deepcool Tản Nước AIO 280mm ARGB', 8, 2500000, 37, 'https://placehold.co/600x600/0f172a/2dd4bf?text=AIO+Cooler', 'Tản Nước AIO 280mm | Hỗ trợ LGA1700/AM5', 1),
(382, 'Tản Nhiệt Deepcool Tản Nước AIO 360mm ARGB (3)', 8, 2600000, 23, 'https://placehold.co/600x600/0f172a/2dd4bf?text=AIO+Cooler', 'Tản Nước AIO 360mm | Hỗ trợ LGA1700/AM5', 1),
(383, 'Tản Nhiệt Corsair Tản Nước AIO 360mm ARGB (2)', 8, 2800000, 29, 'https://placehold.co/600x600/1f2937/fcd34d?text=Corsair+RAM', 'Tản Nước AIO 360mm | Hỗ trợ LGA1700/AM5', 1),
(384, 'Tản Nhiệt ID-Cooling Tản Khí Tháp Đôi ARGB (2)', 8, 1250000, 43, 'https://placehold.co/600x600/0f172a/2dd4bf?text=Air+Cooler', 'Tản Khí Dual Fan | Hỗ trợ LGA1700/AM5', 1),
(385, 'Tản Nhiệt be quiet! Tản Nước AIO 240mm ARGB (2)', 8, 2200000, 14, 'https://placehold.co/600x600/0f172a/2dd4bf?text=AIO+Cooler', 'Tản Nước AIO 240mm | Hỗ trợ LGA1700/AM5', 1),
(386, 'Tản Nhiệt Noctua Tản Khí Tháp Đơn (5)', 8, 650000, 44, 'https://placehold.co/600x600/0f172a/2dd4bf?text=Air+Cooler', 'Tản Khí | Hỗ trợ LGA1700/AM5', 1),
(387, 'Tản Nhiệt ID-Cooling Tản Khí Tháp Đơn (3)', 8, 850000, 20, 'https://placehold.co/600x600/0f172a/2dd4bf?text=Air+Cooler', 'Tản Khí | Hỗ trợ LGA1700/AM5', 1),
(388, 'Tản Nhiệt Corsair Tản Nước AIO 280mm ARGB (2)', 8, 2600000, 7, 'https://placehold.co/600x600/1f2937/fcd34d?text=Corsair+RAM', 'Tản Nước AIO 280mm | Hỗ trợ LGA1700/AM5', 1),
(389, 'Tản Nhiệt Noctua Tản Khí Tháp Đôi ARGB', 8, 1350000, 19, 'https://placehold.co/600x600/0f172a/2dd4bf?text=Air+Cooler', 'Tản Khí Dual Fan | Hỗ trợ LGA1700/AM5', 1),
(390, 'Tản Nhiệt NZXT Tản Nước AIO 280mm ARGB (2)', 8, 2200000, 23, 'https://placehold.co/600x600/18181b/ffffff?text=Case+NZXT', 'Tản Nước AIO 280mm | Hỗ trợ LGA1700/AM5', 1),
(391, 'Tản Nhiệt NZXT Tản Khí Tháp Đơn', 8, 650000, 7, 'https://placehold.co/600x600/18181b/ffffff?text=Case+NZXT', 'Tản Khí | Hỗ trợ LGA1700/AM5', 1),
(392, 'Tản Nhiệt Corsair Tản Khí Tháp Đơn', 8, 450000, 8, 'https://placehold.co/600x600/1f2937/fcd34d?text=Corsair+RAM', 'Tản Khí | Hỗ trợ LGA1700/AM5', 1),
(393, 'Tản Nhiệt be quiet! Tản Khí Tháp Đôi ARGB (3)', 8, 1050000, 25, 'https://placehold.co/600x600/0f172a/2dd4bf?text=Air+Cooler', 'Tản Khí Dual Fan | Hỗ trợ LGA1700/AM5', 1),
(394, 'Tản Nhiệt Deepcool Tản Nước AIO 360mm ARGB (4)', 8, 3000000, 34, 'https://placehold.co/600x600/0f172a/2dd4bf?text=AIO+Cooler', 'Tản Nước AIO 360mm | Hỗ trợ LGA1700/AM5', 1),
(395, 'Tản Nhiệt Corsair Tản Khí Tháp Đôi ARGB', 8, 1450000, 10, 'https://placehold.co/600x600/1f2937/fcd34d?text=Corsair+RAM', 'Tản Khí Dual Fan | Hỗ trợ LGA1700/AM5', 1),
(396, 'Tản Nhiệt ID-Cooling Tản Khí Tháp Đôi ARGB (3)', 8, 750000, 43, 'https://placehold.co/600x600/0f172a/2dd4bf?text=Air+Cooler', 'Tản Khí Dual Fan | Hỗ trợ LGA1700/AM5', 1),
(397, 'Tản Nhiệt Noctua Tản Nước AIO 360mm ARGB', 8, 3000000, 24, 'https://placehold.co/600x600/0f172a/2dd4bf?text=AIO+Cooler', 'Tản Nước AIO 360mm | Hỗ trợ LGA1700/AM5', 1),
(398, 'Tản Nhiệt be quiet! Tản Nước AIO 280mm ARGB', 8, 2300000, 48, 'https://placehold.co/600x600/0f172a/2dd4bf?text=AIO+Cooler', 'Tản Nước AIO 280mm | Hỗ trợ LGA1700/AM5', 1),
(399, 'Tản Nhiệt Deepcool Tản Khí Tháp Đơn', 8, 450000, 6, 'https://placehold.co/600x600/0f172a/2dd4bf?text=Air+Cooler', 'Tản Khí | Hỗ trợ LGA1700/AM5', 1),
(400, 'Tản Nhiệt NZXT Tản Khí Tháp Đơn (2)', 8, 950000, 12, '', 'Tản Khí | Hỗ trợ LGA1700/AM5', 1),
(401, 'test', 1, 5000, 3, 'http://localhost:8000/static/uploads/163d76886b394105af6e10c4f1b5c3df.jpg', '', 1);

-- --------------------------------------------------------

--
-- Table structure for table `product_compatibility`
--

CREATE TABLE `product_compatibility` (
  `id` int NOT NULL,
  `product_id` int DEFAULT NULL,
  `model_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `product_compatibility`
--

INSERT INTO `product_compatibility` (`id`, `product_id`, `model_id`) VALUES
(1, 7, 2),
(2, 13, 2);

-- --------------------------------------------------------

--
-- Table structure for table `product_reviews`
--

CREATE TABLE `product_reviews` (
  `id` int NOT NULL,
  `product_id` int NOT NULL,
  `user_id` int NOT NULL,
  `rating` int DEFAULT NULL,
  `comment` text,
  `created_at` datetime DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `password_hash` varchar(200) DEFAULT NULL,
  `role` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `full_name`, `password_hash`, `role`, `is_active`, `created_at`, `phone_number`) VALUES
(1, 'ADMIN@example.com', 'ADMIN', '$2b$12$nI8Xzn7WGRQbURDJVWCQluHxpbHi0es4M5bFT0enhlmO5w/.0l5TC', 'admin', 1, '2026-04-10 17:44:02', ''),
(3, 'leminhducphale@gmail.com', 'Lê Minh Đức', '$2b$12$.6PdohIfKZi7jjMO9dMTiekwZBEzRhfzSVHOpB4gRSuzhuGb.SykK', 'customer', 1, '2026-04-10 17:51:31', '0799412960');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ix_categories_name` (`name`),
  ADD KEY `ix_categories_id` (`id`);

--
-- Indexes for table `laptop_models`
--
ALTER TABLE `laptop_models`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ix_laptop_models_id` (`id`),
  ADD KEY `ix_laptop_models_brand` (`brand`),
  ADD KEY `ix_laptop_models_name` (`name`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `ix_orders_id` (`id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `ix_order_items_id` (`id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ix_password_reset_tokens_token` (`token`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `ix_password_reset_tokens_id` (`id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `ix_products_id` (`id`),
  ADD KEY `ix_products_name` (`name`);

--
-- Indexes for table `product_compatibility`
--
ALTER TABLE `product_compatibility`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `model_id` (`model_id`),
  ADD KEY `ix_product_compatibility_id` (`id`);

--
-- Indexes for table `product_reviews`
--
ALTER TABLE `product_reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `ix_product_reviews_id` (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ix_users_email` (`email`),
  ADD KEY `ix_users_id` (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `laptop_models`
--
ALTER TABLE `laptop_models`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=403;

--
-- AUTO_INCREMENT for table `product_compatibility`
--
ALTER TABLE `product_compatibility`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `product_reviews`
--
ALTER TABLE `product_reviews`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Constraints for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD CONSTRAINT `password_reset_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`);

--
-- Constraints for table `product_compatibility`
--
ALTER TABLE `product_compatibility`
  ADD CONSTRAINT `product_compatibility_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `product_compatibility_ibfk_2` FOREIGN KEY (`model_id`) REFERENCES `laptop_models` (`id`);

--
-- Constraints for table `product_reviews`
--
ALTER TABLE `product_reviews`
  ADD CONSTRAINT `product_reviews_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `product_reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
