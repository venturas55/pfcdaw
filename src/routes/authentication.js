import express from 'express';
const router = express.Router();
import { createTransport } from 'nodemailer';
import passport from 'passport';
import funciones from '../lib/funciones.js';
import db from "../database.js"; //db hace referencia a la BBDD
import { config } from '../config.js';

//GESTION SIGNIN registrarse C---
router.get('/signup', funciones.isNotAuthenticated, (req, res) => {
    res.render('auth/signup')
});
router.post('/signup', passport.authenticate('local.signup', {
    successRedirect: '/profile',
    failureRedirect: '/signup',
    //passReqToCallback: true,
    failureFlash: true
}));

//GESTION LOGIN login
router.get('/signin', funciones.isNotAuthenticated, (req, res) => {
    res.render('auth/signin');
});
router.post('/signin', (req, res, next) => {
    const p = passport.authenticate('local.signin', {
        successRedirect: '/profile',
        failureRedirect: '/signin',
        failureFlash: true
    })(req, res, next);
});

//GESTION logout
router.get('/logout', (req, res) => {
    //helpers.insertarLog(req.user.usuario, "LOGOUT usuario", req.user.id + " " + req.user.usuario);
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
})

//GESTION recuperacion contraseña
router.get('/profile/email/recordarpass/', async (req, res) => {
    res.render('auth/recoverypass');
});
router.post('/profile/email/recordarpass/', async (req, res) => { //:email

    const transporter = createTransport({
        //service: config.EMAIL_SERVICE,
        host: config.EMAIL_HOST,
        port: config.EMAIL_PORT,
        secure: config.EMAIL_SECURITY,
        auth: {
            user: config.EMAIL_ACCOUNT,
            pass: config.EMAIL_PASS,
        },
        secureConnection: false, // TLS requires secureConnection to be false
        tls: {
            ciphers: 'SSLv3'
        }
    });

    transporter.verify(function (error, success) {
        if (error) {
            console.log(">", error);
        } else {
            console.log("Server is ready to take our messages");
        }
    });



    const email = req.body.email;
    const usuario = req.body.usuario;
    var rows = await db.query("SELECT * FROM usuarios WHERE usuario=? AND email= ?", [usuario, email]);
    if (rows.length > 0) {
        var user = rows[0];
        const user_id = user.id;


        var token = funciones.getCode();
        const hash = await funciones.encryptPass(token);
        console.log(hash);
        var hasAnyToken = await db.query("SELECT * FROM tokens WHERE user_id=?", [user_id]);
        if (hasAnyToken.length > 0) {
            rows = await db.query("UPDATE tokens set hashedtoken=? , expires =NOW()+ interval 5 minute where user_id=?", [hash, user_id,]);
        } else {
            rows = await db.query("INSERT INTO tokens (user_id,hashedtoken, expires) VALUES (?,?, NOW()+ interval 5 minute)", [user_id, hash]);
        }
        //var exito = await helpers.sendRecoveryMail(email,token); NOFUNCIONA 
        console.log(email + " " + token);

        var mailOptions = {
            from: "BBDD SAN",
            to: email,
            subject: 'Restablecer contraseña BBDD SAN',
            text: 'Has olvidado tu contraseña. Haz click en el siguiente vinculo http://san.valenciaport.com/profile/email/verifypass/' + user_id + '/' + token + " para reestablecer una nueva contraseña.",
            //text: 'Has olvidado tu contraseña. Haz click en el siguiente vinculo http://localhost:5001/profile/email/verifypass/' + user_id + '/' + token + " para reestablecer una nueva contraseña.",
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.error("Error:");
                console.log(error);
                req.flash("error", "Error al enviar el eMail para restablecer contraseña")
                res.redirect("/error");

            } else {
                console.log('Email sent: ' + info.response);
                req.flash("success", "Se ha enviado un token a la dirección de correo asociada para restablecer contraseña.");
                res.redirect("/");
            }
        });
    } else {
        req.flash("error", "El usuario y/o el correo no corresponden con ningún usuario.")
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
    if (token) {

        const validToken = await funciones.verifyPassword(code, token.hashedtoken)
        console.log(validToken);
        if (validToken) {
            req.flash("success", "Token proporcionado correcto");
            res.redirect("/profile/recoverysetpass/" + user_id);
        }
        else {
            req.flash("error", "Token proporcionado incorrecto");
            res.redirect("/error");
        }
    } else {
        req.flash("error", "Token proporcionado expirado"); //TODO: NO REDIRECIONA
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

export default router;