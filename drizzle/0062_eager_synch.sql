CREATE TABLE `banner_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bannerId` int NOT NULL,
	`eventType` enum('impression','click') NOT NULL,
	`slot` enum('left','right') NOT NULL,
	`userAgent` varchar(512),
	`referrer` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `banner_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `banner_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`rotationIntervalMs` int NOT NULL DEFAULT 15000,
	`transition` enum('fade','slide','none') NOT NULL DEFAULT 'fade',
	`transitionDurationMs` int NOT NULL DEFAULT 400,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `banner_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `banners` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`imageUrl` text NOT NULL,
	`imageKey` varchar(512),
	`clickUrl` text NOT NULL,
	`slot` enum('left','right','both') NOT NULL DEFAULT 'both',
	`active` boolean NOT NULL DEFAULT true,
	`weight` int NOT NULL DEFAULT 5,
	`startsAt` timestamp,
	`endsAt` timestamp,
	`impressions` int NOT NULL DEFAULT 0,
	`clicks` int NOT NULL DEFAULT 0,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `banners_id` PRIMARY KEY(`id`)
);
