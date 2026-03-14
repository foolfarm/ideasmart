ALTER TABLE `content_audit` MODIFY COLUMN `section` enum('ai','music','startup') NOT NULL DEFAULT 'ai';--> statement-breakpoint
ALTER TABLE `startup_of_day` ADD `dateLabel` varchar(20);