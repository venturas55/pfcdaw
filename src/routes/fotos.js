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
          } else{//si no, entonces es una foto de perfil y va a otra carpeta
            const dir = path.join(__dirname, '../public/img/profiles/');
            //console.log("dir" + dir);
            return cb(null, dir);
        }
       
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
        const extname = filetypes.test(path.extname(file.originalname));
        if (mimetype && extname) {
            return cb(null, true);
        }

        return cb(("Error: Archivo debe ser una imagen valida jpeg,jpg,png,bmp o gif"));
    }
}).single('imagen');

//GESTION FOTOS DE BALIZAS
router.post("/aton/upload/:nif", uploadFoto, funciones.isAuthenticated, async (req, res) => {
    console.log("Subiendo foto baliza");
    const { nif } = req.params;
    console.log(req.params);
    console.log(req.body);
    res.redirect("/aton/plantilla/" + nif);
});
router.get("/aton/fotos/:nif", async (req, res) => {
    const nif = req.params.nif;
    var fotos = funciones.listadoFotos(nif);
    res.render("aton/fotos", { fotos, nif });
});
router.get("/aton/fotos/:nif/:src/delete",  funciones.isAuthenticated, funciones.isAdmin, async (req, res) => {
    const nif = req.params.nif;
    const src = req.params.src;
    await unlink(path.resolve('src/public/img/imagenes/' + nif + "/" + src));
    res.redirect("/aton/fotos/" + nif);
});

//GESTION  foto perfil
router.post('/upload/:id', funciones.isAuthenticated,uploadFoto, async (req, res) => {
    const { id } = req.params;
    //console.log(req.file);
    var usuario = await db.query("select * from usuarios where id = ?", id);
    usuario = usuario[0];

    //borramos la foto anterior del perfil
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

    //Ponemos la nueva
    usuario.pictureURL = req.file.filename;
    await db.query("UPDATE usuarios set  ? WHERE id=?", [usuario, id]);
    req.flash("success", "Foto de perfil actualizada con exito");
    res.redirect("/profile");
});
router.get("/profile/borrarfoto/:id/:url", funciones.isAuthenticated, async(req, res) => {
    //console.log(req.params);
    const { url } = req.params;
    const { id } = req.params;
    await db.query("UPDATE usuarios set pictureURL = NULL WHERE id=?", [id]);
    const filePath = path.resolve('src/public/img/profiles/' + url);
    access(filePath, constants.F_OK, async(err) => {
        if (err) {
            console.log("No tiene foto de perfil");
        } else {
            console.log('File exists. Deleting now ...');
            await unlink(filePath);
        }
    });
    req.flash("success", "Imagen borrada correctamente");
    res.redirect('/profile');
});




module.exports = router;