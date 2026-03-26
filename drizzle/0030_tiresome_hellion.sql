ALTER TABLE `news_items` ADD `viewCount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `news_items` ADD `lastViewedAt` timestamp;