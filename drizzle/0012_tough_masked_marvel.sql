CREATE TABLE `article_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`section` enum('ai','music') NOT NULL DEFAULT 'ai',
	`articleType` enum('news','editorial','startup','reportage','analysis') NOT NULL,
	`articleId` int NOT NULL,
	`authorName` varchar(255) NOT NULL,
	`authorEmail` varchar(320),
	`content` text NOT NULL,
	`approved` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `article_comments_id` PRIMARY KEY(`id`)
);
