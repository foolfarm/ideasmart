CREATE TABLE `notification_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` varchar(255),
	`notifyNews` boolean NOT NULL DEFAULT true,
	`notifyEditorial` boolean NOT NULL DEFAULT true,
	`notifyStartup` boolean NOT NULL DEFAULT true,
	`notifyReportage` boolean NOT NULL DEFAULT false,
	`notifyMarket` boolean NOT NULL DEFAULT false,
	`frequency` enum('daily','weekly','realtime') NOT NULL DEFAULT 'daily',
	`categories` text,
	`prefsToken` varchar(128),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `notification_preferences_email_unique` UNIQUE(`email`),
	CONSTRAINT `notification_preferences_prefsToken_unique` UNIQUE(`prefsToken`)
);
