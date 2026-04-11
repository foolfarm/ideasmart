CREATE TABLE `alert_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('health_check','diversity','linkedin','newsletter','system') NOT NULL,
	`severity` enum('critical','warning','info') NOT NULL DEFAULT 'warning',
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`emailSent` boolean NOT NULL DEFAULT false,
	`read` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `alert_logs_id` PRIMARY KEY(`id`)
);
