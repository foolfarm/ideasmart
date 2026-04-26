CREATE TABLE `verify_quotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productType` enum('news_verify','info_verify','email_verify') NOT NULL,
	`volumePerMonth` enum('fino_a_100','100_1000','1000_10000','oltre_10000') NOT NULL,
	`integrationMode` enum('api','dashboard','entrambi') NOT NULL,
	`sectors` json NOT NULL,
	`sourcesCount` enum('fino_a_10','10_50','50_100','oltre_100'),
	`includeIpfs` tinyint NOT NULL DEFAULT 0,
	`contentType` enum('documenti_aziendali','comunicati_stampa','report_analisi','contenuti_social','altro'),
	`emailPlatform` enum('sendgrid','mailchimp','hubspot','altro','non_so'),
	`listSize` enum('fino_a_1000','1000_10000','10000_100000','oltre_100000'),
	`contactName` varchar(255) NOT NULL,
	`contactEmail` varchar(255) NOT NULL,
	`contactCompany` varchar(255),
	`contactPhone` varchar(50),
	`notes` text,
	`status` enum('new','contacted','qualified','closed') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `verify_quotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_verify_quotes_product` ON `verify_quotes` (`productType`);--> statement-breakpoint
CREATE INDEX `idx_verify_quotes_status` ON `verify_quotes` (`status`);--> statement-breakpoint
CREATE INDEX `idx_verify_quotes_email` ON `verify_quotes` (`contactEmail`);