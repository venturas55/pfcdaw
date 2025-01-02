import express from 'express';
const router = express.Router();
import db from "../database.js"; //db hace referencia a la BBDD
import funciones from "../lib/funciones.js";

//MOSTRAR PAGINA INICIAL
router.get('/', (req, res) => {
    res.render('index');
});

//MOSTRAR CALCULOS
router.get('/calculos', (req, res) => {
    res.render('estaticas/calculos', { layout: 'layoutCalculos' });
});

//MOSTRAR PLAN
router.get('/plan', (req, res) => {
    res.render('estaticas/plan', { layout: 'layoutSimple' });
});

//GESTION LOGS
router.get("/logs", funciones.isAuthenticated, funciones.isAdmin, async (req, res) => {
    var logs = await db.query("select * from logs order by fecha desc");
    res.render("documentos/listadoLogs", { logs });
});

//MOSTRAR ERROR
router.get('/error', (req, res) => {
    res.render('estaticas/error');
});
router.get('/noperm', (req, res) => {
    res.render('estaticas/noPermission');
});

//MOSTRAR PRUEBA
router.get("/prueba", funciones.isAdmin, (req, res) => {
    console.log("Ejecutando prueba");
    funciones.consultaPrueba();
    req.flash("success", "Prueba ejecutada correctamente en index");
    //res.render("prueba");
});
router.post("/pruebaPost", funciones.isAdmin, async (req, res) => {
    var password = req.masterPass;
    userpass = req.body.pass;
    //console.log("==>" + req.masterPass);
    const validPassword = await funciones.verifyPassword(userpass, password);
    if (validPassword) {
        funciones.consultaPrueba();
        req.flash("success", "Prueba ejecutada correctamente crack");
        res.redirect("/");
    } else {
        req.flash("warning", "Sucedió algun error!");
        res.redirect("/noperm");
    }

});

export default router;