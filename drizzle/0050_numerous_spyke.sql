CREATE TABLE `newsletter_feedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`rating` enum('great','good','meh','bad') NOT NULL,
	`comment` text,
	`email` varchar(320),
	`newsletterDate` varchar(10),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `newsletter_feedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `open_source_tools` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`repoUrl` text NOT NULL,
	`stars` int DEFAULT 0,
	`category` varchar(128),
	`emoji` varchar(10),
	`active` boolean NOT NULL DEFAULT true,
	`featuredDate` varchar(10),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `open_source_tools_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tool_submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`toolName` varchar(255) NOT NULL,
	`toolUrl` text NOT NULL,
	`description` text,
	`submitterEmail` varchar(320),
	`submitterName` varchar(255),
	`status` enum('pending','approved','rejected','featured') NOT NULL DEFAULT 'pending',
	`featuredDate` varchar(10),
	`emoji` varchar(10),
	`shortDescription` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`reviewedAt` timestamp,
	CONSTRAINT `tool_submissions_id` PRIMARY KEY(`id`)
);
