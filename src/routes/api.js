const express = require('express');
const { Passport } = require('passport');
const router = express.Router();
const pool = require("../database");
const queryBaliza = "SELECT b.nif,lo.puerto,lo.num_local,b.telecontrol,b.periodo,b.tipo,b.apariencia,b.caracteristica,lo.localizacion,lo.latitud,lo.longitud,la.altura,la.elevacion,la.linterna,la.alcanceNom,la.alcanceLum,la.candelasCalc,la.candelasInst FROM balizamiento b  LEFT JOIN localizacion lo ON lo.nif=b.nif  LEFT JOIN lampara la ON la.nif=b.nif where b.nif=?";

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
    const baliza = await pool.query(queryBaliza,[nif]);
    //const observaciones = await pool.query('SELECT * FROM observaciones where nif=?',[nif]);
    //const mantenimiento = await pool.query('SELECT * FROM mantenimiento where nif=? order by fecha DESC',[nif]);
    res.send(baliza);
});

router.get('/api/mantenimiento/:nif',async (req,res)=>{
    const { nif } = req.params;
    console.log(nif); 
    //const q = await pool.query('SELECT * FROM observaciones where nif=?',[nif]);
    const q = await pool.query('SELECT * FROM mantenimiento where nif=? order by fecha DESC',[nif]);
    res.send(q);
});

router.get('/api/observaciones/:nif',async (req,res)=>{
    const { nif } = req.params;
    console.log(nif); 
    const q = await pool.query('SELECT * FROM observaciones where nif=?',[nif]);
    //const q = await pool.query('SELECT * FROM mantenimiento where nif=? order by fecha DESC',[nif]);
    res.send(q);
});

router.get('/api/usuarios',async (req,res)=>{
    const balizas = await pool.query('SELECT full_name,usuario,email, privilegio FROM usuarios');
    //const observaciones = await pool.query('SELECT * FROM observaciones where nif=?',[nif]);
    //const mantenimiento = await pool.query('SELECT * FROM mantenimiento where nif=? order by fecha DESC',[nif]);
    res.send(balizas);
});


module.exports = router;