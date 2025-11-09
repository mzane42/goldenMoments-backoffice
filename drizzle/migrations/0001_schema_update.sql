-- Renommer les colonnes de la table users
ALTER TABLE `users` RENAME COLUMN `openId` TO `authId`;
ALTER TABLE `users` RENAME COLUMN `name` TO `fullName`;
ALTER TABLE `users` ADD COLUMN `phoneNumber` varchar(20);
ALTER TABLE `users` ADD COLUMN `profilePicture` text;
ALTER TABLE `users` ADD COLUMN `preferences` text;
ALTER TABLE `users` DROP COLUMN `loginMethod`;

-- Créer la table admins
CREATE TABLE IF NOT EXISTS `admins` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `authId` varchar(64) UNIQUE,
  `fullName` text NOT NULL,
  `email` varchar(320) NOT NULL UNIQUE,
  `role` enum('super_admin', 'admin', 'moderator') NOT NULL DEFAULT 'admin',
  `permissions` text,
  `isActive` boolean NOT NULL DEFAULT true,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Créer la table hotelPartners
CREATE TABLE IF NOT EXISTS `hotelPartners` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `authId` varchar(64) UNIQUE,
  `hotelName` text NOT NULL,
  `company` text NOT NULL,
  `contactName` text NOT NULL,
  `email` varchar(320) NOT NULL UNIQUE,
  `phone` varchar(20),
  `address` text,
  `status` enum('active', 'inactive', 'pending') NOT NULL DEFAULT 'active',
  `commissionRate` decimal(5, 2) DEFAULT 15.00,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Créer la table experiences
CREATE TABLE IF NOT EXISTS `experiences` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `title` text NOT NULL,
  `description` text NOT NULL,
  `longDescription` text,
  `price` int NOT NULL,
  `images` text NOT NULL,
  `category` text NOT NULL,
  `location` text,
  `rating` decimal(3, 2) DEFAULT 0.00,
  `reviewCount` int NOT NULL DEFAULT 0,
  `items` text,
  `checkInInfo` text,
  `transportation` text,
  `accessibility` text,
  `additionalInfo` text,
  `schedules` text,
  `dateStart` timestamp,
  `dateEnd` timestamp,
  `company` text,
  `imageUrl` text,
  `isActive` boolean NOT NULL DEFAULT true,
  `createdBy` int,
  `lastModifiedBy` int,
  `maxCapacity` int NOT NULL DEFAULT 10,
  `minCapacity` int NOT NULL DEFAULT 1,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Créer la table wishlists
CREATE TABLE IF NOT EXISTS `wishlists` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `experienceId` int NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Créer la table reservations
CREATE TABLE IF NOT EXISTS `reservations` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `experienceId` int NOT NULL,
  `bookingReference` varchar(50) NOT NULL UNIQUE,
  `checkInDate` timestamp NOT NULL,
  `checkOutDate` timestamp NOT NULL,
  `roomType` text NOT NULL,
  `guestCount` int NOT NULL DEFAULT 2,
  `totalPrice` int NOT NULL,
  `status` enum('confirmed', 'cancelled', 'completed') NOT NULL DEFAULT 'confirmed',
  `paymentStatus` enum('pending', 'paid', 'refunded', 'failed') NOT NULL DEFAULT 'pending',
  `adminNotes` text,
  `cancellationReason` text,
  `cancelledBy` int,
  `cancelledAt` timestamp,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
