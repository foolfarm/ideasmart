CREATE TABLE `content_audit` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contentType` enum('news','analysis','reportage','startup') NOT NULL,
	`contentId` int NOT NULL,
	`sourceUrl` varchar(1000) NOT NULL,
	`publishedTitle` varchar(500) NOT NULL,
	`publishedSummary` text,
	`status` enum('pending','ok','warning','error','unreachable') NOT NULL DEFAULT 'pending',
	`coherenceScore` float,
	`auditNote` text,
	`extractedText` text,
	`httpStatus` int,
	`section` enum('ai','music') NOT NULL DEFAULT 'ai',
	`auditedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `content_audit_id` PRIMARY KEY(`id`)
);
