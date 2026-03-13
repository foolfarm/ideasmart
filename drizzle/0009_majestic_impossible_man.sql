CREATE TABLE `email_opens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`subscriberEmail` varchar(320) NOT NULL,
	`campaignId` varchar(128) NOT NULL,
	`campaignSubject` varchar(500),
	`openedAt` timestamp NOT NULL DEFAULT (now()),
	`userAgent` varchar(500),
	`ipAddress` varchar(64),
	CONSTRAINT `email_opens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `newsletter_sends` ADD `openedCount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `subscribers` ADD `totalSent` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `subscribers` ADD `totalOpened` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `subscribers` ADD `lastSentAt` timestamp;--> statement-breakpoint
ALTER TABLE `subscribers` ADD `lastOpenedAt` timestamp;