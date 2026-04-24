CREATE TABLE `osservatorio_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`articleId` int NOT NULL,
	`userId` int,
	`siteUserId` int,
	`authorName` varchar(255) NOT NULL,
	`body` text NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `osservatorio_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_comments_article` ON `osservatorio_comments` (`articleId`);--> statement-breakpoint
CREATE INDEX `idx_comments_status` ON `osservatorio_comments` (`status`);