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
router.get("/pruebas/:filename", funciones.isAdmin, (req, res) => {
    let filename = req.params.filename+".sql";
    console.log("Ejecutando prueba");
    try {

        funciones.consultaPrueba(filename);
        req.flash("success", "Archivo " + filename + " ejecutada correctamente");
        res.redirect("/");
    }
    catch {
        req.flash("error", "Archivo " + filename + " no ejecutada correctamente");
        res.redirect("/");
    }
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

router.get("/pruebas2", funciones.isAuthenticated, funciones.isAdmin, async (req, res) => {
    try {
        var baliza = await db.query("SELECT * FROM localizacion", [nif]);
        for (var i = 0; i < baliza.length; i++) {
            var punto = getPointfromLatLng(baliza[i].latitud, baliza[i].longitud);
            await db.query("UPDATE localizacion set coordenadas= point(?,?) WHERE nif = ?", [punto.lat, punto.lng, baliza[i].nif]);
        }
        req.flash("success", "Comando ejecutado correctamente");
        res.redirect("/");
    } catch (error) {
        console.error(error);
        req.flash("error", "Hubo algun error al ejecutar el comando");
        res.redirect("/error");
    }
});

export default router;