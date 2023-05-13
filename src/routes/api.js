const express = require('express');
const { Passport } = require('passport');
const router = express.Router();
const pool = require("../database");
const queryListadoAton = "SELECT b.nif,b.tipo,b.caracteristica,lo.localizacion,lo.latitud,lo.longitud FROM balizamiento b  LEFT JOIN localizacion lo ON lo.nif=b.nif  LEFT JOIN lampara la ON la.nif=b.nif";

router.get('/api/balizas',async (req,res)=>{
    const balizas = await pool.query(queryListadoAton);
    //const observaciones = await pool.query('SELECT * FROM observaciones where nif=?',[nif]);
    //const mantenimiento = await pool.query('SELECT * FROM mantenimiento where nif=? order by fecha DESC',[nif]);
    res.send(balizas);
});

router.get('/api/baliza/:nif',async (req,res)=>{
    const { nif } = req.params;
    console.log(nif); 
    //console.log(json.nif);
    //console.log(json.peso);
    const baliza = await pool.query('SELECT * FROM balizamiento where nif=?',[nif]);
    //const observaciones = await pool.query('SELECT * FROM observaciones where nif=?',[nif]);
    //const mantenimiento = await pool.query('SELECT * FROM mantenimiento where nif=? order by fecha DESC',[nif]);
    res.send(baliza);
});


router.get('/api/usuarios',async (req,res)=>{
    const balizas = await pool.query('SELECT full_name,usuario,email, privilegio FROM usuarios');
    //const observaciones = await pool.query('SELECT * FROM observaciones where nif=?',[nif]);
    //const mantenimiento = await pool.query('SELECT * FROM mantenimiento where nif=? order by fecha DESC',[nif]);
    res.send(balizas);
});


module.exports = router;