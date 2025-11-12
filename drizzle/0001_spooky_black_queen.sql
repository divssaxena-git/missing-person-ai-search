CREATE TABLE `cctv_footage` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`report_id` integer,
	`submitted_by_user_id` integer,
	`location` text NOT NULL,
	`footage_date` text NOT NULL,
	`footage_time` text,
	`description` text,
	`video_url` text,
	`contact_info` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`report_id`) REFERENCES `missing_persons`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`submitted_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sightings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`report_id` integer,
	`reported_by_user_id` integer,
	`sighting_location` text NOT NULL,
	`sighting_date` text NOT NULL,
	`description` text,
	`contact_info` text,
	`image_url` text,
	`verified` integer DEFAULT false,
	`created_at` text NOT NULL,
	FOREIGN KEY (`report_id`) REFERENCES `missing_persons`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reported_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
