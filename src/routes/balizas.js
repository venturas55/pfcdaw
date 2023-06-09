const express = require("express");
const router = express.Router();
const { unlink } = require('fs-extra');
const path = require('path');
const helpers = require("../lib/helpers");
const db = require("../database"); //db hace referencia a la BBDD
const fs = require('fs').promises
const queryListadoAton = "SELECT b.nif,b.num_internacional,b.tipo,b.apariencia,b.periodo,b.caracteristica,b.telecontrol,b.necesita_pintado,lo.puerto,lo.num_local,lo.localizacion,lo.latitud,lo.longitud,la.altura,la.elevacion,la.alcanceNom,la.linterna,la.candelasCalc,la.alcanceLum,la.candelasInst FROM balizamiento b  LEFT JOIN localizacion lo ON lo.nif=b.nif  LEFT JOIN lampara la ON la.nif=b.nif";


//CRUD ATON create
router.get("/add", helpers.isAuthenticated, (req, res) => {
    res.render("balizas/add");
});
router.post("/add", helpers.isAuthenticated, async(req, res) => {
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
    helpers.insertarLog(req.user.usuario, "INSERT balizamiento", newBalizamiento.nif);
    req.flash("success", "Baliza insertada correctamente");
    res.redirect("/balizas/list"); //te redirige una vez insertado el item
});

//CRUD ATON read
router.get("/list", async(req, res) => {
    const balizas = await db.query(
        queryListadoAton
    );
    res.render("balizas/list", { balizas });
  
});
router.get("/list/:busqueda", async(req, res) => {
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
    res.render("balizas/list", { layout: 'layoutList', balizas });
    // NO FUNCIONA CON LA BARRA DELANTE res.render('/links/list');
});
router.get("/list/:filtro/:valor", async(req, res) => {
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
    res.render("balizas/list", { layout: 'layoutList', balizas });
    // NO FUNCIONA CON LA BARRA DELANTE res.render('/links/list');
});
router.get("/list/:filtro/:valor/:filtro2/:valor2", async(req, res) => {
    var obj = req.params;
    var balizas;
    //Añadimos porcentajes para busqueda SQL que contenga 'busqueda' y lo que sea por delante y por detras
    obj.valor = "%" + obj.valor + "%";
    obj.valor2 = "%" + obj.valor2 + "%";

    if (obj.filtro == "tipo" || obj.filtro == "apariencia")
        obj.filtro = "b." + obj.filtro;
    else
        obj.filtro = "lo." + obj.filtro;

    if (obj.filtro2 == "tipo" || obj.filtro2 == "apariencia")
        obj.filtro2 = "b." + obj.filtro2;
    else
        obj.filtro2 = "lo." + obj.filtro2;

    var sqlQuery = queryListadoAton + " where b.nif=lo.nif AND " + obj.filtro + " like ? order by lo.nif";
    balizas = await db.query(sqlQuery, obj.valor);
    //console.log(balizas);
    //like is case insensitive por defecto. En caso de quererlo sensitivo hay que añadir solo "like binary"
    res.render("balizas/list", { balizas });
    // NO FUNCIONA CON LA BARRA DELANTE res.render('/links/list');
});
router.get("/plantilla/:nif", async(req, res) => {
    const { nif } = req.params;
    //const baliza = await db.query('SELECT * FROM balizamiento b  LEFT JOIN localizacion lo ON lo.nif=b.nif  LEFT JOIN lampara la ON la.nif=b.nif where b.nif=?', [nif]);  CON ESTA CONSULTA EL LEFT JOIN NO FUNCIONA BIEN PARA EL HIPOTETICO CASO EN EL QUE EXISTE UN ATON QUE NO ESTA EN ALGUNA DE LAS TRES TABLAS
    const baliza = await db.query(queryListadoAton + ' where b.nif=?', [nif]);
    //console.log(baliza[0]);
    const observaciones = await db.query('SELECT * FROM observaciones where nif=?', [nif]);
    const mantenimiento = await db.query('SELECT * FROM mantenimiento where nif=? order by fecha DESC', [nif]);
    var fotos = helpers.listadoFotos(nif);
    //console.log(">>");
    //console.log(fotos);
    res.render("balizas/plantilla", { layout: 'layoutPlantilla', baliza: baliza[0], obs: observaciones, mant: mantenimiento, fotos });
    // NO FUNCIONA CON LA BARRA DELANTE res.render('/links/list');
});

//CRUD ATON update
router.get("/editCaracteristicas/:nif", helpers.isAuthenticated, async(req, res) => {
    const { nif } = req.params;
    var baliza = await db.query("SELECT * FROM balizamiento WHERE nif=?", [ nif,] );
        if (baliza[0] == null || baliza[0] == undefined) {
        baliza = { nif };
    } else {
        baliza = baliza[0];
    }
        
    res.render("balizas/editCaracteristicas", { baliza});
});
router.get("/editLocalizacion/:nif", helpers.isAuthenticated, async(req, res) => {
    const { nif } = req.params;
    var baliza = await db.query("SELECT * FROM localizacion WHERE nif=?", [nif]);
    if (baliza[0] == null || baliza[0] == undefined) {
        baliza = { nif };
    } else {
        baliza = baliza[0];
    }
    res.render("balizas/editLocalizacion", { baliza });
});
router.get("/editLampara/:nif", helpers.isAuthenticated, async(req, res) => {
    const { nif } = req.params;
    var baliza = await db.query("SELECT * FROM lampara WHERE nif=?", [nif]);
    if (baliza[0] == null || baliza[0] == undefined) {
        baliza = { nif };
    } else {
        baliza = baliza[0];
    }
    res.render("balizas/editLampara", { baliza });
});
router.post("/editCaracteristicas/:nif", helpers.isAuthenticated, async(req, res) => {
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
    const newBaliza = {
        nif: nifviejo,
        num_internacional,
        tipo,
        telecontrol,
        apariencia,
        periodo,
        caracteristica,
    };
    //console.log(newBaliza);
    //console.log("req.params " + req.params.nif);
    await db.query("UPDATE balizamiento set ? WHERE nif = ?", [ newBaliza, nifviejo ]);
    helpers.insertarLog(req.user.usuario, "UPDATE balizamiento", newBaliza.nif + " " + newBaliza.num_internacional + " " + newBaliza.tipo + " " + newBaliza.telecontrol + newBaliza.apariencia + " " + newBaliza.periodo + " " + newBaliza.caracteristica);
    req.flash("success", "Baliza modificada correctamente");
    res.redirect("/balizas/plantilla/" + nifviejo);
});
router.post("/editLocalizacion/:nif", helpers.isAuthenticated, async(req, res) => {
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
    helpers.insertarLog(req.user.usuario, "UPDATE localizacion", newBaliza.nif + " " + newBaliza.puerto + " " + newBaliza.num_local + " " + newBaliza.localizacion + " " + newBaliza.latitud + " " + newBaliza.longitud);
    req.flash("success", "Localizacion de baliza modificada correctamente");
    res.redirect("/balizas/plantilla/" + nifviejo);
});
router.post("/editLampara/:nif", helpers.isAuthenticated, async(req, res) => {
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


    helpers.insertarLog(req.user.usuario, "UPDATE lampara", newBaliza.nif + " " + newBaliza.altura + " " + newBaliza.elevacion + " " + newBaliza.alcanceNom + " " + newBaliza.linterna + " " + newBaliza.candelasCalc + " " + newBaliza.alcanceLum + " " + newBaliza.candelasInst);
    req.flash("success", "Lampara del aton modificada correctamente");
    res.redirect("/balizas/plantilla/" + nifviejo);
});

//CRUD ATON delete
router.get("/delete/:nif", helpers.isAuthenticated, helpers.isAdmin, async(req, res) => {
    console.log("Borrando aton " + req.params.nif + "...");
    const { nif } = req.params;

    FOLDER_TO_REMOVE = path.join(__dirname, '../public/img/imagenes/' + nif);
    fs.rm(FOLDER_TO_REMOVE, { recursive: true, force: true });

    await db.query("DELETE FROM mantenimiento WHERE nif=?", [nif]);
    await db.query("DELETE FROM observaciones WHERE nif=?", [nif]);
    await db.query("DELETE FROM localizacion WHERE nif=?", [nif]);
    await db.query("DELETE FROM lampara WHERE nif=?", [nif]);
    await db.query("DELETE FROM balizamiento WHERE nif=?", [nif]);
    helpers.insertarLog(req.user.usuario, "DELETE aton ", req.params.nif);
    req.flash("success", "Baliza borrada correctamente");
    res.redirect("/balizas/list");
});

//GESTION CRUD observaciones
router.post("/observaciones/add", helpers.isAuthenticated, async(req, res) => {
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
    helpers.insertarLog(req.user.usuario, "INSERT observaciones", observa.nif + " " + observa.observaciones);
    res.redirect("/balizas/plantilla/" + nif);
});
router.get("/observaciones/delete/:idObs", helpers.isAuthenticated, helpers.isAdmin, async(req, res) => {
    //console.log(req.params.idObs);
    const { idObs } = req.params;
    const resp = await db.query("select nif from observaciones where id_observacion=?", [idObs]);
    const nif = resp[0].nif;
    await db.query("delete from observaciones where id_observacion=?", [idObs]);
    helpers.insertarLog(req.user.usuario, "DELETE observaciones del aton ", nif);
    req.flash("success", "Observacion de baliza " + nif + " borrada correctamente.");
    res.redirect("/balizas/plantilla/" + nif);
});
router.get("/observaciones/edit/:idObs", helpers.isAuthenticated, async(req, res) => {
    const { idObs } = req.params;
    //console.log("Que id es: " + idObs);
    const observacion = await db.query("SELECT * FROM observaciones WHERE id_observacion=?", [idObs, ]);
    //console.log(baliza);
    //console.log(baliza[0]);
    res.render("balizas/editObservaciones", { observacion: observacion[0] });
});
router.post("/observaciones/edit/:idObs", helpers.isAuthenticated, async(req, res) => {

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
    helpers.insertarLog(req.user.usuario, "UPDATE observaciones", newObservacion.nif + " " + newObservacion.observaciones);
    req.flash("success", "Observacion modificada correctamente en la baliza " + nif);
    res.redirect("/balizas/plantilla/" + nif);
});

//GESTION CRUD mantenimiento
router.post("/mantenimiento/add", helpers.isAuthenticated, async(req, res) => {
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
    helpers.insertarLog(req.user.usuario, "INSERT mantenimiento", mant.nif + " " + mant.fecha + " " + mant.mantenimiento);
    req.flash("success", "Mantenimiento en baliza insertado correctamente");
    res.redirect("/balizas/plantilla/" + nif);
});
router.get("/mantenimiento/delete/:idMan", helpers.isAuthenticated, helpers.isAdmin, async(req, res) => {
    //console.log(req.params.idMan);
    const { idMan } = req.params;
    const resp = await db.query("select nif from mantenimiento where id_mantenimiento=?", [idMan]);
    const nif = resp[0].nif;
    helpers.insertarLog(req.user.usuario, "DELETE mantenimientos del aton", nif);
    await db.query("delete from mantenimiento where id_mantenimiento=?", [idMan]);
    req.flash("success", "mantenimiento de baliza " + nif + " borrado correctamente ");
    res.redirect("/balizas/plantilla/" + nif);
});
router.get("/mantenimiento/edit/:idMan", helpers.isAuthenticated, async(req, res) => {
    const { idMan } = req.params;
    //console.log("Que id es: "+idMan);
    const mantenimient = await db.query("SELECT * FROM mantenimiento WHERE id_mantenimiento=?", [idMan, ]);
    //console.log(mantenimient[0]);
    res.render("balizas/editMantenimiento", { mant: mantenimient[0] });

});
router.post("/mantenimiento/edit/:idMan", helpers.isAuthenticated, async(req, res) => {
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
    helpers.insertarLog(req.user.usuario, "UPDATE mantenimiento", newObservacion.nif + " " + newObservacion.fecha + " " + newObservacion.mantenimiento);
    req.flash("success", "Mantenimiento modificado correctamente en la baliza " + nif);
    res.redirect("/balizas/plantilla/" + nif);
});

//GESTION mapa
router.get("/mapa/:nif", async(req, res) => {
    const { nif } = req.params;
    const baliza = await db.query(queryListadoAton + ' where b.nif=?', [nif]);
    res.render("mapas/mapa", { layout: 'layoutMapa', baliza: baliza[0], });
});
router.get("/mapaGeneral/:valor", (req, res) => {
    const { valor } = req.params;
    //console.log("Mapa " + valor);
    switch (valor) {
        case "1":
            res.render("mapas/mapaValencia", { layout: 'layoutMapa' });
            break;
        case '2':
            res.render("mapas/mapaSagunto", { layout: 'layoutMapa' });
            break;
        case "3":
            res.render("mapas/mapaGandia", { layout: 'layoutMapa' });
            break;
    }
});

module.exports = router;