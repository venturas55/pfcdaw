const express = require('express');
const router = express.Router();
const db = require("../database"); //db hace referencia a la BBDD
const queryListadoAton = "SELECT b.nif,b.num_internacional,b.tipo,b.apariencia,b.periodo,b.caracteristica,lo.puerto,lo.num_local,lo.localizacion,lo.latitud,lo.longitud,la.altura,la.elevacion,la.alcanceNom,la.linterna,la.candelasCalc,la.alcanceLum,la.candelasInst FROM balizamiento b  LEFT JOIN localizacion lo ON lo.nif=b.nif  LEFT JOIN lampara la ON la.nif=b.nif";


//MOSTRAR PAGINA PRUEBA
router.get('/prueba', (req, res) => {
    res.render('prueba');
});

//CRUD ATON create
router.get("/add", (req, res) => {
    res.render("aton/add");
});
router.post("/add", async(req, res) => {
    const {
        nif,
        num_internacional,
        tipo,
        telecontrol,
        apariencia,
        periodo,
        caracteristica,
        puerto,
        num_local,
        localizacion,
        latitud,
        longitud,
        altura,
        elevacion,
        linterna,
        alcanceNom,
        alcanceLum,
        candelasCalc,
        candelasInst
    } = req.body;
    const newBalizamiento = {
        nif,
        num_internacional,
        tipo,
        telecontrol,
        apariencia,
        periodo,
        caracteristica,

    };
    const newBalizamientoLocalizacion = {
        nif,
        puerto,
        num_local,
        localizacion,
        latitud,
        longitud
    };
    const newBalizamientoLampara = {
        nif,
        altura,
        elevacion,
        linterna,
        alcanceNom,
        alcanceLum,
        candelasCalc,
        candelasInst
    };
    await db.query("INSERT INTO balizamiento set ?", [newBalizamiento]);
    await db.query("INSERT INTO localizacion set ?", [newBalizamientoLocalizacion]);
    await db.query("INSERT INTO lampara set ?", [newBalizamientoLampara]);
    res.redirect("/aton/list"); //te redirige una vez insertado el item
});

//CRUD ATON read
router.get("/list", async(req, res) => {
    const balizas = await db.query(
        queryListadoAton
    );
    res.render("aton/list", { balizas });

});


module.exports = router;