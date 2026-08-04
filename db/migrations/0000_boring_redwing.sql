CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text,
	`sort_order` integer DEFAULT 0,
	`is_active` integer DEFAULT 1
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_slug_unique` ON `categories` (`slug`);--> statement-breakpoint
CREATE TABLE `channels` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`color` text DEFAULT '#e5e7eb',
	`sort_order` integer DEFAULT 0,
	`is_active` integer DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`date` text NOT NULL,
	`location` text,
	`staff` text,
	`stand_cost` real DEFAULT 0,
	`worker_cost` real DEFAULT 0,
	`transport` real DEFAULT 0,
	`other_cost` real DEFAULT 0,
	`total_expense` real DEFAULT 0,
	`total_revenue` real DEFAULT 0,
	`collection` real DEFAULT 0,
	`net_profit` real,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` text PRIMARY KEY NOT NULL,
	`category` text NOT NULL,
	`description` text NOT NULL,
	`amount` real NOT NULL,
	`date` text NOT NULL,
	`event_id` text,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `frame_stock` (
	`id` text PRIMARY KEY NOT NULL,
	`size` text NOT NULL,
	`color` text NOT NULL,
	`quantity` integer DEFAULT 0,
	`defective` integer DEFAULT 0,
	`unit_cost` real DEFAULT 0,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `frame_stock_size_color` ON `frame_stock` (`size`,`color`);--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text,
	`product_id` text,
	`product_name` text NOT NULL,
	`sku` text,
	`quantity` integer DEFAULT 1,
	`unit_price` real,
	`size` text,
	`frame_color` text,
	`has_frame` integer DEFAULT 0,
	`use_stock_print` integer DEFAULT 0,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`order_number` text NOT NULL,
	`channel` text NOT NULL,
	`status` text DEFAULT 'beklemede' NOT NULL,
	`customer_name` text,
	`customer_phone` text,
	`customer_email` text,
	`address` text,
	`instagram` text,
	`sale_price` real,
	`collection` real,
	`platform_fee` real DEFAULT 0,
	`shipping_cost` real DEFAULT 0,
	`net_revenue` real,
	`cargo_company` text,
	`tracking_number` text,
	`shipped_at` text,
	`delivered_at` text,
	`thank_you_sent` integer DEFAULT 0,
	`photo_taken` integer DEFAULT 0,
	`gift_package` integer DEFAULT 0,
	`customer_note` text,
	`event_id` text,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_order_number_unique` ON `orders` (`order_number`);--> statement-breakpoint
CREATE TABLE `price_templates` (
	`id` text PRIMARY KEY NOT NULL,
	`channel` text NOT NULL,
	`size` text NOT NULL,
	`sale_price` real NOT NULL,
	`frame_cost` real DEFAULT 0,
	`print_cost` real DEFAULT 0,
	`package_cost` real DEFAULT 0,
	`shipping_cost` real DEFAULT 0,
	`commission_rate` real DEFAULT 0,
	`service_fee` real DEFAULT 0,
	`withholding_tax` real DEFAULT 0,
	`donation_rate` real DEFAULT 0,
	`net_profit` real,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `price_templates_channel_size` ON `price_templates` (`channel`,`size`);--> statement-breakpoint
CREATE TABLE `print_stock` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text,
	`product_name` text,
	`size` text NOT NULL,
	`quantity` integer DEFAULT 0,
	`unit_cost` real DEFAULT 0,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `print_stock_product_size` ON `print_stock` (`product_id`,`size`);--> statement-breakpoint
CREATE TABLE `product_statuses` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`color` text DEFAULT '#e5e7eb',
	`sort_order` integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category_id` text,
	`sub_category_1` text,
	`sub_category_2` text,
	`is_custom` integer DEFAULT 0,
	`channels` text,
	`status` text DEFAULT 'aktif',
	`image_url` text,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `stock_movements` (
	`id` text PRIMARY KEY NOT NULL,
	`item_type` text NOT NULL,
	`item_id` text NOT NULL,
	`movement_type` text NOT NULL,
	`quantity` integer NOT NULL,
	`reason` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `sub_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`category_id` text NOT NULL,
	`parent_id` text,
	`name` text NOT NULL,
	`code` text DEFAULT '00',
	`color` text DEFAULT '#e5e7eb',
	`sort_order` integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE `supplies` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category` text,
	`quantity` integer DEFAULT 0,
	`unit` text DEFAULT 'adet',
	`unit_cost` real DEFAULT 0,
	`low_stock_threshold` integer DEFAULT 10,
	`notes` text,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
