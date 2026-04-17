CREATE TABLE `journalist_articles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`journalistId` int NOT NULL,
	`title` varchar(500) NOT NULL,
	`body` mediumtext NOT NULL,
	`summary` text,
	`category` varchar(100) NOT NULL,
	`imageUrl` varchar(1000),
	`status` enum('draft','review','published','rejected') NOT NULL DEFAULT 'draft',
	`verifyHash` varchar(64),
	`verifyBadge` varchar(32),
	`verifyReport` json,
	`trustScore` float,
	`trustGrade` varchar(1),
	`publishedAt` timestamp,
	`newsItemId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `journalist_articles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `journalists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(64) NOT NULL,
	`email` varchar(320) NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`displayName` varchar(255) NOT NULL,
	`bio` text,
	`avatarUrl` varchar(1000),
	`linkedinUrl` varchar(500),
	`journalistKey` varchar(64) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`sessionToken` varchar(255),
	`sessionExpiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`lastLoginAt` timestamp,
	`totalArticles` int NOT NULL DEFAULT 0,
	`avgTrustScore` float,
	CONSTRAINT `journalists_id` PRIMARY KEY(`id`),
	CONSTRAINT `journalists_username_unique` UNIQUE(`username`),
	CONSTRAINT `journalists_email_unique` UNIQUE(`email`),
	CONSTRAINT `journalists_journalistKey_unique` UNIQUE(`journalistKey`),
	CONSTRAINT `journalists_sessionToken_unique` UNIQUE(`sessionToken`)
);
--> statement-breakpoint
ALTER TABLE `journalist_articles` ADD CONSTRAINT `journalist_articles_journalistId_journalists_id_fk` FOREIGN KEY (`journalistId`) REFERENCES `journalists`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_ja_journalist` ON `journalist_articles` (`journalistId`);--> statement-breakpoint
CREATE INDEX `idx_ja_status` ON `journalist_articles` (`status`);