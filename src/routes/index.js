const express = require ('express');
const router = express.Router();
const db = require("../database"); //db hace referencia a la BBDD

//MOSTRAR PAGINA INICIAL
router.get('/', (req, res) => {
    res.render('index');
});

module.exports = router;

