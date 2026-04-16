ALTER TABLE `news_items` ADD `verifyReport` json;--> statement-breakpoint
ALTER TABLE `news_items` ADD `trustScore` float;--> statement-breakpoint
ALTER TABLE `news_items` ADD `trustGrade` varchar(1);