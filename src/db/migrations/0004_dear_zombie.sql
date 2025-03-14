ALTER TABLE `canvases` RENAME TO `canvas`;--> statement-breakpoint
ALTER TABLE `files` RENAME TO `file`;--> statement-breakpoint
ALTER TABLE `pool_members` RENAME TO `pool_member`;--> statement-breakpoint
ALTER TABLE `pools` RENAME TO `pool`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_canvas` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`pool_id` text,
	`creator_id` text,
	`content` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`pool_id`) REFERENCES `pool`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_canvas`("id", "name", "pool_id", "creator_id", "content", "created_at", "updated_at") SELECT "id", "name", "pool_id", "creator_id", "content", "created_at", "updated_at" FROM `canvas`;--> statement-breakpoint
DROP TABLE `canvas`;--> statement-breakpoint
ALTER TABLE `__new_canvas` RENAME TO `canvas`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_file` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`size` integer NOT NULL,
	`type` text NOT NULL,
	`pool_id` text,
	`uploader_id` text,
	`uploaded_at` integer,
	FOREIGN KEY (`pool_id`) REFERENCES `pool`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`uploader_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_file`("id", "name", "url", "size", "type", "pool_id", "uploader_id", "uploaded_at") SELECT "id", "name", "url", "size", "type", "pool_id", "uploader_id", "uploaded_at" FROM `file`;--> statement-breakpoint
DROP TABLE `file`;--> statement-breakpoint
ALTER TABLE `__new_file` RENAME TO `file`;--> statement-breakpoint
CREATE TABLE `__new_pool_member` (
	`id` text PRIMARY KEY NOT NULL,
	`pool_id` text,
	`user_id` text,
	`role` text,
	`joined_at` integer,
	FOREIGN KEY (`pool_id`) REFERENCES `pool`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_pool_member`("id", "pool_id", "user_id", "role", "joined_at") SELECT "id", "pool_id", "user_id", "role", "joined_at" FROM `pool_member`;--> statement-breakpoint
DROP TABLE `pool_member`;--> statement-breakpoint
ALTER TABLE `__new_pool_member` RENAME TO `pool_member`;--> statement-breakpoint
CREATE TABLE `__new_pool` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`creator_id` text,
	`created_at` integer,
	FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_pool`("id", "name", "creator_id", "created_at") SELECT "id", "name", "creator_id", "created_at" FROM `pool`;--> statement-breakpoint
DROP TABLE `pool`;--> statement-breakpoint
ALTER TABLE `__new_pool` RENAME TO `pool`;