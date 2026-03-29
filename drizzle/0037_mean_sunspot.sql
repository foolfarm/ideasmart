CREATE TABLE `site_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(64) NOT NULL,
	`email` varchar(320) NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`emailVerified` boolean NOT NULL DEFAULT false,
	`verificationToken` varchar(128),
	`verificationTokenExpiresAt` timestamp,
	`sessionToken` varchar(255),
	`sessionExpiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`lastLoginAt` timestamp,
	CONSTRAINT `site_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `site_users_username_unique` UNIQUE(`username`),
	CONSTRAINT `site_users_email_unique` UNIQUE(`email`),
	CONSTRAINT `site_users_verificationToken_unique` UNIQUE(`verificationToken`),
	CONSTRAINT `site_users_sessionToken_unique` UNIQUE(`sessionToken`)
);
