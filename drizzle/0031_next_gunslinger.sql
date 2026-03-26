CREATE TABLE `breaking_news` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`summary` text NOT NULL,
	`sourceUrl` varchar(1000) NOT NULL,
	`sourceName` varchar(255) NOT NULL,
	`section` enum('ai','music','startup','finance','health','sport','luxury','news','motori','tennis','basket','gossip','cybersecurity','sondaggi') NOT NULL DEFAULT 'news',
	`urgencyScore` int NOT NULL DEFAULT 5,
	`breakingReason` varchar(500),
	`publishedAt` varchar(50),
	`isActive` boolean NOT NULL DEFAULT true,
	`newsItemId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `breaking_news_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_breaking_active_created` ON `breaking_news` (`isActive`,`createdAt`);