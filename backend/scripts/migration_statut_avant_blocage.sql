-- Migration : sauvegarder le statut avant blocage pour le restaurer au déblocage
ALTER TABLE utilisateurs
    ADD COLUMN IF NOT EXISTS statut_avant_blocage VARCHAR(20) DEFAULT NULL
        COMMENT 'Statut avant blocage automatique (restauré au déblocage)';
