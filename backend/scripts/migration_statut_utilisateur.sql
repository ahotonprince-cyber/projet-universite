-- Migration : élargir l'ENUM statut des utilisateurs pour inclure inactif et rejete
ALTER TABLE utilisateurs
    MODIFY COLUMN statut ENUM('en_attente','actif','inactif','bloque','rejete')
    NOT NULL DEFAULT 'en_attente';
