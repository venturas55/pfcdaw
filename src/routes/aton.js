const express = require('express');
const router = express.Router();
const path = require('path');
const db = require("../database"); //db hace referencia a la BBDD
const funciones = require("../lib/funciones.js");
const fs = require('fs').promises;
const queryListadoAton = "SELECT b.nif,b.num_internacional,b.tipo,b.apariencia,b.periodo,b.caracteristica,lo.puerto,lo.num_local,lo.localizacion,lo.latitud,lo.longitud,la.altura,la.elevacion,la.alcanceNom,la.linterna,la.candelasCalc,la.alcanceLum,la.candelasInst FROM balizamiento b  LEFT JOIN localizacion lo ON lo.nif=b.nif  LEFT JOIN lampara la ON la.nif=b.nif";


//MOSTRAR PAGINA PRUEBA
router.get('/prueba', (req, res) => {
    res.render('prueba');
});

//CRUD ATON create
router.get("/add", funciones.isAuthenticated, (req, res) => {
    res.render("aton/add");
});
router.post("/add", funciones.isAuthenticated, async (req, res) => {
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
    for (let clave in newBalizamiento) {
        if (!newBalizamiento[clave]) {
            newBalizamiento[clave] = null;
        }
    }

    for (let clave in newBalizamientoLocalizacion) {
        if (!newBalizamientoLocalizacion[clave]) {
            newBalizamientoLocalizacion[clave] = null;
        }
    }

    for (let clave in newBalizamientoLampara) {
        if (!newBalizamientoLampara[clave]) {
            newBalizamientoLampara[clave] = null;
        }
    }

    //console.log(newBalizamiento);
    await db.query("INSERT INTO balizamiento set ?", [newBalizamiento]);
    await db.query("INSERT INTO localizacion set ?", [newBalizamientoLocalizacion]);
    await db.query("INSERT INTO lampara set ?", [newBalizamientoLampara]);
    funciones.insertarLog(req.user.usuario, "INSERT balizamiento", newBalizamiento.nif);
    req.flash("success", "Baliza insertada correctamente");
    res.redirect("/aton/list"); //te redirige una vez insertado el item
});

//CRUD ATON read
router.get("/list", async (req, res) => {
    const balizas = await db.query( queryListadoAton );
    res.render("aton/list", { balizas });

});
router.get("/list/:busqueda", async (req, res) => {
    var { busqueda } = req.params;
    var balizas;
    if (busqueda === 'Ext') {
        //console.log("Externas");
        balizas = await db.query(queryListadoAton + " where b.nif=lo.nif AND lo.puerto not like '%valencia%' and lo.puerto not like '%sagunto%' and lo.puerto not like '%gandia%' order by lo.nif");
    } else {
        busqueda = "%" + busqueda + "%";
        balizas = await db.query(queryListadoAton + " where b.nif=lo.nif AND lo.puerto like ? order by lo.nif", busqueda);
        //like is case insensitive por defecto. En caso de quererlo sensitivo hay que añadir solo "like binary"
    }
    res.render("aton/list", { balizas });
    // NO FUNCIONA CON LA BARRA DELANTE res.render('/links/list');
});
router.get("/list/:filtro/:valor", async (req, res) => {
    var obj = req.params;
    var balizas;
    //Añadimos porcentajes para busqueda SQL que contenga 'busqueda' y lo que sea por delante y por detras
    obj.valor = "%" + obj.valor + "%";

    if (obj.filtro == "tipo" || obj.filtro == "apariencia")
        obj.filtro = "b." + obj.filtro;
    else
        obj.filtro = "lo." + obj.filtro;

    var sqlQuery = queryListadoAton + " where b.nif=lo.nif AND " + obj.filtro + " like ? order by lo.nif";
    balizas = await db.query(sqlQuery, obj.valor);
    //console.log(balizas);
    //like is case insensitive por defecto. En caso de quererlo sensitivo hay que añadir solo "like binary"
    res.render("aton/list", { layout: 'layoutList', balizas });
    // NO FUNCIONA CON LA BARRA DELANTE res.render('/links/list');
});
router.get("/plantilla/:nif", async (req, res) => {
    const { nif } = req.params;
    //const baliza = await db.query('SELECT * FROM balizamiento b  LEFT JOIN localizacion lo ON lo.nif=b.nif  LEFT JOIN lampara la ON la.nif=b.nif where b.nif=?', [nif]);  CON ESTA CONSULTA EL LEFT JOIN NO FUNCIONA BIEN PARA EL HIPOTETICO CASO EN EL QUE EXISTE UN ATON QUE NO ESTA EN ALGUNA DE LAS TRES TABLAS
    const baliza = await db.query(queryListadoAton + ' where b.nif=?', [nif]);
    //console.log(baliza[0]);
    const observaciones = await db.query('SELECT * FROM observaciones where nif=?', [nif]);
    const mantenimiento = await db.query('SELECT * FROM mantenimiento where nif=? order by fecha DESC', [nif]);
    var fotos = funciones.listadoFotos(nif);
    res.render("aton/plantilla", { layout: 'layoutPlantilla',baliza: baliza[0], obs: observaciones, mant: mantenimiento ,fotos});
    // NO FUNCIONA CON LA BARRA DELANTE res.render('/links/list');
});

//CRUD ATON update
router.get("/editCaracteristicas/:nif", funciones.isAuthenticated, async (req, res) => {
    const { nif } = req.params;
    var baliza = await db.query("SELECT * FROM balizamiento WHERE nif=?", [nif]);

    if (baliza[0] == null || baliza[0] == undefined) {
        baliza = { nif };
    } else {
        baliza = baliza[0];
    }
    res.render("aton/editCaracteristicas", { baliza});
});
router.get("/editLocalizacion/:nif",funciones.isAuthenticated,  async (req, res) => {
    const { nif } = req.params;
    var baliza = await db.query("SELECT * FROM localizacion WHERE nif=?", [nif]);
    if (baliza[0] == null || baliza[0] == undefined) {
        baliza = { nif };
    } else {
        baliza = baliza[0];
    }
    console.log(baliza);
    res.render("aton/editLocalizacion",{ baliza });
});
router.get("/editLampara/:nif", funciones.isAuthenticated, async (req, res) => {
    const { nif } = req.params;
    var baliza = await db.query("SELECT * FROM lampara WHERE nif=?", [nif]);
    if (baliza[0] == null || baliza[0] == undefined) {
        baliza = { nif };
    } else {
        baliza = baliza[0];
    }
    res.render("aton/editLampara",{ baliza });
});
router.post("/editCaracteristicas/:nif",funciones.isAuthenticated,  async (req, res) => {
    const nifviejo = req.params.nif;
    var {
        nif,
        num_internacional,
        tipo,
        telecontrol,
        apariencia,
        periodo,
        caracteristica,
    } = req.body;
    periodo = parseInt(periodo);
    const newBaliza = {
        nif: nifviejo,
        num_internacional,
        tipo,
        telecontrol,
        apariencia,
        periodo,
        caracteristica,
    };
    await db.query("UPDATE balizamiento set ? WHERE nif = ?", [
        newBaliza,
        nifviejo,
    ]);
    funciones.insertarLog(req.user.usuario, "UPDATE balizamiento", newBaliza.nif + " " + newBaliza.num_internacional + " " + newBaliza.tipo + " " + newBaliza.telecontrol + newBaliza.apariencia + " " + newBaliza.periodo + " " + newBaliza.caracteristica);
    req.flash("success", "Baliza modificada correctamente");

    res.redirect("/aton/plantilla/" + nifviejo);
});
router.post("/editLocalizacion/:nif", funciones.isAuthenticated, async (req, res) => {
    const nifviejo = req.params.nif;
    var {
        puerto,
        num_local,
        localizacion,
        latitud,
        longitud,
    } = req.body;
    const newBaliza = {
        nif: nifviejo,
        puerto,
        num_local,
        localizacion,
        latitud,
        longitud,
    };
    var baliza = await db.query("SELECT * FROM localizacion WHERE nif=?", [nifviejo]);
    if (baliza[0] == null || baliza[0] == undefined) {
        await db.query("INSERT into localizacion set ? ", [newBaliza]);
    } else {
        await db.query("UPDATE localizacion set ? WHERE nif = ?", [newBaliza, nifviejo]);
    }
    funciones.insertarLog(req.user.usuario, "UPDATE localizacion", newBaliza.nif + " " + newBaliza.puerto + " " + newBaliza.num_local + " " + newBaliza.localizacion + " " + newBaliza.latitud + " " + newBaliza.longitud);
    req.flash("success", "Localizacion de baliza modificada correctamente");
    res.redirect("/aton/plantilla/" + nifviejo);
});
router.post("/editLampara/:nif", funciones.isAuthenticated, async (req, res) => {
    const nifviejo = req.params.nif;
    var {
        altura,
        elevacion,
        alcanceNom,
        linterna,
        candelasCalc,
        alcanceLum,
        candelasInst,
    } = req.body;
    const newBaliza = {
        nif: nifviejo,
        altura,
        elevacion,
        alcanceNom,
        linterna,
        candelasCalc,
        alcanceLum,
        candelasInst,
    };

    var baliza = await db.query("SELECT * FROM lampara WHERE nif=?", [nifviejo]);
    if (baliza[0] == null || baliza[0] == undefined) {
        await db.query("INSERT into lampara set ? ", [newBaliza]);
    } else {
        await db.query("UPDATE lampara set ? WHERE nif = ?", [newBaliza, nifviejo]);
    }
    
    funciones.insertarLog(req.user.usuario, "UPDATE lampara", newBaliza.nif + " " + newBaliza.altura + " " + newBaliza.elevacion + " " + newBaliza.alcanceNom + " " + newBaliza.linterna + " " + newBaliza.candelasCalc + " " + newBaliza.alcanceLum + " " + newBaliza.candelasInst);
    req.flash("success", "Lampara del aton modificada correctamente");
    res.redirect("/aton/plantilla/" + nifviejo);

});

//CRUD ATON delete
router.get("/delete/:nif", funciones.isAuthenticated, funciones.isAdmin, async (req, res) => {
    console.log("Borrando aton " + req.params.nif + "...");
    const { nif } = req.params;

    await db.query("DELETE FROM mantenimiento WHERE nif=?", [nif]);
    await db.query("DELETE FROM observaciones WHERE nif=?", [nif]);
    await db.query("DELETE FROM localizacion WHERE nif=?", [nif]);
    await db.query("DELETE FROM lampara WHERE nif=?", [nif]);
    await db.query("DELETE FROM balizamiento WHERE nif=?", [nif]);
    funciones.insertarLog(req.user.usuario, "DELETE aton ", req.params.nif);
    req.flash("success", "Baliza borrada correctamente");
    res.redirect("/aton/list");
});

//GESTION CRUD observaciones
router.post("/observaciones/add", funciones.isAuthenticated,async (req, res) => {
    const {
        nif,
        observaciones,
    } = req.body;
    const observa = {
        nif,
        observaciones,
    };
    //console.log(observa);
    await db.query("INSERT INTO observaciones set ?", [observa]);
    req.flash("success", "Observacion insertada correctamente");
    funciones.insertarLog(req.user.usuario, "INSERT observaciones", observa.nif + " " + observa.observaciones);
    res.redirect("/aton/plantilla/" + nif);
});
router.get("/observaciones/delete/:idObs",funciones.isAuthenticated, async (req, res) => {
    //console.log(req.params.idObs);
    const { idObs } = req.params;
    const resp = await db.query("select nif from observaciones where id_observacion=?", [idObs]);
    const nif = resp[0].nif;
    await db.query("delete from observaciones where id_observacion=?", [idObs]);
    funciones.insertarLog(req.user.usuario, "DELETE observaciones del aton ", nif);
    req.flash("success", "Observacion de baliza " + nif + " borrada correctamente.");
    res.redirect("/aton/plantilla/" + nif);
});
router.get("/observaciones/edit/:idObs",funciones.isAuthenticated, async (req, res) => {
    const { idObs } = req.params;
    //console.log("Que id es: " + idObs);
    const observacion = await db.query("SELECT * FROM observaciones WHERE id_observacion=?", [idObs,]);
    //console.log(baliza);
    //console.log(baliza[0]);
    res.render("aton/editObservaciones", { observacion: observacion[0] });
});
router.post("/observaciones/edit/:idObs", funciones.isAuthenticated,async (req, res) => {

    var {
        id_observacion,
        nif,
        observacionNueva,
    } = req.body;

    const newObservacion = {
        id_observacion,
        nif,
        observaciones: observacionNueva,
    };
    await db.query("UPDATE observaciones set ? WHERE id_observacion = ?", [
        newObservacion,
        id_observacion,
    ]);
    funciones.insertarLog(req.user.usuario, "UPDATE observaciones", newObservacion.nif + " " + newObservacion.observaciones);
    req.flash("success", "Observacion modificada correctamente en la baliza " + nif);
    res.redirect("/aton/plantilla/" + nif);
});

//GESTION CRUD mantenimiento
router.post("/mantenimiento/add", funciones.isAuthenticated,async (req, res) => {
    const {
        nif,
        fecha,
        mantenimiento,
    } = req.body;
    const mant = {
        nif,
        fecha,
        mantenimiento,
    };
    //console.log(mant);
    await db.query("INSERT INTO mantenimiento set ?", [mant]);
    funciones.insertarLog(req.user.usuario, "INSERT mantenimiento", mant.nif + " " + mant.fecha + " " + mant.mantenimiento);
    req.flash("success", "Mantenimiento en baliza insertado correctamente");
    res.redirect("/aton/plantilla/" + nif);
});
router.get("/mantenimiento/delete/:idMan", funciones.isAuthenticated, funciones.isAdmin,async (req, res) => {
    //console.log(req.params.idMan);
    const { idMan } = req.params;
    const resp = await db.query("select nif from mantenimiento where id_mantenimiento=?", [idMan]);
    const nif = resp[0].nif;
    await db.query("delete from mantenimiento where id_mantenimiento=?", [idMan]);
    funciones.insertarLog(req.user.usuario, "DELETE mantenimientos del aton", nif);
    req.flash("success", "mantenimiento de baliza " + nif + " borrado correctamente ");
    res.redirect("/aton/plantilla/" + nif);
});
router.get("/mantenimiento/edit/:idMan", funciones.isAuthenticated,async (req, res) => {
    const { idMan } = req.params;
    //console.log("Que id es: "+idMan);
    const mantenimient = await db.query("SELECT * FROM mantenimiento WHERE id_mantenimiento=?", [idMan,]);
    //console.log(mantenimient[0]);
    res.render("aton/editMantenimiento", { mant: mantenimient[0] });

});
router.post("/mantenimiento/edit/:idMan", funciones.isAuthenticated,async (req, res) => {
    var {
        id_mantenimiento,
        nif,
        fechaNueva,
        mantenimientoNuevo
    } = req.body;
    const newObservacion = {
        id_mantenimiento,
        nif,
        fecha: fechaNueva,
        mantenimiento: mantenimientoNuevo,
    };
    await db.query("UPDATE mantenimiento set ? WHERE id_mantenimiento = ?", [
        newObservacion,
        id_mantenimiento,
    ]);
    funciones.insertarLog(req.user.usuario, "UPDATE mantenimiento", newObservacion.nif + " " + newObservacion.fecha + " " + newObservacion.mantenimiento);
    req.flash("success", "Mantenimiento modificado correctamente en la baliza " + nif);
    res.redirect("/aton/plantilla/" + nif);
});


module.exports = router;