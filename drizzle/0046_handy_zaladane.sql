CREATE TABLE `amazon_daily_deals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` text NOT NULL,
	`price` varchar(50) NOT NULL,
	`affiliateUrl` varchar(1000) NOT NULL,
	`imageUrl` varchar(1000),
	`rating` varchar(20),
	`reviewCount` varchar(50),
	`category` varchar(255),
	`scheduledDate` varchar(10) NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`clickCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `amazon_daily_deals_id` PRIMARY KEY(`id`)
);
