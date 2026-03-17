CREATE TABLE `linkedin_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dateLabel` varchar(20) NOT NULL,
	`postText` text NOT NULL,
	`linkedinUrl` varchar(1000),
	`title` varchar(500),
	`section` enum('ai','music','startup','finance','health','sport','luxury','news','motori','tennis','basket','gossip','cybersecurity','sondaggi') NOT NULL DEFAULT 'ai',
	`imageUrl` varchar(1000),
	`hashtags` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `linkedin_posts_id` PRIMARY KEY(`id`),
	CONSTRAINT `linkedin_posts_dateLabel_unique` UNIQUE(`dateLabel`)
);
