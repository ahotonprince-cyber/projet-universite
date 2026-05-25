-- Migration : ajout de la table kyc_dossiers
USE `cowec_microfinance`;

CREATE TABLE IF NOT EXISTS `kyc_dossiers` (
    `id`                    INT UNSIGNED                            NOT NULL AUTO_INCREMENT,
    `utilisateur_id`        INT UNSIGNED                            NOT NULL,
    `statut`                ENUM('en_attente','approuve','rejete')  NOT NULL DEFAULT 'en_attente',
    `commentaire_admin`     TEXT                                    DEFAULT NULL,
    `soumis_le`             DATETIME                                NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `traite_le`             DATETIME                                DEFAULT NULL,
    `traite_par`            INT UNSIGNED                            DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_kyc_user` (`utilisateur_id`),
    KEY `idx_kyc_traite` (`traite_par`),
    CONSTRAINT `fk_kyc_user`
        FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_kyc_traite`
        FOREIGN KEY (`traite_par`) REFERENCES `utilisateurs` (`id`)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
