CREATE TABLE `verify_api_keys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`keyPrefix` varchar(16) NOT NULL,
	`keyHash` varchar(64) NOT NULL,
	`label` varchar(128),
	`canVerify` boolean NOT NULL DEFAULT true,
	`canReadReports` boolean NOT NULL DEFAULT true,
	`canManageOrg` boolean NOT NULL DEFAULT false,
	`rateLimit` int NOT NULL DEFAULT 100,
	`isActive` boolean NOT NULL DEFAULT true,
	`lastUsedAt` timestamp,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`revokedAt` timestamp,
	CONSTRAINT `verify_api_keys_id` PRIMARY KEY(`id`),
	CONSTRAINT `verify_api_keys_keyHash_unique` UNIQUE(`keyHash`),
	CONSTRAINT `uq_verify_apikey_hash` UNIQUE(`keyHash`)
);
--> statement-breakpoint
CREATE TABLE `verify_organizations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(128) NOT NULL,
	`name` varchar(255) NOT NULL,
	`domain` varchar(255),
	`contactEmail` varchar(320) NOT NULL,
	`contactName` varchar(255),
	`plan` enum('essential','premiere','professional','custom') NOT NULL DEFAULT 'essential',
	`stripeCustomerId` varchar(255),
	`status` enum('trial','active','suspended','cancelled') NOT NULL DEFAULT 'trial',
	`notes` text,
	`trialEndsAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `verify_organizations_id` PRIMARY KEY(`id`),
	CONSTRAINT `verify_organizations_slug_unique` UNIQUE(`slug`),
	CONSTRAINT `uq_verify_org_slug` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `verify_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`plan` enum('essential','premiere','professional','custom') NOT NULL,
	`articlesLimit` int NOT NULL,
	`journalistSeats` int NOT NULL DEFAULT 2,
	`articlesUsed` int NOT NULL DEFAULT 0,
	`periodStart` timestamp NOT NULL,
	`periodEnd` timestamp NOT NULL,
	`stripeSubscriptionId` varchar(255),
	`stripeStatus` varchar(64),
	`priceMonthly` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'EUR',
	`status` enum('active','past_due','cancelled','trial') NOT NULL DEFAULT 'trial',
	`cancelledAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `verify_subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `verify_api_keys` ADD CONSTRAINT `verify_api_keys_organizationId_verify_organizations_id_fk` FOREIGN KEY (`organizationId`) REFERENCES `verify_organizations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `verify_subscriptions` ADD CONSTRAINT `verify_subscriptions_organizationId_verify_organizations_id_fk` FOREIGN KEY (`organizationId`) REFERENCES `verify_organizations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_verify_apikey_org` ON `verify_api_keys` (`organizationId`);--> statement-breakpoint
CREATE INDEX `idx_verify_org_status` ON `verify_organizations` (`status`);--> statement-breakpoint
CREATE INDEX `idx_verify_sub_org` ON `verify_subscriptions` (`organizationId`);--> statement-breakpoint
CREATE INDEX `idx_verify_sub_stripe` ON `verify_subscriptions` (`stripeSubscriptionId`);--> statement-breakpoint
CREATE INDEX `idx_verify_sub_status` ON `verify_subscriptions` (`status`);