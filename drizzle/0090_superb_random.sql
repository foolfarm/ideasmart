ALTER TABLE `news_items` ADD `ppvHash` varchar(64);--> statement-breakpoint
ALTER TABLE `news_items` ADD `ppvDocumentId` int;--> statement-breakpoint
ALTER TABLE `news_items` ADD `ppvIpfsCid` varchar(128);--> statement-breakpoint
ALTER TABLE `news_items` ADD `ppvIpfsUrl` varchar(512);--> statement-breakpoint
ALTER TABLE `news_items` ADD `ppvTrustScore` float;--> statement-breakpoint
ALTER TABLE `news_items` ADD `ppvTrustGrade` varchar(1);--> statement-breakpoint
ALTER TABLE `news_items` ADD `ppvCertifiedAt` timestamp;--> statement-breakpoint
ALTER TABLE `news_items` ADD `ppvReport` json;