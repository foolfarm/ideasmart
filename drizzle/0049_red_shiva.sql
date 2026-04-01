CREATE TABLE `dealflow_picks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`publishDate` varchar(10) NOT NULL,
	`rank` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`funding` varchar(255),
	`valuation` varchar(255),
	`rating` enum('INVEST','INVEST+','INVEST++') NOT NULL,
	`link` text,
	`source` varchar(128),
	`sector` varchar(128),
	`country` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dealflow_picks_id` PRIMARY KEY(`id`)
);
