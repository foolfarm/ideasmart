CREATE TABLE `osservatorio_articles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dateLabel` varchar(20) NOT NULL,
	`title` varchar(500) NOT NULL,
	`excerpt` text,
	`articleUrl` varchar(1000) NOT NULL,
	`publication` varchar(255) NOT NULL DEFAULT 'ProofPress',
	`imageUrl` varchar(1000),
	`tags` varchar(500),
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `osservatorio_articles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_osservatorio_date` ON `osservatorio_articles` (`dateLabel`);--> statement-breakpoint
CREATE INDEX `idx_osservatorio_sort` ON `osservatorio_articles` (`sortOrder`);