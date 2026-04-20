ALTER TABLE `banner_events` MODIFY COLUMN `slot` enum('left','right','sidebar','horizontal','all','newsletter') NOT NULL;--> statement-breakpoint
ALTER TABLE `banner_events` ADD `source` enum('web','newsletter') DEFAULT 'web' NOT NULL;--> statement-breakpoint
ALTER TABLE `banner_events` ADD `newsletterSendId` int;--> statement-breakpoint
ALTER TABLE `banners` ADD `newsletterClicks` int DEFAULT 0 NOT NULL;