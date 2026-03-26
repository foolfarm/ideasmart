CREATE TABLE `research_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(300) NOT NULL,
	`summary` text NOT NULL,
	`key_findings` text NOT NULL,
	`source` varchar(200) NOT NULL,
	`source_url` varchar(1000),
	`category` varchar(100) NOT NULL,
	`region` varchar(100) NOT NULL DEFAULT 'global',
	`date_label` varchar(10) NOT NULL,
	`is_research_of_day` boolean NOT NULL DEFAULT false,
	`view_count` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `research_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_research_date` ON `research_reports` (`date_label`);--> statement-breakpoint
CREATE INDEX `idx_research_category` ON `research_reports` (`category`);--> statement-breakpoint
CREATE INDEX `idx_research_of_day` ON `research_reports` (`is_research_of_day`,`date_label`);