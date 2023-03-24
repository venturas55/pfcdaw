const express = require('express');
const router = express.Router();

//MOSTRAR PAGINA INICIAL
router.get('/login', (req, res) => {
    res.send('longin page');
});

router.get('/signin', (req, res) => {
    res.send('singin page');
});
module.exports = router;