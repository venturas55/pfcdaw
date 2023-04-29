const express = require ('express');
const router = express.Router();
const db = require("../database"); //db hace referencia a la BBDD
const funciones = require("../lib/funciones.js");

//MOSTRAR PAGINA INICIAL
router.get('/', (req, res) => {
    res.render('index');
});

//MOSTRAR CALCULOS
router.get('/calculos', (req, res) => {
    res.render('calculos', { layout: 'layoutCalculos' });
});

//MOSTRAR PLAN
router.get('/plan', (req, res) => {
    res.render('plan', { layout: 'layoutSimple' });
});

//MOSTRAR PERFIL  -RUD  
router.get('/profile',  (req, res) => {
    //console.log(req.user.usuario);
    res.render('auth/profile');
});
router.get('/profile/edit',  (req, res) => {
    res.render('auth/profileEdit');
});
router.post('/profile/edit/', funciones.isAuthenticated, async(req, res) => {
    const rows = await db.query("SELECT * FROM usuarios WHERE id= ?", [req.body.id]);
    var user = rows[0];

    console.log(req.body.oldcontrasena + " / " + user.contrasena);
    const validPassword = await funciones.verifyPassword(req.body.oldcontrasena, user.contrasena);
    if (validPassword) {
        user.usuario = req.body.usuario;
        user.email = req.body.email;
        user.full_name = req.body.full_name;
        user.contrasena = await funciones.encryptPass(req.body.newcontrasena);
        console.log("guardando en la BBDD");
        //console.log(user);
        const result = await db.query("UPDATE usuarios SET ? where id= ?", [user, req.body.id]);
        req.flash("success", "Usuario editado correctamente.");
        res.redirect('/profile');
    } else {
        req.flash("warning", "No dispones de permisos!");
        res.redirect('/noperm');
    }
});
router.get("/profile/delete/:id", funciones.isAuthenticated, async(req, res) => {
    console.log(req.params);
    const { id } = req.params;
    //borramos foto
    const filePath = path.resolve('src/public/img/profiles/' + user.pictureURL);
    access(filePath, constants.F_OK, async(err) => {
        if (err) {
            console.log("No tiene foto de perfil");
        } else {
            console.log('File exists. Deleting now ...');
            await unlink(filePath);
        }
    });
    //hacemos logout
    req.logOut();
    const user = await db.query("SELECT * FROM usuarios where id=?", [id]);
    //TODO: las pxtas sesiones parece que hay que borrarlas todas si no empieza a dar errores...
    await db.query("DELETE FROM sessions");
    await db.query("DELETE FROM usuarios WHERE id=?", [id]);

    req.flash("success", "Usuario borrado correctamente");

    res.redirect('/');
});


//MOSTRAR ERROR
router.get('/error', (req, res) => {
    console.log("Redirect");
    req.flash("warning", "Sucedió algun error!");
    res.render('error');
});
router.get('/noperm', (req, res) => {
    console.log("Redirect");
    req.flash("warning", "No dispones de los permisos adecuados!");
    res.render('noPermission');
});

//MOSTRAR PRUEBA
router.get("/prueba", (req, res) => {
    req.flash("success", "Prueba ejecutada correctamente en index");
    res.render("prueba");
});
router.post("/pruebaPost", async(req, res) => {
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

