CREATE TABLE `tech_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`externalUid` varchar(500) NOT NULL,
	`source` varchar(100) NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` text,
	`location` varchar(500),
	`eventUrl` varchar(1000),
	`startAt` timestamp NOT NULL,
	`endAt` timestamp,
	`category` enum('ai','startup','vc','tech','innovation','other') NOT NULL DEFAULT 'tech',
	`organizer` varchar(255),
	`isOnline` boolean NOT NULL DEFAULT false,
	`isFree` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tech_events_id` PRIMARY KEY(`id`),
	CONSTRAINT `tech_events_externalUid_unique` UNIQUE(`externalUid`)
);
--> statement-breakpoint
CREATE INDEX `idx_events_start_at` ON `tech_events` (`startAt`);--> statement-breakpoint
CREATE INDEX `idx_events_category_start` ON `tech_events` (`category`,`startAt`);