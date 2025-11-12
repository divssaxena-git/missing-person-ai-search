CREATE TABLE `missing_persons` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`reported_by` integer,
	`full_name` text NOT NULL,
	`age` integer,
	`gender` text,
	`height` text,
	`weight` text,
	`hair_color` text,
	`eye_color` text,
	`complexion` text,
	`distinguishing_marks` text,
	`last_seen_location` text NOT NULL,
	`last_seen_date` text NOT NULL,
	`description` text,
	`image_url` text,
	`status` text DEFAULT 'active' NOT NULL,
	`contact_info` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`reported_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`report_id` integer,
	`message` text NOT NULL,
	`type` text DEFAULT 'info' NOT NULL,
	`read` integer DEFAULT false,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`report_id`) REFERENCES `missing_persons`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`password_hash` text NOT NULL,
	`full_name` text NOT NULL,
	`role` text DEFAULT 'user' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_phone_unique` ON `users` (`phone`);