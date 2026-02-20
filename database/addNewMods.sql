alter table usuarios add column IF NOT EXISTS prefmap varchar(10) default 'Leaflet'; 
alter table balizamiento add column IF NOT EXISTS apagada boolean default false; 
alter table balizamiento add column IF NOT EXISTS esBoya boolean default false; 
alter table balizamiento add column IF NOT EXISTS necesita_pintado tinyint(1) DEFAULT 0;
alter table localizacion add column IF NOT EXISTS coordenadas point default NULL;

ALTER TABLE preventivos MODIFY fecha TIMESTAMP NULL;
ALTER TABLE preventivos MODIFY solved_at TIMESTAMP NULL;
alter table preventivos add column IF NOT EXISTS solved_by_id int(11) after solved_at;

alter table preventivos add column IF NOT EXISTS foto_general varchar(250) after solved_at;
alter table preventivos add column IF NOT EXISTS foto_alimentacion varchar(250) after solved_at;
alter table preventivos add column IF NOT EXISTS foto_monitoreo varchar(250) after solved_at;
alter table preventivos add column IF NOT EXISTS foto_linterna varchar(250) after solved_at;
alter table preventivos add column IF NOT EXISTS foto_estructura varchar(250) after solved_at;

ALTER TABLE `usuarios` ADD CONSTRAINT `unique_email` UNIQUE (`email`);

update balizamiento set esBoya=1 where tipo like '%boya%' AND esBoya <> 1;

alter table usuarios add column IF NOT EXISTS default_localizacion varchar(15) default 'valencia'; 

alter table lampara add column IF NOT EXISTS distanciaRec decimal(5, 2) UNSIGNED DEFAULT NULL after alcanceLum;
alter table fondeos add column IF NOT EXISTS altura_focal smallint UNSIGNED DEFAULT NULL after nif;
alter table fondeos add column IF NOT EXISTS altura_flotador smallint UNSIGNED DEFAULT NULL after nif;
alter table fondeos add column IF NOT EXISTS diametro_flotador smallint UNSIGNED DEFAULT NULL after nif;
alter table fondeos add column IF NOT EXISTS composicion_flotador varchar(100) DEFAULT NULL after nif;