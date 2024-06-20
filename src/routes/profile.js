const express = require('express');
const router = express.Router();
const path = require('path');
const db = require("../database"); //db hace referencia a la BBDD
const { unlink } = require('fs-extra');
const { access, constants } = require('fs');
const funciones = require("../lib/funciones.js");

//MOSTRAR PERFIL  -RUD  
router.get('/profile', async (req, res) => {
    //console.log(req.user.id);
    const tickets = await db.query('select * from tickets where assigned_to_id=? and solved_at is null', [req.user.id]);
    //console.log(tickets);
    res.render('auth/profile', { tickets });
});
router.get('/profile/edit', (req, res) => {
    let permisos = { 'tecnicosan': false, 'admin': false };
    if (req.user.privilegio == 'admin')
        permisos = { 'esTecnico': false, 'esAdmin': true };
    if (req.user.privilegio == 'san')
        permisos = { 'esTecnico': true, 'esAdmin': false };
    //console.log(permisos);
    res.render('auth/profileEdit', { permisos });
});
router.post('/profile/edit', funciones.isAuthenticated, async (req, res) => {
    const rows = await db.query("SELECT * FROM usuarios WHERE id= ?", [req.body.id]);
    var user = rows[0];

    console.log(req.body.oldcontrasena + " / " + user.contrasena);
    const validPassword = await funciones.verifyPassword(req.body.oldcontrasena, user.contrasena);
    if (validPassword) {
        user.usuario = req.body.usuario;
        user.email = req.body.email;
        user.full_name = req.body.full_name;
        user.contrasena = await funciones.encryptPass(req.body.newcontrasena);
        //console.log("guardando en la BBDD");
        //console.log(user);
        const result = await db.query("UPDATE usuarios SET ? where id= ?", [user, req.body.id]);
        req.flash("success", "Usuario editado correctamente.");
        res.redirect('/profile');
    } else {
        req.flash("warning", "No has puesto la contraseña actual correctamente!");
        res.redirect('/noperm');
    }
});
router.get("/profile/delete/:id", funciones.isAuthenticated, async (req, res) => {
    console.log(req.params);
    const { id } = req.params;
    const user = await db.query("SELECT * FROM usuarios where id=?", id);
    //borramos foto
    const filePath = path.resolve('src/public/img/profiles/' + user.pictureURL);
    access(filePath, constants.F_OK, async (err) => {
        if (err) {
            console.log("No tiene foto de perfil");
        } else {
            console.log('File exists. Deleting now ...');
            await unlink(filePath);
        }
    });
    //hacemos logout
    req.logout(async function (err) {
        if (err) {
            return next(err);
        }
        await db.query("DELETE FROM sessions ");
        await db.query("DELETE FROM usuarios WHERE id=?", [id]);
    });
    req.flash("success", "Usuario borrado correctamente");
    res.redirect('/');
});
router.post('/doAdmin', funciones.isAuthenticated, async (req, res) => {
    const { pass, privilegio } = req.body;
    console.log(pass + " / " + db.config.connectionConfig.masterpass);
    console.log(req.user);
    const validPassword = await funciones.verifyPassword(pass, db.config.connectionConfig.masterpass);

    if (validPassword) {
        req.user.privilegio = privilegio;
        console.log("guardando en la BBDD");
        const result = await db.query("UPDATE usuarios SET ? where id= ?", [req.user, req.user.id]);
        req.flash("success", "Permisos de usuario actualizados correctamente");
        funciones.insertarLog(req.user.usuario, "UPDATE usuarios", "Se le añade permisos de admin");
        res.redirect('/profile');
    } else {
        res.redirect('/noperm');
    }
});

module.exports = router;