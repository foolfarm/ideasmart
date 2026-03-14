ALTER TABLE `article_comments` MODIFY COLUMN `section` enum('ai','music','startup') NOT NULL DEFAULT 'ai';--> statement-breakpoint
ALTER TABLE `daily_editorial` MODIFY COLUMN `section` enum('ai','music','startup') NOT NULL DEFAULT 'ai';--> statement-breakpoint
ALTER TABLE `market_analysis` MODIFY COLUMN `section` enum('ai','music','startup') NOT NULL DEFAULT 'ai';--> statement-breakpoint
ALTER TABLE `news_items` MODIFY COLUMN `section` enum('ai','music','startup') NOT NULL DEFAULT 'ai';--> statement-breakpoint
ALTER TABLE `newsletter_sends` MODIFY COLUMN `section` enum('ai4business','itsmusic','startup') NOT NULL DEFAULT 'ai4business';--> statement-breakpoint
ALTER TABLE `startup_of_day` MODIFY COLUMN `section` enum('ai','music','startup') NOT NULL DEFAULT 'ai';--> statement-breakpoint
ALTER TABLE `subscribers` MODIFY COLUMN `newsletter` enum('ai4business','itsmusic','startup','both') NOT NULL DEFAULT 'ai4business';--> statement-breakpoint
ALTER TABLE `weekly_reportage` MODIFY COLUMN `section` enum('ai','music','startup') NOT NULL DEFAULT 'ai';--> statement-breakpoint
ALTER TABLE `startup_of_day` DROP COLUMN `dateLabel`;