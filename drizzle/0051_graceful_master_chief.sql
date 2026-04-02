CREATE TABLE `channel_content` (
	`id` int AUTO_INCREMENT NOT NULL,
	`channel` enum('start-here','copy-paste-ai','automate-with-ai','make-money-with-ai','daily-ai-tools','verified-ai-news','ai-opportunities') NOT NULL,
	`title` varchar(500) NOT NULL,
	`subtitle` varchar(500),
	`body` text NOT NULL,
	`category` varchar(128),
	`actionItem` text,
	`promptText` text,
	`sourceUrl` varchar(1000),
	`sourceName` varchar(255),
	`imageUrl` varchar(1000),
	`externalUrl` varchar(1000),
	`publishDate` varchar(10) NOT NULL,
	`position` int NOT NULL DEFAULT 0,
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'published',
	`viewCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `channel_content_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rss_feed_sources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`channel` enum('copy-paste-ai','automate-with-ai','make-money-with-ai','daily-ai-tools','verified-ai-news','ai-opportunities') NOT NULL,
	`name` varchar(255) NOT NULL,
	`feedUrl` varchar(1000) NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`lastFetchedAt` timestamp,
	`errorCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rss_feed_sources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rss_ingest_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`articleUrl` varchar(1000) NOT NULL,
	`originalTitle` varchar(500),
	`channel` varchar(64) NOT NULL,
	`channelContentId` int,
	`status` enum('processed','skipped','error') NOT NULL DEFAULT 'processed',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rss_ingest_log_id` PRIMARY KEY(`id`),
	CONSTRAINT `idx_rss_ingest_article_url` UNIQUE(`articleUrl`)
);
--> statement-breakpoint
CREATE INDEX `idx_channel_content_channel` ON `channel_content` (`channel`);--> statement-breakpoint
CREATE INDEX `idx_channel_content_channel_date` ON `channel_content` (`channel`,`publishDate`);