CREATE TABLE `ca_mensuel` (
	`id` char(36) NOT NULL,
	`user_id` char(36) NOT NULL,
	`entreprise_id` char(36) NOT NULL,
	`annee` int NOT NULL,
	`mois` int NOT NULL,
	`ca_ht` decimal(10,2) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ca_mensuel_id` PRIMARY KEY(`id`),
	CONSTRAINT `idx_user_entreprise_mois_annee` UNIQUE(`user_id`,`entreprise_id`,`annee`,`mois`)
);
--> statement-breakpoint
CREATE TABLE `contacts` (
	`id` char(36) NOT NULL,
	`user_id` char(36) NOT NULL,
	`entreprise_id` char(36) NOT NULL,
	`prenom` varchar(100),
	`nom` varchar(100) NOT NULL,
	`poste` varchar(150),
	`email` varchar(255),
	`tel_direct` varchar(50),
	`tel_mobile` varchar(50),
	`contact_principal` boolean DEFAULT false,
	`commentaire` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `entreprises` (
	`id` char(36) NOT NULL,
	`user_id` char(36) NOT NULL,
	`nom` varchar(255) NOT NULL,
	`statut` enum('client','prospect','fournisseur','a_reactiver') NOT NULL,
	`rue` varchar(255),
	`code_postal` varchar(10),
	`ville` varchar(100),
	`pays` varchar(100),
	`description` text,
	`logo` varchar(500),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `entreprises_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `objectifs_mensuels` (
	`id` char(36) NOT NULL,
	`user_id` char(36) NOT NULL,
	`annee` int NOT NULL,
	`mois` int NOT NULL,
	`objectif_ht` decimal(10,2) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `objectifs_mensuels_id` PRIMARY KEY(`id`),
	CONSTRAINT `idx_user_mois_annee` UNIQUE(`user_id`,`annee`,`mois`)
);
--> statement-breakpoint
CREATE TABLE `password_reset_tokens` (
	`id` char(36) NOT NULL,
	`user_id` char(36) NOT NULL,
	`token_hash` char(64) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`used_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `password_reset_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `password_reset_tokens_token_hash_unique` UNIQUE(`token_hash`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` char(36) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` varchar(255),
	`prenom` varchar(100),
	`nom` varchar(100),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `ca_mensuel` ADD CONSTRAINT `ca_mensuel_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ca_mensuel` ADD CONSTRAINT `ca_mensuel_entreprise_id_entreprises_id_fk` FOREIGN KEY (`entreprise_id`) REFERENCES `entreprises`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contacts` ADD CONSTRAINT `contacts_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contacts` ADD CONSTRAINT `contacts_entreprise_id_entreprises_id_fk` FOREIGN KEY (`entreprise_id`) REFERENCES `entreprises`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `entreprises` ADD CONSTRAINT `entreprises_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `objectifs_mensuels` ADD CONSTRAINT `objectifs_mensuels_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `password_reset_tokens` ADD CONSTRAINT `password_reset_tokens_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_user_entreprise` ON `contacts` (`user_id`,`entreprise_id`,`contact_principal`);--> statement-breakpoint
CREATE INDEX `idx_user_statut_nom` ON `entreprises` (`user_id`,`statut`,`nom`);--> statement-breakpoint
CREATE INDEX `idx_password_reset_lookup` ON `password_reset_tokens` (`token_hash`,`expires_at`,`used_at`);--> statement-breakpoint
CREATE INDEX `idx_password_reset_user` ON `password_reset_tokens` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_email` ON `users` (`email`);