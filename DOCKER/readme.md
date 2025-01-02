
docker exec -i b69 mysql -u root -p  sanDDBB < ./db/dumpSAN-completo.sql
docker exec -i b69 mysql -u root -p  

alter user 'root'@'%' identified with mysql_native_password by "weR65hS";

