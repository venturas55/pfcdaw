alter table usuarios add column prefmap varchar(10) default 'Leaflet'; 
alter table balizamiento add column apagada boolean default false; 
alter table balizamiento add column esBoya boolean default false; 
ALTER TABLE preventivos MODIFY fecha TIMESTAMP NULL;
ALTER TABLE preventivos MODIFY solved_at TIMESTAMP NULL;