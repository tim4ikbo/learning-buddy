PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_verification_tokens` (
	`token` text NOT NULL,
	`identifier` text NOT NULL,
	`expires` integer NOT NULL,
	PRIMARY KEY(`identifier`, `token`)
);
--> statement-breakpoint
INSERT INTO `__new_verification_tokens`("token", "identifier", "expires") SELECT "token", "identifier", "expires" FROM `verification_tokens`;--> statement-breakpoint
DROP TABLE `verification_tokens`;--> statement-breakpoint
ALTER TABLE `__new_verification_tokens` RENAME TO `verification_tokens`;--> statement-breakpoint
PRAGMA foreign_keys=ON;