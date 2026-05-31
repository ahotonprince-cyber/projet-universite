-- Migration : agrandir telephone de VARCHAR(20) à VARCHAR(30)
ALTER TABLE utilisateurs
    MODIFY COLUMN telephone VARCHAR(30) DEFAULT NULL;
