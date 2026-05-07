CREATE TABLE `base_alpha_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`customerEmail` varchar(320) NOT NULL,
	`customerName` varchar(255),
	`stripeCustomerId` varchar(255),
	`stripeSubscriptionId` varchar(255),
	`stripeSessionId` varchar(255),
	`planId` enum('weekly','monthly','quarterly') NOT NULL,
	`planName` varchar(128) NOT NULL,
	`priceMonthly` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'EUR',
	`status` enum('active','past_due','cancelled','incomplete','trialing') NOT NULL DEFAULT 'active',
	`currentPeriodStart` timestamp,
	`currentPeriodEnd` timestamp,
	`cancelledAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `base_alpha_subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `base_alpha_subscriptions_stripeSubscriptionId_unique` UNIQUE(`stripeSubscriptionId`),
	CONSTRAINT `base_alpha_subscriptions_stripeSessionId_unique` UNIQUE(`stripeSessionId`)
);
--> statement-breakpoint
CREATE INDEX `idx_ba_sub_email` ON `base_alpha_subscriptions` (`customerEmail`);--> statement-breakpoint
CREATE INDEX `idx_ba_sub_user` ON `base_alpha_subscriptions` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_ba_sub_stripe` ON `base_alpha_subscriptions` (`stripeSubscriptionId`);--> statement-breakpoint
CREATE INDEX `idx_ba_sub_status` ON `base_alpha_subscriptions` (`status`);