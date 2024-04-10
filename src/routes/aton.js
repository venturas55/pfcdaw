const express = require('express');
const router = express.Router();
const path = require('path');
const db = require("../database"); //db hace referencia a la BBDD
const funciones = require("../lib/funciones.js");
const fs = require('fs').promises;
const queryListadoAton = "SELECT lo.coordenadas,b.nif,b.num_internacional,b.tipo,b.apariencia,b.periodo,b.caracteristica,b.telecontrol,b.necesita_pintado,lo.puerto,lo.num_local,lo.localizacion,lo.latitud,lo.longitud,la.altura,la.elevacion,la.alcanceNom,la.linterna,la.candelasCalc,la.alcanceLum,la.candelasInst FROM balizamiento b  LEFT JOIN localizacion lo ON lo.nif=b.nif  LEFT JOIN lampara la ON la.nif=b.nif";
const queryListadoTicketsUsers = "SELECT t.ticket_id,t.nif,t.created_by_id,t.assigned_to_id,t.resolved_by_id,t.titulo,t.descripcion,t.solved_at,t.created_at,u1.usuario as created_by,u2.usuario as assigned_to,u3.usuario as resolved_by FROM tickets t LEFT JOIN usuarios u1 ON t.created_by_id=u1.id  LEFT JOIN usuarios u2 ON t.assigned_to_id=u2.id LEFT JOIN usuarios u3 ON t.resolved_by_id=u3.id ";
var moment = require('moment'); // require
moment().format();

getPointfromLatLng =  (lat, lng) => {
    var lat2 = 0;
    var lng2 = 0;
    if (lat != null && lat.includes("º")) {
        lat = lat.replaceAll("'", "´"); // y reemplazo la coma ' por ´
        lat = lat.replaceAll("°", "º");

        var utmarraylat = lat.split("º"); //separo grados y minutos
        //console.log(utmarraylat[0] + " - " + utmarraylat[1]);
        //(utmarraylat[0] son grados y  utmarraylat[1] minutos
        utmarraylat[1] = utmarraylat[1].replace(",", "."); //DE LOS MINUTOS sustituyo comas por PUNTOS
        var minutoslatVector = utmarraylat[1].split("."); //de los minutos separo en las PUNTOS
        //console.log(minutoslatVector[0] + " - " + minutoslatVector[1]);

        if (minutoslatVector.length > 1) {
            var minutoslatEntero = parseFloat(minutoslatVector[0]); //convierto a decimal (la separacion ha de ser un PUNTO)

            if (minutoslatVector[1].includes("´")) {
                var minutoslat = minutoslatVector[1].split("´")
            } else {
                var minutoslat = minutoslatVector[1].split(" ")
            }
            //console.log(minutoslat[0] + " - " + minutoslat[1]);
            var minutoslatDecimal = parseFloat(minutoslat[0]);
            lat2 = parseFloat(utmarraylat[0]) + (minutoslatEntero + minutoslatDecimal / 1000) / 60;
        } else {
            var minutoslat = minutoslatVector[0].trim().split(" ");
            lat2 = parseFloat(utmarraylat[0]) + parseFloat(minutoslat[0]) / 60;
        }
        //console.log(minutoslatVector);
        if (minutoslat[1].trim() == 'N')
            lat2 = 1 * lat2.toFixed(6);
        else if (minutoslat[1].trim() == 'S')
            lat2 = -1 * lat2.toFixed(6);
        //console.log(lat2);
    }

    if (lng != null && lng.includes("º")) {
        lng = lng.replaceAll("'", "´");
        lng = lng.replaceAll("°", "º");
        var utmarraylng = lng.split("º"); //separo grados y minutos
        //console.log(utmarraylng[0] + " - " + utmarraylng[1]);
        //(utmarraylng[0] son grados y  utmarraylng[1] minutos
        utmarraylng[1] = utmarraylng[1].replace(",", "."); //DE LOS MINUTOS sustituyo comas por PUNTOS
        var minutoslngVector = utmarraylng[1].split("."); //de los minutos separo en las PUNTOS
        //console.log(minutoslngVector[0] + " - " + minutoslngVector[1]);

        if (minutoslngVector.length > 1) {

            var minutoslngEntero = parseFloat(minutoslngVector[0]); //convierto a decimal (la separacion ha de ser un PUNTO)

            if (minutoslngVector[1].includes("´")) {
                var minutoslng = minutoslngVector[1].split("´")
            } else {
                var minutoslng = minutoslngVector[1].split(" ")
            }
            //console.log(minutoslng[0] + " - " + minutoslng[1]);
            var minutoslngDecimal = parseFloat(minutoslng[0]);
            lng2 = parseFloat(utmarraylng[0]) + (minutoslngEntero + minutoslngDecimal / 1000) / 60;
        } else {
            var minutoslng = minutoslngVector[0].trim().split(" ");
            lng2 = parseFloat(utmarraylng[0]) + parseFloat(minutoslng[0]) / 60;
        }


        if (minutoslng[1].trim() == 'E')
            lng2 = 1 * lng2.toFixed(6);
        else if (minutoslng[1].trim() == 'W')
            lng2 = -1 * lng2.toFixed(6);
        //console.log(lng2);
    }
    return {
        'lat': lat2,
        'lng': lng2
    };
}

//console.log(db);
//CRUD ATON create
router.get("/add", funciones.isAuthenticated, funciones.hasSanPrivileges, (req, res) => {
    res.render("aton/add");
});
router.post("/add", funciones.isAuthenticated, funciones.hasSanPrivileges, async (req, res) => {
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

    try {
        let existe = await db.query("SELECT * from balizamiento where nif= ?", [newBalizamiento.nif]);

        if (existe.length == 0) {
            await db.query("INSERT INTO balizamiento set ?", [newBalizamiento]);
            await db.query("INSERT INTO localizacion set ?", [newBalizamientoLocalizacion]);
            await db.query("INSERT INTO lampara set ?", [newBalizamientoLampara]);
            const msg = funciones.insertarLog(req.user.usuario, "INSERT balizamiento", newBalizamiento.nif);
            if (msg == 'error')
                throw (msg)
            req.flash("success", "AtoN insertado correctamente");
            res.redirect("/aton/list");
        } else {
            req.flash("error", "Ya existe un AtoN con el NIF " + newBalizamiento.nif);
            res.redirect("/aton/add");
        }
        //console.log(newBalizamiento);
    } catch (error) {
        console.error(error.code);
        switch (error.code) {
            case "ER_DATA_TOO_LONG":
                req.flash("error", "El NIF " + newBalizamiento.nif + " es demasiado largo.");
                break;
            case "ER_BAD_NULL_ERROR":
                req.flash("error", "El campo NIF es obligatorio");
                break;
            case "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD":
                req.flash("error", "Hay un campo con valor incorrecto");
                break;

            default:
                req.flash("error", "Hubo algun error al intentar añadir el nuevo AtoN con NIF  " + newBalizamiento.nif);
        }
        res.redirect("/aton/add");
    }
});

//CRUD ATON read
router.get("/list", async (req, res) => {
    const balizas = await db.query(queryListadoAton);

    const tickets = await db.query("select * from tickets where solved_at IS NULL");
    //console.log(tickets);
    balizas.forEach((element) => {
        const hasItem = tickets.some(obj => obj.nif === element.nif);
        if (hasItem)
            element.hasTicket = true;
    });
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

    //Añado la info de los tickets
    const tickets = await db.query("select * from tickets where solved_at IS NULL");
    //console.log(tickets);
    balizas.forEach((element) => {
        const hasItem = tickets.some(obj => obj.nif === element.nif);
        if (hasItem)
            element.hasTicket = true;
    });

    res.render("aton/list", { balizas });
    // NO FUNCIONA CON LA BARRA DELANTE res.render('/links/list');
});
router.get("/plantilla/:nif", async (req, res) => {
    const { nif } = req.params;
    //const baliza = await db.query('SELECT * FROM balizamiento b  LEFT JOIN localizacion lo ON lo.nif=b.nif  LEFT JOIN lampara la ON la.nif=b.nif where b.nif=?', [nif]);  CON ESTA CONSULTA EL LEFT JOIN NO FUNCIONA BIEN PARA EL HIPOTETICO CASO EN EL QUE EXISTE UN ATON QUE NO ESTA EN ALGUNA DE LAS TRES TABLAS
    const baliza = await db.query(queryListadoAton + ' where b.nif=?', [nif]);
    if (baliza[0]) {
        //console.log(baliza[0]);
        const observaciones = await db.query('SELECT * FROM observaciones where nif=?', [nif]);
        const mantenimiento = await db.query('SELECT * FROM mantenimiento where nif=? order by fecha DESC', [nif]);
        const tickets = await db.query(queryListadoTicketsUsers + 'where t.nif=? and solved_at is null', [nif]);
        //console.log(tickets);
        var fotos = funciones.listadoFotos(nif);
        res.render("aton/plantilla", { layout: 'layoutPlantilla', baliza: baliza[0], obs: observaciones, mant: mantenimiento, fotos, tickets });
    } else {
        req.flash("warning", "La baliza indicada con nif " + nif + " no existe!!");
        res.redirect("/error");
    }
});

//CRUD ATON update
router.get("/editCaracteristicas/:nif", funciones.isAuthenticated, funciones.hasSanPrivileges, async (req, res) => {
    const { nif } = req.params;
    var baliza = await db.query("SELECT * FROM balizamiento WHERE nif=?", [nif]);

    if (baliza[0] == null || baliza[0] == undefined) {
        baliza = { nif };
    } else {
        baliza = baliza[0];
    }
    res.render("aton/editCaracteristicas", { baliza });
});
router.get("/editLocalizacion/:nif", funciones.isAuthenticated, funciones.hasSanPrivileges, async (req, res) => {
    const { nif } = req.params;
    var baliza = await db.query("SELECT * FROM localizacion WHERE nif=?", [nif]);
    if (baliza[0] == null || baliza[0] == undefined) {
        baliza = { nif };
    } else {
        baliza = baliza[0];
    }
    console.log(baliza);
    res.render("aton/editLocalizacion", { baliza });
});
router.get("/editLampara/:nif", funciones.isAuthenticated, funciones.hasSanPrivileges, async (req, res) => {
    const { nif } = req.params;
    var baliza = await db.query("SELECT * FROM lampara WHERE nif=?", [nif]);
    if (baliza[0] == null || baliza[0] == undefined) {
        baliza = { nif };
    } else {
        baliza = baliza[0];
    }
    res.render("aton/editLampara", { baliza });
});
router.post("/editCaracteristicas/:nif", funciones.isAuthenticated, funciones.hasSanPrivileges, async (req, res) => {
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

    try {
        await db.query("UPDATE balizamiento set ? WHERE nif = ?", [
            newBaliza,
            nifviejo,
        ]);
        funciones.insertarLog(req.user.usuario, "UPDATE balizamiento", newBaliza.nif + " " + newBaliza.num_internacional + " " + newBaliza.tipo + " " + newBaliza.telecontrol + newBaliza.apariencia + " " + newBaliza.periodo + " " + newBaliza.caracteristica);
        req.flash("success", "Baliza modificada correctamente");
        res.redirect("/aton/plantilla/" + nifviejo);

    } catch (error) {
        console.error(error);
        req.flash("error", "Hubo algun error al modificar el aton " + newBaliza.nif);
        res.redirect("/aton/plantilla/" + nifviejo);
    }


});
router.post("/editLocalizacion/:nif", funciones.isAuthenticated, funciones.hasSanPrivileges, async (req, res) => {
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
    try {

        var baliza = await db.query("SELECT * FROM localizacion WHERE nif=?", [nifviejo]);
        if (baliza[0] == null || baliza[0] == undefined) {
            await db.query("INSERT into localizacion set ? ", [newBaliza]);
        } else {
            await db.query("UPDATE localizacion set ? WHERE nif = ?", [newBaliza, nifviejo]);
            await db.query("UPDATE localizacion set coordenadas= point(?,?) WHERE nif = ?", [latitud,longitud, nifviejo]); 
        }
        funciones.insertarLog(req.user.usuario, "UPDATE localizacion", newBaliza.nif + " " + newBaliza.puerto + " " + newBaliza.num_local + " " + newBaliza.localizacion + " " + newBaliza.latitud + " " + newBaliza.longitud);
        req.flash("success", "Localizacion de baliza modificada correctamente");
        res.redirect("/aton/plantilla/" + nifviejo);

    } catch (error) {
        console.error(error);
        req.flash("error", "Hubo algun error al modificar la localización del aton con NIF " + nifviejo);
        res.redirect("/aton/plantilla/" + nifviejo);
    }

});
router.post("/editLocalizacionFromMap/:nif", funciones.isAuthenticated, funciones.isAdmin, async (req, res) => {
    const nifviejo = req.params.nif;
    var {
        latitud,
        longitud,
    } = req.body;
    try {
        var [baliza] = await db.query("SELECT * FROM localizacion WHERE nif=?", [nifviejo]);
        
        //TODO: convert data to  39º 26.901´N format
        
        baliza.latitud = latitud;
        baliza.longitud = longitud;
        await db.query("UPDATE localizacion set ? WHERE nif = ?", [baliza, nifviejo]);
        funciones.insertarLog(req.user.usuario, "UPDATE localizacion", baliza.nif + " "+ baliza.latitud + " " + baliza.longitud);
        req.flash("success", "Localizacion de baliza modificada correctamente");
        res.redirect("/mapa/" + nifviejo);

    } catch (error) {
        console.error(error);
        req.flash("error", "Hubo algun error al modificar la localización del aton con NIF " + nifviejo);
        res.redirect("/mapaGeneral/valencia");
    }

});
/* router.get("/transform/:nif", funciones.isAuthenticated, funciones.isAdmin, async (req, res) => {
    const nif = req.params.nif;

    try {
        var [baliza] = await db.query("SELECT * FROM localizacion WHERE nif=?", [nif]);
        var punto = getPointfromLatLng(baliza.latitud ,baliza.longitud);

        baliza.coordenadas ='POINT('+ punto.lat + ","+punto.lng  + ')';
        console.log( baliza.coordenadas);

        await db.query("UPDATE localizacion set coordenadas= point(?,?) WHERE nif = ?", [punto.lat,punto.lng, nif]);
        req.flash("success", "Localizacion de baliza transformada correctamente");
        res.redirect("/aton/plantilla/" + nif);

    } catch (error) {
        console.error(error);
        req.flash("error", "Hubo algun error al modificar la localización del aton con NIF " + nif);
        res.redirect("/aton/plantilla/" + nif);
    }

}); */
router.get("/transform", funciones.isAuthenticated, funciones.isAdmin, async (req, res) => {
    const nif = req.params.nif;
    try {
        var baliza = await db.query("SELECT * FROM localizacion", [nif]);
        for(var i = 0; i < baliza.length; i++) {
            var punto = getPointfromLatLng(baliza[i].latitud ,baliza[i].longitud);
            await db.query("UPDATE localizacion set coordenadas= point(?,?) WHERE nif = ?", [punto.lat,punto.lng, baliza[i].nif]);
        }
        req.flash("success", "Localizacion de balizas transformadas correctamente");
        res.redirect("/");
    } catch (error) {
        console.error(error);
        req.flash("error", "Hubo algun error al modificar la localización del aton con NIF " + nif);
        res.redirect("/error");
    }
});
router.post("/editLampara/:nif", funciones.isAuthenticated, funciones.hasSanPrivileges, async (req, res) => {
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
    try {
        var baliza = await db.query("SELECT * FROM lampara WHERE nif=?", [nifviejo]);
        if (baliza[0] == null || baliza[0] == undefined) {
            await db.query("INSERT into lampara set ? ", [newBaliza]);
        } else {
            await db.query("UPDATE lampara set ? WHERE nif = ?", [newBaliza, nifviejo]);
        }
        funciones.insertarLog(req.user.usuario, "UPDATE lampara", newBaliza.nif + " " + newBaliza.altura + " " + newBaliza.elevacion + " " + newBaliza.alcanceNom + " " + newBaliza.linterna + " " + newBaliza.candelasCalc + " " + newBaliza.alcanceLum + " " + newBaliza.candelasInst);
        req.flash("success", "Lampara del aton modificada correctamente");
        res.redirect("/aton/plantilla/" + nifviejo);

    } catch (error) {
        console.error(error);
        req.flash("error", "Hubo algun error al modificar la lampara del aton con NIF: " + nifviejo);
        res.redirect("/aton/plantilla/" + nifviejo);
    }


});

//CRUD ATON delete
router.get("/delete/:nif", funciones.isAuthenticated, funciones.isAdmin, async (req, res) => {
    console.log("Borrando aton " + req.params.nif + "...");
    const { nif } = req.params;
    try {
        await db.query("DELETE FROM mantenimiento WHERE nif=?", [nif]);
        await db.query("DELETE FROM observaciones WHERE nif=?", [nif]);
        await db.query("DELETE FROM localizacion WHERE nif=?", [nif]);
        await db.query("DELETE FROM lampara WHERE nif=?", [nif]);
        await db.query("DELETE FROM balizamiento WHERE nif=?", [nif]);
        console.log(req.user);
        funciones.insertarLog(req.user.usuario, "DELETE aton ", req.params.nif);
        req.flash("success", "Baliza borrada correctamente");
        res.redirect("/aton/list");
    } catch (error) {
        req.flash("error", "Hubo algun error al borrar el AtoN con NIF: " + nif);
        res.redirect("/aton/plantilla/" + nif);
    }
});

//GESTION CRUD observaciones
router.post("/observaciones/add", funciones.isAuthenticated, funciones.hasSanPrivileges, async (req, res) => {
    const {
        nif,
        observaciones,
    } = req.body;
    const observa = {
        nif,
        observaciones,
    };
    try {
        await db.query("INSERT INTO observaciones set ?", [observa]);
        req.flash("success", "Observacion insertada correctamente");
        funciones.insertarLog(req.user.usuario, "INSERT observaciones", observa.nif + " " + observa.observaciones);
        res.redirect("/aton/plantilla/" + nif);
    } catch (error) {
        req.flash("error", "Hubo algun error al añadir la observación");
        res.redirect("/aton/plantilla/" + nif);
    }

});
router.get("/observaciones/delete/:idObs", funciones.isAuthenticated, funciones.isAdmin, async (req, res) => {
    //console.log(req.params.idObs);
    const { idObs } = req.params;
    const resp = await db.query("select nif from observaciones where id_observacion=?", [idObs]);
    const nif = resp[0].nif;
    await db.query("delete from observaciones where id_observacion=?", [idObs]);
    funciones.insertarLog(req.user.usuario, "DELETE observaciones del aton ", nif);
    req.flash("success", "Observacion de baliza " + nif + " borrada correctamente.");
    res.redirect("/aton/plantilla/" + nif);
});
router.get("/observaciones/edit/:idObs", funciones.isAuthenticated, funciones.hasSanPrivileges, async (req, res) => {
    const { idObs } = req.params;
    //console.log("Que id es: " + idObs);
    const observacion = await db.query("SELECT * FROM observaciones WHERE id_observacion=?", [idObs,]);
    //console.log(baliza);
    //console.log(baliza[0]);
    res.render("aton/editObservaciones", { observacion: observacion[0] });
});
router.post("/observaciones/edit/:idObs", funciones.isAuthenticated, funciones.hasSanPrivileges, async (req, res) => {

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

    try {
        await db.query("UPDATE observaciones set ? WHERE id_observacion = ?", [
            newObservacion,
            id_observacion,
        ]);
        funciones.insertarLog(req.user.usuario, "UPDATE observaciones", newObservacion.nif + " " + newObservacion.observaciones);
        req.flash("success", "Observacion modificada correctamente en la baliza " + nif);
        res.redirect("/aton/plantilla/" + nif);

    } catch (error) {
        console.error(error);
        req.flash("error", "Hubo algun error al editar la observación");
        res.redirect("/aton/plantilla/" + nif);
    }
});

//GESTION CRUD mantenimiento
router.post("/mantenimiento/add", funciones.isAuthenticated, funciones.hasSanPrivileges, async (req, res) => {
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
    try {
        await db.query("INSERT INTO mantenimiento set ?", [mant]);
        funciones.insertarLog(req.user.usuario, "INSERT mantenimiento", mant.nif + " " + mant.fecha + " " + mant.mantenimiento);
        req.flash("success", "Mantenimiento en baliza insertado correctamente");
        res.redirect("/aton/plantilla/" + nif);

    } catch (error) {
        console.error(error);
        req.flash("error", "Hubo algun error al añadir mantenimiento al NIF: " + nif);
        res.redirect("/aton/plantilla/" + nif);
    }
});
router.get("/mantenimiento/delete/:idMan", funciones.isAuthenticated, funciones.isAdmin, async (req, res) => {
    //console.log(req.params.idMan);
    const { idMan } = req.params;
    const resp = await db.query("select nif from mantenimiento where id_mantenimiento=?", [idMan]);
    const nif = resp[0].nif;
    await db.query("delete from mantenimiento where id_mantenimiento=?", [idMan]);
    funciones.insertarLog(req.user.usuario, "DELETE mantenimientos del aton", nif);
    req.flash("success", "mantenimiento de baliza " + nif + " borrado correctamente ");
    res.redirect("/aton/plantilla/" + nif);
});
router.get("/mantenimiento/edit/:idMan", funciones.isAuthenticated, funciones.hasSanPrivileges, async (req, res) => {
    const { idMan } = req.params;
    //console.log("Que id es: "+idMan);
    const mantenimient = await db.query("SELECT * FROM mantenimiento WHERE id_mantenimiento=?", [idMan,]);
    //console.log(mantenimient[0]);
    res.render("aton/editMantenimiento", { mant: mantenimient[0] });

});
router.post("/mantenimiento/edit/:idMan", funciones.isAuthenticated, funciones.hasSanPrivileges, async (req, res) => {
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
    try {
        await db.query("UPDATE mantenimiento set ? WHERE id_mantenimiento = ?", [newObservacion, id_mantenimiento]);
        funciones.insertarLog(req.user.usuario, "UPDATE mantenimiento", newObservacion.nif + " " + newObservacion.fecha + " " + newObservacion.mantenimiento);
        req.flash("success", "Mantenimiento modificado correctamente en la baliza " + nif);
        res.redirect("/aton/plantilla/" + nif);
    } catch (error) {
        console.error(error);
        req.flash("error", "Hubo algun error al modificar el mantenimiento al NIF: " + nif);
        res.redirect("/aton/plantilla/" + nif);
    }
});

router.get("/pintura/:nif", funciones.isAuthenticated, funciones.hasSanPrivileges, async (req, res) => {
    try {
        const { nif } = req.params;
        const baliza = (await db.query('Select * from balizamiento where nif=?', [nif]))[0];
        baliza.necesita_pintado = !baliza.necesita_pintado;
        await db.query("UPDATE balizamiento set ? WHERE nif = ?", [baliza, nif]);
        res.redirect("/aton/plantilla/" + nif);
    } catch (error) {
        console.error(error);
        req.flash("error", "Hubo algun error al anotar pintado");
        res.redirect("/aton/plantilla/" + nif);
    }
});
router.get("/pintado/:nif", funciones.isAuthenticated, funciones.hasSanPrivileges, async (req, res) => {
    try {
        const { nif } = req.params;
        const baliza = (await db.query('Select * from balizamiento where nif=?', [nif]))[0];
        console.log(baliza);
        baliza.necesita_pintado = false;
        await db.query("UPDATE balizamiento set ? WHERE nif = ?", [baliza, nif]);
        const mant = {
            nif,
            'fecha': moment(new Date()).format("YYYY-MM-DD"),
            'mantenimiento': 'Se repita el aton',
        };
        await db.query("INSERT INTO mantenimiento set ?", [mant]);
        funciones.insertarLog(req.user.usuario, "INSERT mantenimiento", mant.nif + " " + mant.fecha + " " + mant.mantenimiento);
        req.flash("success", "Pintado en AtoN anotado correctamente");
        res.redirect("/aton/plantilla/" + nif);

    } catch (error) {
        console.error(error);
        req.flash("error", "Hubo algun error al añadir mantenimiento al NIF: " + nif);
        res.redirect("/aton/plantilla/" + nif);
    }
});
module.exports = router;