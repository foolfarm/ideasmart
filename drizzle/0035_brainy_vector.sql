ALTER TABLE `linkedin_posts` ADD `postHash` varchar(64);--> statement-breakpoint
CREATE INDEX `idx_linkedin_post_hash` ON `linkedin_posts` (`postHash`);