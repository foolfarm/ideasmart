CREATE TABLE `centro_studi_leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`company` varchar(255),
	`role` varchar(255),
	`sector` varchar(128),
	`interest` enum('abbonamento_report','report_custom','osservatorio','informazioni') NOT NULL DEFAULT 'informazioni',
	`message` text,
	`status` enum('new','contacted','converted') NOT NULL DEFAULT 'new',
	`source` varchar(64) NOT NULL DEFAULT 'osservatorio-tech',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `centro_studi_leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_centro_studi_email` ON `centro_studi_leads` (`email`);--> statement-breakpoint
CREATE INDEX `idx_centro_studi_status` ON `centro_studi_leads` (`status`);