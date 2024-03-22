const express = require("express");
const router = express.Router();
const { unlink } = require('fs-extra');
const fs = require('fs');
const path = require('path');
const db = require("../database"); //db hace referencia a la BBDD
const multer = require('multer');
//const { access, constants } = require('node:fs');
const { access, constants } = require('fs');
const funciones = require("../lib/funciones.js");
const zl = require("zip-lib");



const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const { nif } = req.body;
        const { user } = req.body;
        //Si usuario es undefined es que se subió una baliza, y configuro el storage para balizas
        if (typeof user === 'undefined') {
            const dir = path.join(__dirname, '../public/img/imagenes/', nif);
            fs.access(dir, error => {
                if (error) {
                    console.log("Directory does not exist.")
                    fs.mkdirSync(dir, { recursive: true }, error => cb(error, dir));
                } else {
                    console.log("Directory exists.")
                }
                return cb(null, dir);
            });
        } else {//si no, entonces es una foto de perfil y va a otra carpeta
            const dir = path.join(__dirname, '../public/img/profiles/');
            //console.log("dir" + dir);
            return cb(null, dir);
        }

    },
    filename: (req, file, cb) => {
        cb(null, new Date().getTime() + path.extname(file.originalname).toLowerCase());
    }
});

const storage2 = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../public/dumpFOTOS/');
        console.log("dir " + dir);
        return cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, new Date().getTime() + path.extname(file.originalname).toLowerCase());
    }
});


const uploadFoto = multer({
    storage,
    limits: { fileSize: 5000000, },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|bmp|gif/;
        const mimetype = filetypes.test(file.mimetype);
        console.log(mimetype + "es el 1");
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        return cb(("Error: Archivo debe ser una imagen valida jpeg,jpg,png,bmp o gif"));
    }
}).single('imagen');

const uploadFoto2 = multer({
    storage: storage2,
    limits: { fileSize: 2000000000, },
    fileFilter: (req, file, cb) => {
        const filetypes = /zip/;
        const mimetype = filetypes.test(file.mimetype);
        console.log(mimetype + " es el 2");
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            funciones.insertarLog(req.user.usuario, "INSERT zip backup fotos ",file.originalname.toLowerCase());
            return cb(null, true);
        }
        return cb(("Error: Archivo debe ser un *.zip"));
    }
}).single('backup');

//GESTION FOTOS DE BALIZAS
router.post("/aton/upload/:nif", funciones.isAuthenticated, funciones.hasSanPrivileges, uploadFoto, async (req, res) => {
    console.log("Subiendo foto baliza");
    const { nif } = req.params;

    req.flash("success", "Nueva fotografia insertada correctamente");
    funciones.insertarLog(req.user.usuario, "INSERT fotografia", nif);
    res.redirect("/aton/plantilla/" + nif);
});
router.get("/aton/fotos/:nif", async (req, res) => {
    const nif = req.params.nif;
    var fotos = funciones.listadoFotos(nif);
    res.render("aton/fotos", { fotos, nif });
});
router.get("/aton/fotos/:nif/:src/delete", funciones.isAuthenticated, funciones.isAdmin, async (req, res) => {
    const nif = req.params.nif;
    const src = req.params.src;
    await unlink(path.resolve('src/public/img/imagenes/' + nif + "/" + src));
    req.flash("success", "Fotografia borrada correctamente");
    funciones.insertarLog(req.user.usuario, "DELETE fotografia", nif);
    res.redirect("/aton/fotos/" + nif);
});


//BACKUPS DE FOTOS
router.get("/backupsfotos", funciones.isAuthenticated, funciones.hasSanPrivileges, async (req, res) => {
 
    var backups = funciones.listadoBackupsFotos();
    console.log(backups);
    res.render("fotos/listadoBackupFotos", { backups });
});
router.get("/backupsfotos/del/:nombre", funciones.isAuthenticated, funciones.isAdmin, async (req, res) => {
    var { nombre } = req.params;
    var file = path.resolve('src/public/dumpFOTOS', nombre);
    //console.log(file);
    await fs.unlinkSync(file);
    funciones.insertarLog(req.user.usuario, "DELETE backup fotos", nombre);
    res.redirect('/backupsfotos');
});
router.get("/aton/fotos/backup/zip",funciones.isAuthenticated, funciones.hasSanPrivileges, async (req, res) => {
    console.log("Voy backup fotos");
    const dir = path.join(__dirname, '../public/img/imagenes');
    const dirbackups = path.join(__dirname, '../public/dumpFOTOS');
    zl.archiveFolder(dir, dirbackups + "/target.zip").then(function () {
        console.log("done");
        req.flash("success", "Fotos backup realizado correctamente");
        res.redirect('/backupsfotos');
    }, function (err) {
        console.log(err);
        req.flash("error", "Hubo algun error al realizar el backup de fotos");
        res.redirect('/backupsfotos');
    });
});

router.post("/aton/fotos/backup/upload", funciones.isAuthenticated, funciones.hasSanPrivileges, uploadFoto2, async (req, res) => {
    console.log("Subiendo fotos en zip");
    req.flash("success", "backup fotos subido correctamente");
    res.redirect('/backupsfotos');
});

router.get("/aton/fotos/backup/unzip/:nombre", funciones.isAuthenticated, funciones.hasSanPrivileges,async (req, res) => {
    var { nombre } = req.params;
    const dir = path.join(__dirname, '../public/img/imagenes');
    const backupPath = path.join(__dirname, '../public/dumpFOTOS/');
       //TODO: COMPROBAR EL FORMATO DE DIRECTORIO DEL ZIP
    zl.extract(backupPath+nombre, dir).then(function () {
        console.log("done");
        req.flash("success", "Pack de Fotos descomprimido correctamente");
        res.redirect('/backupsfotos');
    }, function (err) {
        console.log(err);
        req.flash("error", "Hubo algun error al descomprimir el backup de fotos");
        res.redirect('/backupsfotos');
    });
});

//GESTION  foto perfil
router.post('/upload/:id', funciones.isAuthenticated, uploadFoto, async (req, res) => {
    const { id } = req.params;
    //console.log(req.file);
    var usuario = await db.query("select * from usuarios where id = ?", id);
    usuario = usuario[0];

    //borramos la foto anterior del perfil
    if (usuario.pictureURL != "") {
        const filePath = path.resolve('src/public/img/profiles/' + usuario.pictureURL);
        access(filePath, constants.F_OK, async (err) => {
            if (err) {
                req.flash("warning", "No tiene foto de perfil!");
                console.log("No tiene foto de perfil");
            } else {
                console.log('File exists. Deleting now ...');
                await unlink(filePath);
            }
        });
    }

    //Ponemos la nueva
    usuario.pictureURL = req.file.filename;
    await db.query("UPDATE usuarios set  ? WHERE id=?", [usuario, id]);
    funciones.insertarLog(req.user.usuario, "UPDATE fotografia perfil", "");
    req.flash("success", "Foto de perfil actualizada con exito");
    res.redirect("/profile");
});
router.get("/profile/borrarfoto/:id/:url", funciones.isAuthenticated, async (req, res) => {
    //console.log(req.params);
    const { url } = req.params;
    const { id } = req.params;
    await db.query("UPDATE usuarios set pictureURL = NULL WHERE id=?", [id]);
    const filePath = path.resolve('src/public/img/profiles/' + url);
    access(filePath, constants.F_OK, async (err) => {
        if (err) {
            console.log("No tiene foto de perfil");
        } else {
            console.log('File exists. Deleting now ...');
            await unlink(filePath);
        }
    });
    funciones.insertarLog(req.user.usuario, "DELETE fotografia perfil", "");
    req.flash("success", "Imagen borrada correctamente");
    res.redirect('/profile');
});

module.exports = router;