CREATE INDEX `idx_news_section` ON `news_items` (`section`);--> statement-breakpoint
CREATE INDEX `idx_news_section_position` ON `news_items` (`section`,`position`);