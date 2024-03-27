const express = require('express');
const router = express.Router();
const path = require('path');
const db = require("../database"); //db hace referencia a la BBDD
const funciones = require("../lib/funciones.js");
const { unlink } = require('fs-extra');
const { access, constants } = require('fs');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const queryListadoAton = "SELECT b.nif,b.num_internacional,b.tipo,b.apariencia,b.periodo,b.caracteristica,b.telecontrol,b.necesita_pintado,lo.puerto,lo.num_local,lo.localizacion,lo.latitud,lo.longitud,la.altura,la.elevacion,la.alcanceNom,la.linterna,la.candelasCalc,la.alcanceLum,la.candelasInst FROM balizamiento b  LEFT JOIN localizacion lo ON lo.nif=b.nif  LEFT JOIN lampara la ON la.nif=b.nif";
const queryListadoTicketsUsers = "SELECT t.ticket_id,t.nif,t.created_by_id,t.assigned_to_id,t.resolved_by_id,t.titulo,t.descripcion,t.solved_at,t.created_at,u1.usuario as created_by,u2.usuario as assigned_to,u3.usuario as resolved_by FROM tickets t LEFT JOIN usuarios u1 ON t.created_by_id=u1.id  LEFT JOIN usuarios u2 ON t.assigned_to_id=u2.id LEFT JOIN usuarios u3 ON t.resolved_by_id=u3.id";
//var selectedLayout ='layoutMapa';  //  layoutMapa   o    layoutMapaLeaflet
var selectedLayout = 'layoutMapaLeaflet';

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
router.get('/profile/email/recordarpass/', async (req, res) => {
    res.render('auth/recoverypass');
});
router.post('/profile/email/recordarpass/', async (req, res) => { //:email
    const email = req.body.email;
    const usuario = req.body.usuario;
    // console.log(email + " " + usuario);
    var rows = await db.query("SELECT * FROM usuarios WHERE usuario=? AND email= ?", [usuario, email]);
    if (rows.length > 0) {
        var user = rows[0];
        const user_id = user.id;


        var token = funciones.getCode();
        const hash = await funciones.encryptPass(token);
        //console.log(hash);
        var hasAnyToken = await db.query("SELECT * FROM tokens WHERE user_id=?", [user_id]);
        if (hasAnyToken.length > 0) {
            rows = await db.query("UPDATE tokens set hashedtoken=? , expires =NOW()+ interval 5 minute where user_id=?", [hash, user_id,]);
        } else {
            rows = await db.query("INSERT INTO tokens (user_id,hashedtoken, expires) VALUES (?,?, NOW()+ interval 5 minute)", [user_id, hash]);
        }

        //var exito = await funciones.sendRecoveryMail(email,token); NOFUNCIONA 
        //console.log(email + " " + token);
        //console.log(process.env.EMAIL_ACCOUNT + " " + process.env.EMAIL_PASS);
        const transporter = nodemailer.createTransport({
            service: 'ovh',
            host: "smtp.mail.ovh.net",
            secure: true,
            port: 465,

            auth: {
                user: process.env.EMAIL_ACCOUNT,
                pass: process.env.EMAIL_PASS,
            }
        });

        var mailOptions = {
            from: "BBDD SAN",
            to: email,
            subject: 'Restablecer contraseña BBDD SAN',
            text: 'Has olvidado tu contraseña. Haz click en el siguiente vinculo http://localhost:5001/profile/email/verifypass/' + user_id + '/' + token + " para reestablecer una nueva contraseña.",
        };
        //console.log(mailOptions);

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.error("Error:");
                console.log(error);
                req.flash("danger", "Error al enviar el eMail para restablecer contraseña")
                res.redirect("/error");

            } else {
                console.log('Email sent: ' + info.response);
                req.flash("success", "Se ha enviado un token a la dirección de correo asociada para restablecer contraseña.");
                res.redirect("/");
            }
        });
    } else {
        req.flash("danger", "El usuario y/o el correo no corresponden con ningún usuario.")
        res.redirect("/error");
    }

});

router.get('/profile/email/verifypass/:user_id/:code', async (req, res) => {
    const { user_id, code } = req.params;
    await db.query("DELETE FROM tokens WHERE expires < NOW()");
    var [token] = await db.query("SELECT * FROM tokens WHERE user_id=? ", [user_id]);
    console.log(token);
    //  localhost:5001/profile/email/verifypass/1/1ZEFGJ      hashedtoken
    //console.log(code + " == " + token.hashedtoken);
    const validToken = await funciones.verifyPassword(code, token.hashedtoken)
    console.log(validToken);
    if (validToken) {
        req.flash("success", "Token proporcionado correcto");
        res.redirect("/profile/recoverysetpass/" + user_id);
    }
    else {
        req.flash("danger", "Token proporcionado incorrecto");
        res.redirect("/error");
    }
});
router.get('/profile/recoverysetpass/:id', async (req, res) => {
    const { id } = req.params;
    res.render("auth/recoverysetnewpass", { id });
});

router.post('/profile/recoverysetpass', async (req, res) => {
    const { password, id } = req.body;
    //console.log(password + " "+ id);
    var encryptedPass = await funciones.encryptPass(password);
    const result = await db.query("UPDATE usuarios set contrasena=? where id=?", [encryptedPass, id]);
    req.flash("success", "Contraseña actualizada correctamente");
    res.redirect("/");
});


//GESTION BACKUPS BBDD
router.get("/backups", funciones.isAuthenticated, funciones.isAdmin, async (req, res) => {
    var backups = funciones.listadoBackups();
    res.render("documentos/listadoBackups", { backups });
});
router.get("/backups/del/:nombre", funciones.isAuthenticated, funciones.isAdmin, async (req, res) => {
    var { nombre } = req.params;
    var file = path.resolve('src/public/dumpSQL', nombre);
    //console.log(file);
    await fs.unlinkSync(file);
    funciones.insertarLog(req.user.usuario, "DELETE backup", nombre);
    res.redirect('/backups');
});
router.get("/dumpSQL", funciones.isAuthenticated, funciones.isAdmin, async (req, res) => {
    funciones.dumpearSQL();
    req.flash("success", "Backup de la BBDD realizado correctamente");
    funciones.insertarLog(req.user.usuario, "DO backup", "nuevo backup");
    res.redirect("backups");
});

//GESTION LOGS
router.get("/logs", funciones.isAuthenticated, funciones.isAdmin, async (req, res) => {
    var logs = await db.query("select * from logs order by fecha desc");
    res.render("documentos/listadoLogs", { logs });
});

//GESTION INVENTARIO
router.get('/inventario', funciones.isAuthenticated, async (req, res) => {
    const inventario = await db.query("select * from inventario order by fila,columna");
    res.render('inventario/inventario', { inventario });
});
router.get('/inventario/add', funciones.isAuthenticated, funciones.hasSanPrivileges, async (req, res) => {
    res.render('inventario/addItem');
});
router.post('/inventario/add', funciones.isAuthenticated, funciones.hasSanPrivileges, async (req, res) => {
    var {
        tipo,
        item,
        descripcion,
        cantidad,
        fila,
        columna
    } = req.body;

    const nuevoItem = {
        tipo,
        item,
        descripcion,
        cantidad,
        fila,
        columna
    };

    console.log(nuevoItem);
    await db.query("insert into inventario set ? ", [nuevoItem]);
    funciones.insertarLog(req.user.usuario, "INSERT inventario", "Item " + nuevoItem.item + " añadido " + nuevoItem.cantidad + " cantidades");
    req.flash("success", "Item añadido al inventario correctamente");
    res.redirect("/inventario");
});
router.get('/inventario/edit/:id', funciones.isAuthenticated, funciones.hasSanPrivileges, async (req, res) => {
    const { id } = req.params;
    //console.log(id);
    const item = await db.query("select * from inventario where id=?", id);
    //console.log(item[0]);
    res.render('inventario/edit', { item: item[0] });
});
router.post('/inventario/edit/:id', funciones.isAuthenticated, funciones.hasSanPrivileges, async (req, res) => {
    var {
        id,
        tipo,
        item,
        descripcion,
        cantidad,
        fila,
        columna
    } = req.body;

    const nuevoItem = {
        id,
        tipo,
        item,
        descripcion,
        cantidad,
        fila,
        columna
    };
    await db.query("update inventario set ? where id=?", [nuevoItem, id]);
    funciones.insertarLog(req.user.usuario, "UPDATE inventario", "Info actualizada " + nuevoItem.item + " " + nuevoItem.cantidad);
    req.flash("success", "Inventario actualizado correctamente");
    res.redirect("/inventario");
});
router.get("/inventario/delete/:id", funciones.isAuthenticated, funciones.isAdmin, async (req, res) => {
    //console.log(req.params.idObs);
    const { id } = req.params;
    await db.query("delete from inventario where id=?", [id]);
    req.flash("success", "Item eliminado correctamente.");
    res.redirect("/inventario");
});

//MOSTRAR ERROR
router.get('/error', (req, res) => {
    res.render('estaticas/error');
});
router.get('/noperm', (req, res) => {
    res.render('estaticas/noPermission');
});

//GESTION MAPA
router.get("/mapa/:nif", async (req, res) => {
    const { nif } = req.params;
    const baliza = await db.query(queryListadoAton + ' where b.nif=?', [nif]);
    res.render("mapas/mapa", { layout: selectedLayout, baliza: baliza[0] });
});
//funcion get para mostrar los mapas dinamicos con la api de google maps
router.get("/mapaGeneral/:valor", (req, res) => {
    //const { valor } = req.params;
    res.render("mapas/mapa", { layout: selectedLayout });
});
//funcion get para mostrar los mapas estaticos
router.get("/mapaGeneral2/:valor", (req, res) => {
    const { valor } = req.params;
    //console.log("Mapa " + valor);
    switch (valor) {
        case "valencia":
            res.render("mapas/mapaValencia", { layout: 'layoutMapaEstatico' });
            break;
        case 'sagunto':
            res.render("mapas/mapaSagunto", { layout: 'layoutMapaEstatico' });
            break;
        case "gandia":
            res.render("mapas/mapaGandia", { layout: 'layoutMapaEstatico' });
            break;
    }
});
//funcion get para alternar entre los dos layouts google y leaflet
router.get('/changelayout', funciones.isAuthenticated, funciones.isAdmin, (req, res) => {
    if (selectedLayout == 'layoutMapaLeaflet') {
        selectedLayout = 'layoutMapa';
    } else {
        selectedLayout = 'layoutMapaLeaflet';
    }
    //TODO: refresh wherever page you are in when run this from navbar.
    res.redirect("/mapaGeneral/valencia");
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

module.exports = router;