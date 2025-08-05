CREATE TABLE `genre` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `genre_name_unique` ON `genre` (`name`);--> statement-breakpoint
CREATE TABLE `movie` (
	`id` integer PRIMARY KEY NOT NULL,
	`title` text,
	`original_title` text,
	`original_language` text,
	`overview` text,
	`poster_path` text,
	`backdrop_path` text,
	`release_date` text,
	`adult` integer,
	`video` integer,
	`popularity` real,
	`vote_average` real,
	`vote_count` integer
);
--> statement-breakpoint
CREATE INDEX `title_idx` ON `movie` (`title`);--> statement-breakpoint
CREATE TABLE `movie_genre` (
	`movie_id` integer,
	`genre_id` integer,
	PRIMARY KEY(`genre_id`, `movie_id`),
	FOREIGN KEY (`movie_id`) REFERENCES `movie`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`genre_id`) REFERENCES `genre`(`id`) ON UPDATE no action ON DELETE no action
);
