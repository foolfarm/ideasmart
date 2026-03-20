ALTER TABLE `linkedin_posts` ADD CONSTRAINT `uq_linkedin_date_slot` UNIQUE(`dateLabel`,`slot`);
