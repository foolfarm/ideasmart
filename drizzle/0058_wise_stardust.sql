ALTER TABLE `newsletter_sends` ADD `approvalToken` varchar(128);--> statement-breakpoint
ALTER TABLE `newsletter_sends` ADD `approvedAt` timestamp;--> statement-breakpoint
ALTER TABLE `newsletter_sends` ADD `approvedBy` varchar(255);--> statement-breakpoint
ALTER TABLE `newsletter_sends` ADD CONSTRAINT `newsletter_sends_approvalToken_unique` UNIQUE(`approvalToken`);