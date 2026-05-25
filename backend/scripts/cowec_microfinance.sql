-- ============================================================
--  COWEC MICROFINANCE — Schéma complet de la base de données
--  Base : cowec_microfinance | MySQL 8.0+
--  Généré le : 2026-05-22
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS `cowec_microfinance`
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE `cowec_microfinance`;

-- ------------------------------------------------------------
-- 1. UTILISATEURS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `utilisateurs` (
    `id`                        INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    `nom`                       VARCHAR(100)        DEFAULT NULL,
    `prenom`                    VARCHAR(100)        DEFAULT NULL,
    `code`                      VARCHAR(50)         DEFAULT NULL,
    `email`                     VARCHAR(191)        NOT NULL,
    `telephone`                 VARCHAR(20)         DEFAULT NULL,
    `password_hash`             VARCHAR(255)        NOT NULL,
    `role`                      ENUM('client','admin','agent') NOT NULL DEFAULT 'client',
    `statut`                    ENUM('en_attente','actif','bloque') NOT NULL DEFAULT 'en_attente',
    `avatar`                    VARCHAR(255)        DEFAULT NULL,
    `adresse`                   TEXT                DEFAULT NULL,
    `profession`                VARCHAR(100)        DEFAULT NULL,
    `date_naissance`            DATE                DEFAULT NULL,
    `score_credit`              DECIMAL(5,2)        NOT NULL DEFAULT 0.00,
    `date_creation`             DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `date_derniere_connexion`   DATETIME            DEFAULT NULL,
    `tentatives_connexion`      TINYINT UNSIGNED    NOT NULL DEFAULT 0,
    `date_blocage`              DATETIME            DEFAULT NULL,
    `deblocage_token`           VARCHAR(255)        DEFAULT NULL,
    `deblocage_token_expiry`    DATETIME            DEFAULT NULL,
    `email_token`               VARCHAR(255)        DEFAULT NULL,
    `email_token_expiry`        DATETIME            DEFAULT NULL,
    `email_verifie`             TINYINT(1)          NOT NULL DEFAULT 0,
    `reset_token`               VARCHAR(255)        DEFAULT NULL,
    `reset_token_expiry`        DATETIME            DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_email`       (`email`),
    UNIQUE KEY `uq_telephone`   (`telephone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2. SESSION
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `session` (
    `id`                INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    `utilisateur_id`    INT UNSIGNED    NOT NULL,
    `token`             VARCHAR(500)    NOT NULL,
    `ip_address`        VARCHAR(45)     DEFAULT NULL,
    `user_agent`        TEXT            DEFAULT NULL,
    `date_expiration`   DATETIME        NOT NULL,
    `date_creation`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_session_token`         (`token`(191)),
    KEY `idx_session_utilisateur`   (`utilisateur_id`),
    CONSTRAINT `fk_session_user`
        FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 3. PRÉFÉRENCES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `preferences` (
    `id`                    INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    `utilisateur_id`        INT UNSIGNED    NOT NULL,
    `notification_email`    TINYINT(1)      NOT NULL DEFAULT 1,
    `notification_sms`      TINYINT(1)      NOT NULL DEFAULT 1,
    `notification_push`     TINYINT(1)      NOT NULL DEFAULT 0,
    `langue`                VARCHAR(10)     NOT NULL DEFAULT 'fr',
    `theme`                 VARCHAR(20)     NOT NULL DEFAULT 'light',
    `date_mise_a_jour`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_pref_user` (`utilisateur_id`),
    CONSTRAINT `fk_pref_user`
        FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 4. TYPE DE COMPTE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `type_compte` (
    `id`            INT UNSIGNED                            NOT NULL AUTO_INCREMENT,
    `nom`           VARCHAR(100)                            NOT NULL,
    `code`          ENUM('EPARGNE','COURANT','TONTINE')     NOT NULL,
    `taux_interet`  DECIMAL(5,2)                            NOT NULL DEFAULT 0.00,
    `frais_tenue`   DECIMAL(15,2)                           NOT NULL DEFAULT 0.00,
    `actif`         TINYINT(1)                              NOT NULL DEFAULT 1,
    `date_creation` DATETIME                                NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 5. COMPTE BANCAIRE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `compte_bancaire` (
    `id`                        INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    `utilisateur_id`            INT UNSIGNED    NOT NULL,
    `type_compte_id`            INT UNSIGNED    NOT NULL,
    `numero_compte`             VARCHAR(50)     NOT NULL,
    `solde`                     DECIMAL(15,2)   NOT NULL DEFAULT 0.00,
    `statut`                    VARCHAR(20)     NOT NULL DEFAULT 'actif',
    `date_creation`             DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `date_derniere_operation`   DATETIME        DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_numero_compte` (`numero_compte`),
    KEY `idx_compte_user`   (`utilisateur_id`),
    KEY `idx_compte_type`   (`type_compte_id`),
    CONSTRAINT `fk_compte_user`
        FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_compte_type`
        FOREIGN KEY (`type_compte_id`) REFERENCES `type_compte` (`id`)
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 6. OPÉRATION
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `operation` (
    `id`                INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    `compte_id`         INT UNSIGNED    NOT NULL,
    `type_operation`    VARCHAR(50)     NOT NULL,
    `montant`           DECIMAL(15,2)   NOT NULL,
    `description`       TEXT            DEFAULT NULL,
    `reference_externe` VARCHAR(100)    DEFAULT NULL,
    `statut`            VARCHAR(20)     NOT NULL DEFAULT 'completed',
    `date_operation`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_op_compte` (`compte_id`),
    CONSTRAINT `fk_op_compte`
        FOREIGN KEY (`compte_id`) REFERENCES `compte_bancaire` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 7. PRODUIT CRÉDIT
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `produit_credit` (
    `id`                INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    `nom`               VARCHAR(100)    NOT NULL,
    `taux_annuel`       DECIMAL(5,2)    NOT NULL DEFAULT 0.00,
    `duree_min`         INT             NOT NULL DEFAULT 0,
    `duree_max`         INT             NOT NULL DEFAULT 0,
    `montant_min`       DECIMAL(15,2)   NOT NULL DEFAULT 0.00,
    `montant_max`       DECIMAL(15,2)   NOT NULL DEFAULT 0.00,
    `frais_dossier`     DECIMAL(15,2)   NOT NULL DEFAULT 0.00,
    `penalite_retard`   DECIMAL(5,2)    NOT NULL DEFAULT 0.00,
    `actif`             TINYINT(1)      NOT NULL DEFAULT 1,
    `date_creation`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 8. CRÉDIT
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `credit` (
    `id`                INT UNSIGNED                                NOT NULL AUTO_INCREMENT,
    `utilisateur_id`    INT UNSIGNED                                NOT NULL,
    `produit_credit_id` INT UNSIGNED                                DEFAULT NULL,
    `numero_credit`     VARCHAR(50)                                 DEFAULT NULL,
    `montant_accorde`   DECIMAL(15,2)                               NOT NULL DEFAULT 0.00,
    `montant_rembourse` DECIMAL(15,2)                               NOT NULL DEFAULT 0.00,
    `duree_mois`        INT                                         NOT NULL DEFAULT 0,
    `taux_annuel`       DECIMAL(5,2)                                NOT NULL DEFAULT 0.00,
    `objet`             VARCHAR(255)                                DEFAULT NULL,
    `description`       TEXT                                        DEFAULT NULL,
    `statut`            ENUM('en_attente','valide','actif','rejete','solde') NOT NULL DEFAULT 'en_attente',
    `valide_par`        INT UNSIGNED                                DEFAULT NULL,
    `date_validation`   DATETIME                                    DEFAULT NULL,
    `date_debut`        DATE                                        DEFAULT NULL,
    `date_fin`          DATE                                        DEFAULT NULL,
    `motif_rejet`       TEXT                                        DEFAULT NULL,
    `date_demande`      DATETIME                                    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_numero_credit` (`numero_credit`),
    KEY `idx_credit_user`       (`utilisateur_id`),
    KEY `idx_credit_produit`    (`produit_credit_id`),
    KEY `idx_credit_valide_par` (`valide_par`),
    CONSTRAINT `fk_credit_user`
        FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_credit_produit`
        FOREIGN KEY (`produit_credit_id`) REFERENCES `produit_credit` (`id`)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `fk_credit_valide_par`
        FOREIGN KEY (`valide_par`) REFERENCES `utilisateurs` (`id`)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 9. ÉCHÉANCE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `echeance` (
    `id`                INT UNSIGNED                                NOT NULL AUTO_INCREMENT,
    `credit_id`         INT UNSIGNED                                NOT NULL,
    `numero_echeance`   INT                                         NOT NULL,
    `montant_echeance`  DECIMAL(15,2)                               NOT NULL,
    `montant_paye`      DECIMAL(15,2)                               NOT NULL DEFAULT 0.00,
    `date_echeance`     DATETIME                                    NOT NULL,
    `date_paiement`     DATETIME                                    DEFAULT NULL,
    `statut`            ENUM('a_venir','en_retard','paye','partiel') NOT NULL DEFAULT 'a_venir',
    `penalite`          DECIMAL(15,2)                               NOT NULL DEFAULT 0.00,
    PRIMARY KEY (`id`),
    KEY `idx_echeance_credit` (`credit_id`),
    CONSTRAINT `fk_echeance_credit`
        FOREIGN KEY (`credit_id`) REFERENCES `credit` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 10. TONTINE GROUPE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tontine_groupe` (
    `id`                INT UNSIGNED                                    NOT NULL AUTO_INCREMENT,
    `nom`               VARCHAR(100)                                    NOT NULL,
    `montant_part`      DECIMAL(15,2)                                   NOT NULL,
    `periodicite`       ENUM('hebdomadaire','mensuel','trimestriel')     NOT NULL DEFAULT 'mensuel',
    `nombre_membres`    INT                                             NOT NULL DEFAULT 0,
    `statut`            ENUM('actif','cloture','en_attente')            NOT NULL DEFAULT 'actif',
    `date_creation`     DATETIME                                        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `date_cloture`      DATE                                            DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 11. TONTINE MEMBRE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tontine_membre` (
    `id`                    INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    `groupe_id`             INT UNSIGNED    NOT NULL,
    `utilisateur_id`        INT UNSIGNED    NOT NULL,
    `statut`                ENUM('actif','inactif','exclu') NOT NULL DEFAULT 'actif',
    `date_adhesion`         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `montant_total_paye`    DECIMAL(15,2)   NOT NULL DEFAULT 0.00,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_membre` (`groupe_id`, `utilisateur_id`),
    KEY `idx_membre_user` (`utilisateur_id`),
    CONSTRAINT `fk_membre_groupe`
        FOREIGN KEY (`groupe_id`) REFERENCES `tontine_groupe` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_membre_user`
        FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 12. OPÉRATEUR MOBILE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `operateur_mobile` (
    `id`                INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    `nom`               VARCHAR(100)    NOT NULL,
    `code`              VARCHAR(50)     NOT NULL,
    `frais_transaction` DECIMAL(5,2)    NOT NULL DEFAULT 0.00,
    `actif`             TINYINT(1)      NOT NULL DEFAULT 1,
    `date_creation`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_op_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 13. DEMANDE DE RETRAIT
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `demande_retrait` (
    `id`                INT UNSIGNED                        NOT NULL AUTO_INCREMENT,
    `utilisateur_id`    INT UNSIGNED                        NOT NULL,
    `montant`           DECIMAL(15,2)                       NOT NULL,
    `telephone`         VARCHAR(20)                         NOT NULL,
    `operateur`         VARCHAR(50)                         NOT NULL,
    `statut`            ENUM('en_attente','valide','rejete') NOT NULL DEFAULT 'en_attente',
    `date_demande`      DATETIME                            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `date_traitement`   DATETIME                            DEFAULT NULL,
    `traite_par`        INT UNSIGNED                        DEFAULT NULL,
    `motif_rejet`       TEXT                                DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_retrait_user`      (`utilisateur_id`),
    KEY `idx_retrait_traite`    (`traite_par`),
    CONSTRAINT `fk_retrait_user`
        FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_retrait_traite`
        FOREIGN KEY (`traite_par`) REFERENCES `utilisateurs` (`id`)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 14. DOCUMENT (KYC)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `document` (
    `id`                INT UNSIGNED                        NOT NULL AUTO_INCREMENT,
    `utilisateur_id`    INT UNSIGNED                        NOT NULL,
    `nom`               VARCHAR(255)                        NOT NULL,
    `type`              VARCHAR(100)                        NOT NULL,
    `url_fichier`       VARCHAR(500)                        NOT NULL,
    `statut`            ENUM('en_attente','valide','rejete') NOT NULL DEFAULT 'en_attente',
    `date_upload`       DATETIME                            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `date_validation`   DATETIME                            DEFAULT NULL,
    `valide_par`        INT UNSIGNED                        DEFAULT NULL,
    `motif_rejet`       TEXT                                DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_doc_user`      (`utilisateur_id`),
    KEY `idx_doc_valide`    (`valide_par`),
    CONSTRAINT `fk_doc_user`
        FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_doc_valide`
        FOREIGN KEY (`valide_par`) REFERENCES `utilisateurs` (`id`)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 15. KYC DOSSIERS
-- ------------------------------------------------------------
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

-- ------------------------------------------------------------
-- 16. LOGS AUDIT
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `logs_audit` (
    `id`            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    `utilisateur_id` INT UNSIGNED   DEFAULT NULL,
    `action`        VARCHAR(255)    NOT NULL,
    `entity_type`   VARCHAR(100)    DEFAULT NULL,
    `entity_id`     INT UNSIGNED    DEFAULT NULL,
    `ip_adress`     VARCHAR(45)     DEFAULT NULL,
    `date_action`   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_audit_user`    (`utilisateur_id`),
    KEY `idx_audit_entity`  (`entity_type`, `entity_id`),
    CONSTRAINT `fk_audit_user`
        FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 17. NOTIFICATION
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `notification` (
    `id`                INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    `utilisateur_id`    INT UNSIGNED    NOT NULL,
    `titre`             VARCHAR(255)    NOT NULL,
    `message`           TEXT            NOT NULL,
    `type`              VARCHAR(50)     NOT NULL,
    `reference_id`      INT UNSIGNED    DEFAULT NULL,
    `reference_type`    VARCHAR(50)     DEFAULT NULL,
    `lu`                TINYINT(1)      NOT NULL DEFAULT 0,
    `date_creation`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_notif_user` (`utilisateur_id`),
    CONSTRAINT `fk_notif_user`
        FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
--  DONNÉES INITIALES
-- ============================================================

-- Types de compte
INSERT INTO `type_compte` (`nom`, `code`, `taux_interet`, `frais_tenue`, `actif`) VALUES
('Compte Épargne',  'EPARGNE',  3.50,  500.00, 1),
('Compte Courant',  'COURANT',  0.00, 1000.00, 1),
('Compte Tontine',  'TONTINE',  0.00,    0.00, 1);

-- Produits de crédit
INSERT INTO `produit_credit` (`nom`, `taux_annuel`, `duree_min`, `duree_max`, `montant_min`, `montant_max`, `frais_dossier`, `penalite_retard`, `actif`) VALUES
('Microcrédit Express',     15.00,  3,   12,   10000,   500000,  2000,  2.00, 1),
('Crédit Agricole',         12.00,  6,   24,   50000,  2000000,  5000,  1.50, 1),
('Crédit Commerce',         18.00,  3,   18,   20000,  1000000,  3000,  2.50, 1),
('Crédit Habitat',          10.00, 12,   60,  100000,  5000000, 10000,  1.00, 1);

-- Opérateurs mobile money
INSERT INTO `operateur_mobile` (`nom`, `code`, `frais_transaction`, `actif`) VALUES
('MTN Mobile Money',    'MTN',      1.50, 1),
('Orange Money',        'ORANGE',   1.50, 1),
('Moov Money',          'MOOV',     1.00, 1),
('Wave',                'WAVE',     0.00, 1);
