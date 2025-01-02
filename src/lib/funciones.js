import bcryptjs from 'bcryptjs';
import { join } from 'path';
import fse from 'fs-extra';
import pool from "../database.js";
import mysqldump from 'mysqldump';
import { stringify } from 'querystring';
import { createInterface } from 'readline';
import * as url from "url";
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const funciones = {};

funciones.listadoFotos = (req, res, next) => {
    const nif = req;
    var fotitos = [];
    var directorio = join(__dirname, "../public/img/imagenes", nif);
    fse.readdir(directorio, (err, files) => {
        if (files) {
            files.forEach(file => {
                fotitos.push(file);
            });
        }
    });
    return fotitos;
}

funciones.getUrlPictureAtoN = (nif) => {
    let files;
    var directorio = join(__dirname, "../public/img/imagenes", nif);
    if (fse.existsSync(directorio)) {
        files = fse.readdirSync(directorio)
    }
    return files;
}

funciones.listadoCarpetas = async (req, res, next) => {
    var source = join(__dirname, "../public/img/imagenes/");
    let filesAndDirectories = await fse.readdir(source);
    //console.log(filesAndDirectories);
    let directories = [];
    filesAndDirectories.forEach(element => {
        directories.push(element);
    })
    return directories;

}

funciones.listadoBackups = (req, res, next) => {
    var documentos = [];
    var directorio = join(__dirname, "../public/dumpSQL");
    fse.readdir(directorio, (err, files) => {
        if (files) {
            files.forEach(file => {
                var item = {
                    'name': file,
                    'created_at': (fse.statSync(directorio + "/" + file)).birthtime
                }
                documentos.push(item);
            });
        } else {
            console.log("No hay files");
        }
    });
    return documentos;
}

funciones.listadoBackupsFotos = (req, res, next) => {
    var backups = [];
    var directorio = join(__dirname, "../public/dumpFOTOS/");
    fse.readdir(directorio, (err, files) => {
        if (files) {
            files.forEach(file => {
                var item = {
                    'name': file,
                    'size': (fse.statSync(join(directorio, file)).size / (1024 * 1024)).toFixed(2),
                    'created_at': fse.statSync(join(directorio, file)).birthtime,
                }
                backups.push(item);
            });
        } else {
            console.log("No hay files");
        }
    });
    backups.sort((a, b) => a.created_at - b.created_at);
    return backups;
}

funciones.encryptPass = async (password) => {
    const sal = await bcryptjs.genSalt(10);
    password = await bcryptjs.hash(password, sal);
    return password;
};

funciones.verifyPassword = async (password, hashedPassword) => {
    try {
        return await bcryptjs.compare(password, hashedPassword);
    } catch (e) {
        console.log(e);
    }
}

funciones.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.redirect('/signin');
}

funciones.isNotAuthenticated = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return next();
    }
    return res.redirect('/profile');
}

funciones.hasSanPrivileges = (req, res, next) => {
    if (req.user.privilegio == "san" || req.user.privilegio == "admin") {
        return next();
    }
    return res.redirect('/noperm');
}

funciones.hasNotSanPrivileges = (req, res, next) => {
    if (req.user.privilegio != "san" && req.user.privilegio != "admin") {
        return next();
    }
    return res.redirect('/noperm');
}

funciones.isAdmin = (req, res, next) => {
    if (req.user.privilegio == "admin") {
        return next();
    }
    return res.redirect('/noperm');
}

funciones.isNotAdmin = (req, res, next) => {
    if (!req.user.privilegio == "admin") {
        return next();
    }
    return res.redirect('/noperm');
}

funciones.insertarLog = async (usuario, accion, observacion) => {
    const log = {
        usuario,
        accion,
        observacion
    }
    try {
        console.log("Insertando log: " + stringify(log));
        const a = await query("insert into logs SET ?", [log]);
        return a;
    } catch (err) {
        console.log(err);
        return "error";
    }

}

funciones.dumpearSQL = (operacion) => {
    // dump the result straight to a file
    console.log("===============================");
    console.log(pool.config.connectionConfig);
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
            host: pool.config.connectionConfig.host,
            user: pool.config.connectionConfig.user,
            password: pool.config.connectionConfig.password,
            database: pool.config.connectionConfig.database,
        },
        dumpToFile: './src/public/dumpSQL/dumpSAN' + '-' + operacion + '-' + Date.now() + '.sql',
        dump: {
            tables,
        }
    });
}

funciones.runSQLrecovery =  (file) => {
    let ruta = join(__dirname,'..','public', 'dumpSQL',  file);

    var rl = createInterface({
        input: fse.createReadStream(ruta),
        terminal: false
    });
    let total = "";
    rl.on('line', function (chunk) {

        //Para evitar ejecucion de comentarios en la query
        if(chunk.toString('ascii').charAt(0) != '/')
            total += chunk.toString('ascii');
 
        
        if (chunk.toString('ascii').charAt(chunk.length - 1) == ';') {
            pool.query(total, function (err, sets, fields) { if (err) console.log(err); });
            total = "";
        }
    });
    rl.on('close', function () {
        console.log("finished");
    });
}

funciones.getCode = () => {
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

funciones.sendRecoveryMail = async (email, token) => (req, res) => {
}

funciones.consultaPrueba = async () => {
    let ruta = join(__dirname, '..', '..', 'database', 'prueba.sql');

    var rl = createInterface({

        input: fse.createReadStream(ruta),
        terminal: false
    });
    rl.on('line', function (chunk) {
        pool.query(chunk.toString('ascii'), function (err, sets, fields) {
            if (err) console.log(err);
        });
    });
    rl.on('close', function () {
        console.log("finished");
    });
}

export default funciones;