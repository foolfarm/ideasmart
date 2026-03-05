ALTER TABLE `subscribers` ADD `unsubscribeToken` varchar(128);--> statement-breakpoint
ALTER TABLE `subscribers` ADD CONSTRAINT `subscribers_unsubscribeToken_unique` UNIQUE(`unsubscribeToken`);