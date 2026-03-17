CREATE TABLE `barometro_snapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dateLabel` varchar(20) NOT NULL,
	`partito` varchar(50) NOT NULL,
	`partitoNome` varchar(200),
	`percentuale` float NOT NULL,
	`colore` varchar(20),
	`fonte` varchar(200),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `barometro_snapshots_id` PRIMARY KEY(`id`)
);
