CREATE TABLE `demo_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`profileType` enum('giornalista_freelance','editore_digitale','creator_analista','media_company','altro') NOT NULL,
	`message` text,
	`status` enum('new','contacted','demo_done','converted','archived') NOT NULL DEFAULT 'new',
	`notified` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `demo_requests_id` PRIMARY KEY(`id`)
);
