-- Migration : ajout de la gestion des cycles dans les tontines
USE `cowec_microfinance`;

ALTER TABLE `tontine_groupe`
  ADD COLUMN `cycle_actuel` INT NOT NULL DEFAULT 1;

ALTER TABLE `tontine_membre`
  ADD COLUMN `ordre_passage` INT DEFAULT NULL,
  ADD COLUMN `a_recu`        TINYINT(1) NOT NULL DEFAULT 0;
