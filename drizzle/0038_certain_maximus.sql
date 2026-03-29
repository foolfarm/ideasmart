CREATE TABLE `saved_articles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`siteUserId` int NOT NULL,
	`contentType` varchar(32) NOT NULL,
	`contentId` int NOT NULL,
	`title` varchar(512) NOT NULL,
	`section` varchar(64),
	`savedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `saved_articles_id` PRIMARY KEY(`id`)
);
