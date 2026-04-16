ALTER TABLE `news_items` ADD `ipfsCid` varchar(128);--> statement-breakpoint
ALTER TABLE `news_items` ADD `ipfsUrl` varchar(512);--> statement-breakpoint
ALTER TABLE `news_items` ADD `ipfsPinnedAt` timestamp;