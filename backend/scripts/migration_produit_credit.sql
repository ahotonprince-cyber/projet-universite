-- Migration : enrichissement de la table produit_credit
USE `cowec_microfinance`;

ALTER TABLE `produit_credit`
  ADD COLUMN `categorie`               ENUM('individuel','solidaire','agricole','logement','urgence') NOT NULL DEFAULT 'individuel' AFTER `nom`,
  ADD COLUMN `description`             TEXT NULL AFTER `categorie`,
  ADD COLUMN `type_taux`               ENUM('fixe','degressif','flat') NOT NULL DEFAULT 'fixe' AFTER `taux_annuel`,
  ADD COLUMN `periodicite_taux`        ENUM('mensuel','annuel') NOT NULL DEFAULT 'mensuel' AFTER `type_taux`,
  ADD COLUMN `taux_penalite`           DECIMAL(5,2) NOT NULL DEFAULT 0.00 AFTER `periodicite_taux`,
  ADD COLUMN `periode_grace`           INT NOT NULL DEFAULT 0 AFTER `taux_penalite`,
  ADD COLUMN `frequence_remboursement` ENUM('hebdomadaire','bimensuel','mensuel','in_fine') NOT NULL DEFAULT 'mensuel' AFTER `duree_max`,
  ADD COLUMN `mode_remboursement`      ENUM('annuite_constante','principal_constant','bullet') NOT NULL DEFAULT 'annuite_constante' AFTER `frequence_remboursement`;
