CREATE TABLE `news_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`summary` text NOT NULL,
	`category` varchar(100) NOT NULL,
	`source` varchar(255),
	`url` varchar(1000),
	`publishedAt` varchar(50),
	`weekLabel` varchar(50) NOT NULL,
	`position` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `news_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `news_refresh_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`weekLabel` varchar(50) NOT NULL,
	`itemCount` int NOT NULL DEFAULT 0,
	`status` enum('success','failed') NOT NULL DEFAULT 'success',
	`error` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `news_refresh_log_id` PRIMARY KEY(`id`)
);
