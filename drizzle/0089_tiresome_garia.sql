ALTER TABLE `channel_content` ADD `ppvHash` varchar(64);--> statement-breakpoint
ALTER TABLE `channel_content` ADD `ppvDocumentId` int;--> statement-breakpoint
ALTER TABLE `channel_content` ADD `ppvIpfsCid` varchar(128);--> statement-breakpoint
ALTER TABLE `channel_content` ADD `ppvIpfsUrl` varchar(512);--> statement-breakpoint
ALTER TABLE `channel_content` ADD `ppvTrustScore` float;--> statement-breakpoint
ALTER TABLE `channel_content` ADD `ppvTrustGrade` varchar(1);--> statement-breakpoint
ALTER TABLE `channel_content` ADD `ppvCertifiedAt` timestamp;--> statement-breakpoint
ALTER TABLE `channel_content` ADD `ppvReport` json;