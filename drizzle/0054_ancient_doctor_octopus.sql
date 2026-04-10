CREATE TABLE `offerta_leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`source` enum('creator','editori','aziende') NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`role` varchar(255) NOT NULL,
	`org` varchar(255),
	`message` text,
	`status` enum('new','contacted','closed') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `offerta_leads_id` PRIMARY KEY(`id`)
);
