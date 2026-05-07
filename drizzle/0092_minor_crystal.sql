CREATE TABLE `creator_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`customerEmail` varchar(320) NOT NULL,
	`customerName` varchar(255),
	`stripeCustomerId` varchar(255),
	`stripeSubscriptionId` varchar(255),
	`stripeSessionId` varchar(255),
	`creatorPlanId` enum('creator_basic','creator_plus','creator_gold') NOT NULL,
	`planName` varchar(128) NOT NULL,
	`priceMonthly` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'EUR',
	`creatorStatus` enum('active','past_due','cancelled','incomplete','trialing') NOT NULL DEFAULT 'active',
	`currentPeriodStart` timestamp,
	`currentPeriodEnd` timestamp,
	`cancelledAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `creator_subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `creator_subscriptions_stripeSubscriptionId_unique` UNIQUE(`stripeSubscriptionId`),
	CONSTRAINT `creator_subscriptions_stripeSessionId_unique` UNIQUE(`stripeSessionId`)
);
--> statement-breakpoint
CREATE INDEX `idx_cr_sub_email` ON `creator_subscriptions` (`customerEmail`);--> statement-breakpoint
CREATE INDEX `idx_cr_sub_user` ON `creator_subscriptions` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_cr_sub_stripe` ON `creator_subscriptions` (`stripeSubscriptionId`);--> statement-breakpoint
CREATE INDEX `idx_cr_sub_status` ON `creator_subscriptions` (`creatorStatus`);