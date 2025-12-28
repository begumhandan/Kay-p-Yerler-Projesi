CREATE TABLE `visitors` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ip_address` text NOT NULL,
	`user_agent` text NOT NULL,
	`last_active` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
