const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs-extra');
const db = require("../database");
const mysqldump = require('mysqldump');
const { promisify } = require('util');
const { stringify } = require('querystring');
const mysql = require('mysql2');
var readline = require('readline');
const helpers = {};

helpers.listadoFotos = (req, res, next) => {
    const nif = req;
    var fotitos = [];
    var directorio = path.join(__dirname, "../public/img/imagenes", nif);
    fs.readdir(directorio, (err, files) => {
        if (files) {
            files.forEach(file => {
                fotitos.push(file);
            });
        }
    });
    return fotitos;
}

helpers.listadoCarpetas = async (req, res, next) => {
    var source = path.join(__dirname, "../public/img/imagenes/");
    let filesAndDirectories = await fs.readdir(source);
    //console.log(filesAndDirectories);
    let directories = [];
    filesAndDirectories.forEach(element => {
        directories.push(element);
    })
    return directories;

}

helpers.listadoBackups = (req, res, next) => {
    var documentos = [];
    var directorio = path.join(__dirname, "../public/dumpSQL");
    fs.readdir(directorio, (err, files) => {
        if (files) {
            files.forEach(file => {
                var item = {
                    'name': file,
                    'created_at': (fs.statSync(directorio + "/" + file)).birthtime
                }
                documentos.push(item);
            });
        } else {
            console.log("No hay files");
        }
    });
    return documentos;
}

helpers.listadoBackupsFotos = (req, res, next) => {
    var backups = [];
    var directorio = path.join(__dirname, "../public/dumpFOTOS/");
    fs.readdir(directorio, (err, files) => {
        if (files) {
            files.forEach(file => {
                //console.log(file);
                var item = {
                    'name': file,
                    'size': (fs.statSync(path.join(directorio, file)).size / (1024 * 1024)).toFixed(2),
                    'created_at': fs.statSync(path.join(directorio, file)).birthtime,
                }
                //console.log(item.created_at);
                backups.push(item);
            });
        } else {
            console.log("No hay files");
        }
    });
    backups.sort((a, b) => a.created_at - b.created_at);
    //console.log(backups);
    return backups;
}

helpers.encryptPass = async (password) => {
    const sal = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, sal);
    return password;
};

helpers.verifyPassword = async (password, hashedPassword) => {
    try {
        return await bcrypt.compare(password, hashedPassword);
    } catch (e) {
        console.log(e);
    }
}

helpers.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.redirect('/signin');
}

helpers.isNotAuthenticated = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return next();
    }
    return res.redirect('/profile');
}

helpers.hasSanPrivileges = (req, res, next) => {
    if (req.user.privilegio == "san" || req.user.privilegio == "admin") {
        return next();
    }
    return res.redirect('/noperm');
}

helpers.hasNotSanPrivileges = (req, res, next) => {
    if (req.user.privilegio != "san" && req.user.privilegio != "admin") {
        return next();
    }
    return res.redirect('/noperm');
}

helpers.isAdmin = (req, res, next) => {
    if (req.user.privilegio == "admin") {
        return next();
    }
    return res.redirect('/noperm');
}

helpers.isNotAdmin = (req, res, next) => {
    if (!req.user.privilegio == "admin") {
        return next();
    }
    return res.redirect('/noperm');
}

helpers.insertarLog = async (usuario, accion, observacion) => {
    const log = {
        usuario,
        accion,
        observacion
    }
    try {
        console.log("Insertando log: " + stringify(log));
        const a = await db.query("insert into logs SET ?", [log]);
        return a;
    } catch (err) {
        console.log(err);
        return "error";
    }

}

helpers.dumpearSQL = () => {
    // dump the result straight to a file
    console.log("===============================");
    console.log(db.config.connectionConfig);

    mysqldump({
        connection: {
            host: db.config.connectionConfig.host,
            user: db.config.connectionConfig.user,
            password: db.config.connectionConfig.password,
            database: db.config.connectionConfig.database,
        },
        dumpToFile: './src/public/dumpSQL/dumpSAN' + Date.now() + '.sql',
    });
}

helpers.getCode = () => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; //abcdefghijklmnopqrstuvwxyz
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < 6) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

helpers.sendRecoveryMail = async (email, token) => (req, res) => {


}

helpers.consultaPrueba = async () => {
    let ruta = path.join(__dirname, '..', '..', 'database', 'prueba.sql');
    console.log(ruta);

    var rl = readline.createInterface({

        input: fs.createReadStream(ruta),
        terminal: false
    });
    rl.on('line', function (chunk) {
        db.query(chunk.toString('ascii'), function (err, sets, fields) {
            if (err) console.log(err);
            console.log("voy");
            console.log(sets);
            console.log(fields);
        });
    });
    rl.on('close', function () {
        console.log("finished");
    });


    /* const connection = mysql.createConnection({
        host: db.config.connectionConfig.host,
        user: db.config.connectionConfig.user,
        password: db.config.connectionConfig.password,
        database: db.config.connectionConfig.database,
        multipleStatements: true
    });

    const connectionQueryPromise = promisify(connection.query.bind(connection));
    let ruta = path.join(__dirname, '..', '..', 'database', 'prueba.sql');
    console.log(ruta);

    const dbImportScript = fs.readFileSync(ruta);
    console.log(dbImportScript);
    await connectionQueryPromise(dbImportScript);
 */

    /*     //console.log(database);
        db.query('source "../../database/poblarDDBB.sql"', function (error, results, fields) {
            if (error){
                throw error;
    
            } else{
                console.log("hecho");
                console.log(results);
            }
            // connected!
          }); */

}

module.exports = helpers;