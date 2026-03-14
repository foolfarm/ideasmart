ALTER TABLE `daily_editorial` ADD `section` enum('ai','music') DEFAULT 'ai' NOT NULL;--> statement-breakpoint
ALTER TABLE `market_analysis` ADD `section` enum('ai','music') DEFAULT 'ai' NOT NULL;--> statement-breakpoint
ALTER TABLE `news_items` ADD `section` enum('ai','music') DEFAULT 'ai' NOT NULL;--> statement-breakpoint
ALTER TABLE `newsletter_sends` ADD `section` enum('ai4business','itsmusic') DEFAULT 'ai4business' NOT NULL;--> statement-breakpoint
ALTER TABLE `startup_of_day` ADD `section` enum('ai','music') DEFAULT 'ai' NOT NULL;--> statement-breakpoint
ALTER TABLE `subscribers` ADD `newsletter` enum('ai4business','itsmusic','both') DEFAULT 'ai4business' NOT NULL;--> statement-breakpoint
ALTER TABLE `weekly_reportage` ADD `section` enum('ai','music') DEFAULT 'ai' NOT NULL;