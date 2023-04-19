const express = require("express");
const router = express.Router();
const { unlink } = require('fs-extra');
const fs = require('fs');
const path = require('path');
const db = require("../database"); //db hace referencia a la BBDD
const multer = require('multer');
//const { access, constants } = require('node:fs');
//const { access, constants } = require('fs');
const funciones = require("../lib/funciones.js");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const { nif } = req.body;
        console.log("pasa");
        const dir = path.join(__dirname, '../public/img/imagenes/', nif);
        fs.access(dir, error => {
            if (error) {
                console.log("Directory does not exist.")
                fs.mkdirSync(dir, { recursive: true }, error => cb(error, dir));
            } else {
                console.log("Directory exists.")
            }
            return cb(null, dir);
        })
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
router.post("/aton/upload/:nif", uploadFoto, async (req, res) => {
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

router.get("/aton/fotos/:nif/:src/delete", async (req, res) => {
    const nif = req.params.nif;
    const src = req.params.src;
    await unlink(path.resolve('src/public/img/imagenes/' + nif + "/" + src));
    res.redirect("/aton/fotos/" + nif);
});


module.exports = router;