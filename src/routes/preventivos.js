const express = require('express');
const router = express.Router();
const db = require("../database.js"); //db hace referencia a la BBDD
const funciones = require("../lib/funciones.js");
const queryListadoPreventivosUsers = 'SELECT p.preventivo_id,p.nif,p.estructura_estado,p.estructura_marca_tope,p.estructura_engrase,p.estructura_golpes,p.estructura_limpieza_interior,p.estructura_limpieza_exterior,p.estructura_cuadro_interior,p.estructura_cuadro_exterior,p.estructura_observaciones,p.linterna_ldr1,p.linterna_ldr2,p.linterna_optica,p.linterna_estanqueidad_tornillos,p.linterna_estanqueidad_humedades,p.linterna_observaciones,p.telecontrol_monitoreo,p.telecontrol_gps,p.telecontrol_tipo,p.telecontrol_observaciones,p.alimentacion_panelFV,p.alimentacion_red,p.alimentacion_baterias,p.alimentacion_ah,p.alimentacion_vcc,p.alimentacion_grupo,p.alimentacion_cableado,p.alimentacion_observaciones,p.observaciones_generales,p.created_at,p.created_by_id,u1.usuario as created_by FROM preventivos p LEFT JOIN usuarios u1 ON p.created_by_id=u1.id';
var moment = require('moment'); // require
moment().format();

//preventivo
// Ruta vista principal
router.get('/list', async (req, res) => {
    //const tickets = await db.query("select * from tickets order by created_at");
    try {
        const tickets = await db.query(queryListadoPreventivosUsers + " order by p.created_at asc");
        console.log(tickets);
        res.render('preventivo/list', {
            tickets
        });
    } catch (error) {
        console.error(error);
        req.flash("error", "Hubo algun error al intentar mostrar los tickets: " + error);
        res.redirect("/");
    }
});

// Ruta para crear un nuevo preventivo (formulario)
router.get('/add', funciones.isAuthenticated, async (req, res) => {
    try {
        //const usuarios = await db.query("select * from usuarios");
        res.render('preventivo/add');
    } catch (error) {
        console.error(error);
        req.flash("error", "Hubo algun error al intentar añadir el mantenimiento preventivo:" + error);
        res.redirect("/mantenimientopreventivo/list");
    }
});

// Ruta para crear un nuevo ticket (envío del formulario)
router.post('/add', funciones.isAuthenticated, async (req, res) => {
    try {
        console.log(req.body);
        //TODO: created_by_id   Y   telecontrol_tipo
        //console.log(req.user);
        const awns = await db.query("insert into preventivos set ? ", [req.body]);
        console.log(awns);
        console.log(awns.insertId);
        funciones.insertarLog(req.user.usuario, "INSERT preventivo", req.body.observaciones_generales);
        req.flash("success", "Preventivo añadido correctamente");
        //let ticket = await db.query("select * from tickets where ticket_id=?", req.params.id);
        res.redirect('/mantenimientopreventivo/list/');

    } catch (error) {
        //console.error(error);
        req.flash("error", "Hubo algun error al insertar el preventivo: " + error);
        res.redirect("/mantenimientopreventivo/list");
    }
});

// Ruta para editar un preventivo
router.get('/edit/:id', funciones.isAuthenticated, funciones.hasSanPrivileges, async (req, res) => {
    const {
        id
    } = req.params;
    //console.log(id);
    try {
        const ticket = await db.query(queryListadoPreventivosUsers + " where preventivo_id=?", id);
        const ticketsUsers = await db.query(queryListadoPreventivosUsers + " where p.preventivo_id=?", id);
        const usuarios = await db.query(" select * from usuarios");
        //console.log(ticketsUsers[0]);
        //console.log(ticket[0]);
        res.render('preventivo/edit', {
            ticket: ticket[0],
            users: ticketsUsers[0],
            usuarios: usuarios
        });
    } catch (error) {
        console.error(error);
        req.flash("error", "Hubo algun error al intentar mostrar el ticket" + error);
        res.redirect("/mantenimientopreventivo/list");
    }
});
// Ruta POST para editar un preventivo
router.post('/edit/:id', funciones.isAuthenticated, funciones.hasSanPrivileges, async (req, res) => {

    var {
        ticket_id,
        titulo,
        descripcion,
        nif,
        assigned_to_id,
        resolved_by_id,
    } = req.body;

    const editedItem = {
        ticket_id,
        titulo,
        descripcion,
        nif,
        assigned_to_id,
        resolved_by_id,
    };
    //console.log(editedItem);
    //reemplazo vacios por null
    for (let key in editedItem) {
        if (editedItem.hasOwnProperty(key) && editedItem[key] === '') {
            editedItem[key] = null;
        }
    }
    //console.log(editedItem);

    try {
        await db.query("update tickets set ? where ticket_id=?", [editedItem, ticket_id]);
        funciones.insertarLog(req.user.usuario, "UPDATE ticket", "Info actualizada " + editedItem.titulo + " " + editedItem.descripcion);
        req.flash("success", "Ticket actualizado correctamente");
        res.redirect("/tickets/edit/" + ticket_id);

    } catch (error) {
        console.error(error);
        req.flash("error", "Hubo algun error al intentar modificar el ticket" + error);
        res.redirect("/tickets/list");
    }

});
//Ruta para borrar un preventivo.
router.get("/delete/:id", funciones.isAuthenticated, funciones.isAdmin, async (req, res) => {
    //console.log(req.params.idObs);
    const {
        id
    } = req.params;
    try {
        await db.query("delete from tickets where ticket_id=?", [id]);
        req.flash("success", "Ticket eliminado correctamente.");
        res.redirect("/tickets/list");
    } catch (error) {
        console.error(error);
        req.flash("error", "Hubo algun error al intentar borrar el ticket" + error);
        res.redirect("/tickets/list");
    }
});

module.exports = router;