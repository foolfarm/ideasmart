CREATE TABLE `linkedin_comment_replies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`commentUrn` varchar(500) NOT NULL,
	`postUrn` varchar(500) NOT NULL,
	`commenterName` varchar(200),
	`commentText` text,
	`replyText` text,
	`replyUrn` varchar(500),
	`status` enum('pending','replied','skipped','error') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`repliedAt` timestamp,
	CONSTRAINT `linkedin_comment_replies_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_linkedin_comment_urn` UNIQUE(`commentUrn`)
);
