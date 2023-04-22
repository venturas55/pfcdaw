const express = require ('express');
const router = express.Router();
const db = require("../database"); //db hace referencia a la BBDD

//MOSTRAR PAGINA INICIAL
router.get('/', (req, res) => {
    res.render('index');
});

//MOSTRAR PERFIL  -RUD  
router.get('/profile',  (req, res) => {
    //console.log(req.user.usuario);
    res.render('auth/profile');
});
router.get('/profile/edit',  (req, res) => {
    res.render('auth/profileEdit');
});


module.exports = router;

