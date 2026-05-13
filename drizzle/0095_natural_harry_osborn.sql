ALTER TABLE `newsletter_sends` DROP INDEX `uq_newsletter_send_date_section`;--> statement-breakpoint
ALTER TABLE `newsletter_sends` ADD `newsletter_type` enum('morning','ppv') DEFAULT 'morning' NOT NULL;--> statement-breakpoint
ALTER TABLE `newsletter_sends` ADD `sent_count` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `newsletter_sends` ADD `failed_count` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `newsletter_sends` ADD CONSTRAINT `uq_newsletter_send_date_type` UNIQUE(`send_date`,`newsletter_type`);