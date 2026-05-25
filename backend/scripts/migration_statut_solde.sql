-- Migration: normalise credit.statut ('termine' → 'solde') and echeance.statut (remove 'partiel')
-- Run once against the running database.

-- 1. Convert any existing rows with old value 'termine' or empty string to 'solde'
UPDATE credit SET statut = 'solde' WHERE statut = 'termine' OR statut = '';

-- 2. Alter credit ENUM to ensure 'solde' is the canonical value (removes 'termine' if present)
ALTER TABLE credit
  MODIFY statut ENUM('en_attente','valide','actif','rejete','solde') NOT NULL DEFAULT 'en_attente';

-- 3. Convert any echeance rows with deprecated 'partiel' status to 'paye'
UPDATE echeance SET statut = 'paye' WHERE statut = 'partiel';

-- 4. Alter echeance ENUM to remove 'partiel'
ALTER TABLE echeance
  MODIFY statut ENUM('a_venir','en_retard','paye') NOT NULL DEFAULT 'a_venir';
