# pfcdaw
Desarrollo del Proyecto final de ciclo para DAW
TODO: Gestion de Backups de BBDD





          NUEVA INSTALACION
===============================================
1.- INSTALACION NODEJS/EXPRESS SERVER:
    git clone https://github.com/venturas55/pfcdaw
    cd pfcdaw
    crear .env con datos con las variables 
                                            DB_HOST=localhost
                                            DB_USER=usuario
                                            DB_PASS=contraseñapropia
                                            DB_NAME=nombrebasedatos
    npm install

2.- INSTALACION BASE DE DATOS
Para crear la estructura de tablas con un usuario
mysql -u root -p 
source D:\DEVELOPMENT\01DAW\3 PFC\serpis\prueba instalacion\pfcdaw\database\sannuevo.sql

Para poblarla de datos:
source D:\DEVELOPMENT\01DAW\3 PFC\serpis\prueba instalacion\pfcdaw\database\poblarDDBB.sql

