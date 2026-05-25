-- Migration: table support_ticket
CREATE TABLE IF NOT EXISTS `support_ticket` (
    `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `utilisateur_id` INT UNSIGNED NOT NULL,
    `type`          ENUM('question','probleme','credit','tontine','autre') NOT NULL DEFAULT 'question',
    `sujet`         VARCHAR(255) NOT NULL,
    `message`       TEXT NOT NULL,
    `statut`        ENUM('ouvert','en_cours','resolu','ferme') NOT NULL DEFAULT 'ouvert',
    `reponse`       TEXT DEFAULT NULL,
    `repondu_par`   INT UNSIGNED DEFAULT NULL,
    `date_creation` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `date_reponse`  DATETIME DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_ticket_user`   (`utilisateur_id`),
    KEY `idx_ticket_statut` (`statut`),
    CONSTRAINT `fk_ticket_user`  FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_ticket_agent` FOREIGN KEY (`repondu_par`)   REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
