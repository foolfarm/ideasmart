CREATE TABLE `daily_editorial` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dateLabel` varchar(20) NOT NULL,
	`title` varchar(500) NOT NULL,
	`subtitle` varchar(500),
	`body` text NOT NULL,
	`keyTrend` varchar(255),
	`authorNote` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `daily_editorial_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `startup_of_day` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dateLabel` varchar(20) NOT NULL,
	`name` varchar(255) NOT NULL,
	`tagline` varchar(500) NOT NULL,
	`description` text NOT NULL,
	`category` varchar(100) NOT NULL,
	`country` varchar(100) DEFAULT 'Italia',
	`foundedYear` varchar(10),
	`funding` varchar(255),
	`whyToday` text NOT NULL,
	`websiteUrl` varchar(500),
	`linkedinUrl` varchar(500),
	`aiScore` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `startup_of_day_id` PRIMARY KEY(`id`)
);
