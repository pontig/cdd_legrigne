# RICORDARSI DI CAMBIARE LA DICHIARAZIONE DEL ID_SEMESTRE NELLE TABELLE CHE LO CONTENGONO
# ACCOUNT CON PERMESSI >= 20 ORA POSSONO ANCHE FARE BACKUP DEL DATABASE

USE cdd_legrigne;

# Elimina account duplicati ATTENZIONE: CAMBIARLI PER PRIMALUNA
DELETE FROM account WHERE id = 20 OR id = 16 OR id = 17 OR id = 19 OR id = 21; 

UPDATE diario a
JOIN account acc 
  ON a.firma = CONCAT(LOWER(LEFT(acc.nome, 1)), LOWER(LEFT(acc.cognome, 1)))
SET a.firma = acc.id;

UPDATE comportamento_problema a
JOIN account acc 
  ON a.firma = CONCAT(LOWER(LEFT(acc.nome, 1)), LOWER(LEFT(acc.cognome, 1)))
SET a.firma = acc.id;

UPDATE attivita_mirata a
JOIN account acc 
  ON a.firma = CONCAT(LOWER(LEFT(acc.nome, 1)), LOWER(LEFT(acc.cognome, 1)))
SET a.firma = acc.id;

UPDATE bagno a
JOIN account acc 
  ON a.firma = CONCAT(LOWER(LEFT(acc.nome, 1)), LOWER(LEFT(acc.cognome, 1)))
SET a.firma = acc.id;

UPDATE crisi_epilettica a
JOIN account acc 
  ON a.firma = CONCAT(LOWER(LEFT(acc.nome, 1)), LOWER(LEFT(acc.cognome, 1)))
SET a.firma = acc.id;

UPDATE doccia a
JOIN account acc 
  ON a.firma = CONCAT(LOWER(LEFT(acc.nome, 1)), LOWER(LEFT(acc.cognome, 1)))
SET a.firma = acc.id;

UPDATE idratazione a
JOIN account acc 
  ON a.firma = CONCAT(LOWER(LEFT(acc.nome, 1)), LOWER(LEFT(acc.cognome, 1)))
SET a.firma = acc.id;

# Inserisci valori -1 per le firme non presenti (stringa vuota)
UPDATE diario SET firma = -1 WHERE firma = '';
UPDATE comportamento_problema SET firma = -1 WHERE firma = '';
UPDATE attivita_mirata SET firma = -1 WHERE firma = '';
UPDATE bagno SET firma = -1 WHERE firma = '';
UPDATE crisi_epilettica SET firma = -1 WHERE firma = '';
UPDATE doccia SET firma = -1 WHERE firma = '';
UPDATE idratazione SET firma = -1 WHERE firma = '';

# Cambia i campi firma nelle tabelle a degli interi
ALTER TABLE diario MODIFY firma INT NOT NULL;
ALTER TABLE comportamento_problema MODIFY firma INT NOT NULL;
ALTER TABLE attivita_mirata MODIFY firma INT NOT NULL;
ALTER TABLE bagno MODIFY firma INT NOT NULL;
ALTER TABLE crisi_epilettica MODIFY firma INT NOT NULL;
ALTER TABLE doccia MODIFY firma INT NOT NULL;
ALTER TABLE idratazione MODIFY firma INT NOT NULL;

UPDATE partecipazione_attivita SET comunicazione = NULL WHERE comunicazione = '';
ALTER TABLE partecipazione_attivita MODIFY comunicazione INT DEFAULT NULL;

ALTER TABLE pressione MODIFY temperatura DECIMAL(3,1) NOT NULL;