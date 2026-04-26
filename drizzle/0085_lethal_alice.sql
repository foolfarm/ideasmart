CREATE TABLE `creator_quotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectType` enum('giornale_settoriale','newsletter_aziendale','blog_aziendale','media_startup','altro') NOT NULL,
	`sectorType` enum('mono','multi') NOT NULL,
	`sectors` json NOT NULL,
	`sourcesCount` enum('fino_a_10','10_50','50_100','oltre_100') NOT NULL,
	`includeVerify` tinyint NOT NULL DEFAULT 0,
	`llmType` enum('incluso','proprio') NOT NULL,
	`llmQuality` enum('base','medio','top') NOT NULL,
	`publishFrequency` enum('giornaliera','settimanale','mensile') NOT NULL,
	`contactName` varchar(255) NOT NULL,
	`contactEmail` varchar(255) NOT NULL,
	`contactCompany` varchar(255),
	`contactPhone` varchar(50),
	`notes` text,
	`status` enum('new','contacted','qualified','closed') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `creator_quotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_creator_quotes_status` ON `creator_quotes` (`status`);--> statement-breakpoint
CREATE INDEX `idx_creator_quotes_email` ON `creator_quotes` (`contactEmail`);--> statement-breakpoint
CREATE INDEX `idx_creator_quotes_created` ON `creator_quotes` (`createdAt`);