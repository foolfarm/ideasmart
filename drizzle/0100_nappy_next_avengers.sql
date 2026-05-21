CREATE TABLE `personaggi` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`role` varchar(255),
	`company` varchar(255),
	`country` varchar(10) NOT NULL DEFAULT 'IT',
	`bio` mediumtext,
	`full_bio` mediumtext,
	`image_url` varchar(1024),
	`cover_image_url` varchar(1024),
	`personaggio_category` enum('founder','investor','executive','researcher','journalist','other') NOT NULL DEFAULT 'founder',
	`tags` json,
	`funding_raised` varchar(128),
	`exits` int DEFAULT 0,
	`companies_count` int DEFAULT 1,
	`linkedin_url` varchar(512),
	`twitter_url` varchar(512),
	`website_url` varchar(512),
	`quote` mediumtext,
	`quote_source` varchar(255),
	`featured` boolean DEFAULT false,
	`is_italian` boolean DEFAULT true,
	`view_count` int DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `personaggi_id` PRIMARY KEY(`id`),
	CONSTRAINT `personaggi_slug_unique` UNIQUE(`slug`),
	CONSTRAINT `idx_personaggi_slug` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE INDEX `idx_personaggi_category` ON `personaggi` (`personaggio_category`);--> statement-breakpoint
CREATE INDEX `idx_personaggi_country` ON `personaggi` (`country`);--> statement-breakpoint
CREATE INDEX `idx_personaggi_featured` ON `personaggi` (`featured`);--> statement-breakpoint
CREATE INDEX `idx_personaggi_italian` ON `personaggi` (`is_italian`);