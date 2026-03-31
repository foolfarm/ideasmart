CREATE TABLE `health_check_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`allOk` boolean NOT NULL,
	`totalChecks` int NOT NULL,
	`passedChecks` int NOT NULL,
	`failedChecks` int NOT NULL,
	`totalTimeMs` int NOT NULL,
	`failedDetails` text,
	`fullReport` text,
	`alertSent` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `health_check_logs_id` PRIMARY KEY(`id`)
);
