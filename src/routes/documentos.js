const express = require("express");
const router = express.Router();
const { unlink } = require('fs-extra');
const path = require('path');
const funciones = require("../lib/funciones");
const db = require("../database"); //db hace referencia a la BBDD
const multer = require('multer');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../public/documentos');
    fs.exists(dir, exist => {
      if (!exist) {
        return fs.mkdir(dir, error => cb(error, dir));
      }
      return cb(null, dir);
    })
  },
  filename: (req, file, cb) => {
    cb(null, (uuidv4() + path.extname(file.originalname)).toLowerCase());
  }
});
const uploadDocument = multer({
  storage,
  limits: { fileSize: 10000000, },
}).single('documento');

//CRUD read
router.get("/documentos", async (req, res) => {
  const docus = await db.query("select * from documentos")
  console.log(docus);
  res.render("documentos/documentos", { docus });
});
router.get("/documentoUpload", (req, res) => {
  res.render("documentos/documentoUpload");
});
router.post("/documentos", uploadDocument, funciones.isAuthenticated, async (req, res) => {
  //console.log(req.body);
  //console.log(req.file);
  const { nombre, descripcion } = req.body;
  const archivo = req.file.filename;
  const newDoc={'id_archivo':archivo,nombre,descripcion,}
  await db.query("insert into documentos set ?",[newDoc]);
  funciones.insertarLog(req.user.usuario,"INSERT documento",archivo);
  req.flash("success", "Documento subido correctamente");
  res.redirect("/documentos");
});
router.get("/documentoDelete/:id", funciones.isAuthenticated,funciones.isAdmin, async (req, res) => {
  const id_archivo = req.params.id;
  const filePath = path.resolve('src/public/documentos/' + id_archivo);
  //await unlink(filePath);
  await db.query("delete from documentos where id_archivo = ?",[id_archivo]);
  funciones.insertarLog(req.user.usuario,"DELETE documento",id_archivo);
  req.flash("success", "Documento borrado correctamente");
  const docus = await db.query("select * from documentos")
  res.render("documentos/documentos", { docus });
});
router.get("/documentoEdit/:id",funciones.isAuthenticated,funciones.hasSanPrivileges, async (req, res) => {
  const id_archivo = req.params.id;
  const doc= await db.query("select * from documentos where id_archivo=?",[id_archivo]);
  res.render("documentos/documentoEdit",{documento: doc[0]});
});
router.post("/documentoEdit/:id", funciones.isAuthenticated,funciones.hasSanPrivileges,async (req, res) => {
  const id_archivo = req.params.id;
  const nombre = req.body.nombre;
  const descripcion= req.body.descripcion;
  const newDoc={id_archivo,nombre,descripcion};
  await db.query("update documentos set ? where id_archivo=?",[newDoc,id_archivo]);
  funciones.insertarLog(req.user.usuario,"UPDATE documento",nombre + " " + descripcion);
  req.flash("success", "Documento editado correctamente");
  res.redirect("/documentos");
});

module.exports = router;