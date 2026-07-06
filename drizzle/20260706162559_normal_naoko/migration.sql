CREATE TABLE `expenses` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`description` text NOT NULL,
	`value` real NOT NULL,
	`start_date` integer NOT NULL,
	`end_date` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`expense_id` integer NOT NULL,
	`value` real NOT NULL,
	`paid_at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	CONSTRAINT `fk_payments_expense_id_expenses_id_fk` FOREIGN KEY (`expense_id`) REFERENCES `expenses`(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_expense_description` ON `expenses` (`description`);--> statement-breakpoint
CREATE INDEX `idx_expense_end_date` ON `expenses` (`end_date`);--> statement-breakpoint
CREATE INDEX `idx_expense_start_date` ON `expenses` (`start_date`);--> statement-breakpoint
CREATE INDEX `idx_expense_id` ON `payments` (`expense_id`);