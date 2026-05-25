-- Migration : blocage automatique après 3 tentatives de connexion échouées
ALTER TABLE utilisateurs
    ADD COLUMN IF NOT EXISTS tentatives_connexion TINYINT UNSIGNED NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS date_blocage DATETIME NULL DEFAULT NULL;
