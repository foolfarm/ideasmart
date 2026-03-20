ALTER TABLE `linkedin_posts` DROP INDEX `linkedin_posts_dateLabel_unique`;--> statement-breakpoint
ALTER TABLE `linkedin_posts` ADD `slot` enum('morning','afternoon') DEFAULT 'morning' NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_linkedin_date_slot` ON `linkedin_posts` (`dateLabel`,`slot`);