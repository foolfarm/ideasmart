CREATE TABLE `source_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`section` enum('ai','music','startup') NOT NULL,
	`articleType` enum('news','editorial','startup','reportage','analysis') NOT NULL,
	`articleId` int NOT NULL,
	`reportedUrl` varchar(1000),
	`reason` enum('not_found','wrong_content','broken_link','spam','other') NOT NULL,
	`note` varchar(500),
	`ipHash` varchar(64),
	`status` enum('pending','reviewed','resolved') NOT NULL DEFAULT 'pending',
	`adminNote` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`resolvedAt` timestamp,
	CONSTRAINT `source_reports_id` PRIMARY KEY(`id`)
);
