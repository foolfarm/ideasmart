ALTER TABLE `newsletter_sends` ADD `send_date` varchar(10);--> statement-breakpoint
ALTER TABLE `newsletter_sends` ADD CONSTRAINT `uq_newsletter_send_date_section` UNIQUE(`send_date`,`section`);