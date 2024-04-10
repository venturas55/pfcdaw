const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs-extra');
const db = require("../database");
const mysqldump = require('mysqldump');
const { stringify } = require('querystring');
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

helpers.getUrlPictureAtoN = (nif) => {
    let files;
    var directorio = path.join(__dirname, "../public/img/imagenes", nif);
    if (fs.existsSync(directorio)) {
        files = fs.readdirSync(directorio)
    }
    return files;
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

helpers.dumpearSQL = (operacion) => {
    // dump the result straight to a file
    console.log("===============================");
    console.log(db.config.connectionConfig);
    var tables = [];
    switch (operacion) {
        case 'balizamiento':
            tables.push("balizamiento", "localizacion", "lampara");
            break;
        case 'mantenimiento':
            tables.push("mantenimiento", "observaciones");
            break;
        case 'completo':
            tables.push("balizamiento", "localizacion", "lampara", "mantenimiento", "observaciones", "tickets", "inventario", "logs", "usuarios");
            break;
        default:
            break;
    }
    mysqldump({
        connection: {
            host: db.config.connectionConfig.host,
            user: db.config.connectionConfig.user,
            password: db.config.connectionConfig.password,
            database: db.config.connectionConfig.database,
        },
        dumpToFile: './src/public/dumpSQL/dumpSAN' + '-' + operacion + '-' + Date.now() + '.sql',
        dump: {
            tables,
        }
    });
}

helpers.runSQLrecovery =  (file) => {
    let ruta = path.join(__dirname,'..','public', 'dumpSQL',  file);

    var rl = readline.createInterface({
        input: fs.createReadStream(ruta),
        terminal: false
    });
    let total = "";
    rl.on('line', function (chunk) {
        total += chunk.toString();
        console.log("> " + chunk);

        /* db.query(chunk.toString('ascii'), function (err, sets, fields) {
            if (err) console.log(err);
        }); */
        if (chunk.toString('ascii').charAt(chunk.length - 1) == ';') {
            console.log(">> " + total);
            db.query(total, function (err, sets, fields) { if (err) console.log(err); });
            total = "";
        }
    });
    rl.on('close', function () {
        console.log("finished");
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

module.exports = helpers;