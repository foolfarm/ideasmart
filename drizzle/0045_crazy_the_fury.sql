CREATE TABLE `newsletter_sponsors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`headline` varchar(500) NOT NULL,
	`description` text NOT NULL,
	`url` varchar(1000) NOT NULL,
	`imageUrl` varchar(1000),
	`features` text,
	`ctaText` varchar(100) NOT NULL DEFAULT 'Scopri di più →',
	`placement` enum('primary','spotlight') NOT NULL DEFAULT 'primary',
	`active` boolean NOT NULL DEFAULT true,
	`weight` int NOT NULL DEFAULT 1,
	`sendCount` int NOT NULL DEFAULT 0,
	`lastSentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `newsletter_sponsors_id` PRIMARY KEY(`id`)
);
