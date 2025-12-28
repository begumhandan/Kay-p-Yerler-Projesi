PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_locations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`description` text NOT NULL,
	`category` text DEFAULT 'Diğer' NOT NULL,
	`address` text NOT NULL,
	`status` text DEFAULT 'yikildi' NOT NULL,
	`image_before_url` text NOT NULL,
	`image_after_url` text NOT NULL,
	`year_before` integer NOT NULL,
	`year_after` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_locations`("id", "title", "slug", "description", "category", "address", "status", "image_before_url", "image_after_url", "year_before", "year_after", "created_at") SELECT "id", "title", "slug", "description", "category", "address", "status", "image_before_url", "image_after_url", "year_before", "year_after", "created_at" FROM `locations`;--> statement-breakpoint
DROP TABLE `locations`;--> statement-breakpoint
ALTER TABLE `__new_locations` RENAME TO `locations`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `locations_slug_unique` ON `locations` (`slug`);--> statement-breakpoint
CREATE TABLE `__new_visitors` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ip_address` text NOT NULL,
	`user_agent` text NOT NULL,
	`last_active` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
INSERT INTO `__new_visitors`("id", "ip_address", "user_agent", "last_active", "created_at") SELECT "id", "ip_address", "user_agent", "last_active", "created_at" FROM `visitors`;--> statement-breakpoint
DROP TABLE `visitors`;--> statement-breakpoint
ALTER TABLE `__new_visitors` RENAME TO `visitors`;