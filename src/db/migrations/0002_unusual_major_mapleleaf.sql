ALTER TABLE `accounts` RENAME TO `account`;--> statement-breakpoint
ALTER TABLE `sessions` RENAME TO `session`;--> statement-breakpoint
ALTER TABLE `users` RENAME TO `user`;--> statement-breakpoint
ALTER TABLE `verification_tokens` RENAME TO `verificationToken`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_account` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`type` text NOT NULL,
	`provider` text NOT NULL,
	`providerAccountId` text NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` integer,
	`token_type` text,
	`scope` text,
	`id_token` text,
	`session_state` text,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_account`("id", "userId", "type", "provider", "providerAccountId", "refresh_token", "access_token", "expires_at", "token_type", "scope", "id_token", "session_state") SELECT "id", "userId", "type", "provider", "providerAccountId", "refresh_token", "access_token", "expires_at", "token_type", "scope", "id_token", "session_state" FROM `account`;--> statement-breakpoint
DROP TABLE `account`;--> statement-breakpoint
ALTER TABLE `__new_account` RENAME TO `account`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_session` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`sessionToken` text NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_session`("id", "userId", "sessionToken", "expires") SELECT "id", "userId", "sessionToken", "expires" FROM `session`;--> statement-breakpoint
DROP TABLE `session`;--> statement-breakpoint
ALTER TABLE `__new_session` RENAME TO `session`;--> statement-breakpoint
CREATE UNIQUE INDEX `session_sessionToken_unique` ON `session` (`sessionToken`);--> statement-breakpoint
DROP INDEX `users_email_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `__new_canvases` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`pool_id` text,
	`creator_id` text,
	`content` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`pool_id`) REFERENCES `pools`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_canvases`("id", "name", "pool_id", "creator_id", "content", "created_at", "updated_at") SELECT "id", "name", "pool_id", "creator_id", "content", "created_at", "updated_at" FROM `canvases`;--> statement-breakpoint
DROP TABLE `canvases`;--> statement-breakpoint
ALTER TABLE `__new_canvases` RENAME TO `canvases`;--> statement-breakpoint
CREATE TABLE `__new_files` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`size` integer NOT NULL,
	`type` text NOT NULL,
	`pool_id` text,
	`uploader_id` text,
	`uploaded_at` integer,
	FOREIGN KEY (`pool_id`) REFERENCES `pools`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`uploader_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_files`("id", "name", "url", "size", "type", "pool_id", "uploader_id", "uploaded_at") SELECT "id", "name", "url", "size", "type", "pool_id", "uploader_id", "uploaded_at" FROM `files`;--> statement-breakpoint
DROP TABLE `files`;--> statement-breakpoint
ALTER TABLE `__new_files` RENAME TO `files`;--> statement-breakpoint
CREATE TABLE `__new_pool_members` (
	`id` text PRIMARY KEY NOT NULL,
	`pool_id` text,
	`user_id` text,
	`role` text,
	`joined_at` integer,
	FOREIGN KEY (`pool_id`) REFERENCES `pools`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_pool_members`("id", "pool_id", "user_id", "role", "joined_at") SELECT "id", "pool_id", "user_id", "role", "joined_at" FROM `pool_members`;--> statement-breakpoint
DROP TABLE `pool_members`;--> statement-breakpoint
ALTER TABLE `__new_pool_members` RENAME TO `pool_members`;--> statement-breakpoint
CREATE TABLE `__new_pools` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`creator_id` text,
	`created_at` integer,
	FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_pools`("id", "name", "creator_id", "created_at") SELECT "id", "name", "creator_id", "created_at" FROM `pools`;--> statement-breakpoint
DROP TABLE `pools`;--> statement-breakpoint
ALTER TABLE `__new_pools` RENAME TO `pools`;