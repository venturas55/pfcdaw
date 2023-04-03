const express = require('express');
const router = express.Router();
const db = require("../database"); //db hace referencia a la BBDD
const queryListadoAton = "SELECT b.nif,b.num_internacional,b.tipo,b.apariencia,b.periodo,b.caracteristica,lo.puerto,lo.num_local,lo.localizacion,lo.latitud,lo.longitud,la.altura,la.elevacion,la.alcanceNom,la.linterna,la.candelasCalc,la.alcanceLum,la.candelasInst FROM balizamiento b  LEFT JOIN localizacion lo ON lo.nif=b.nif  LEFT JOIN lampara la ON la.nif=b.nif";


//MOSTRAR PAGINA PRUEBA
router.get('/prueba', (req, res) => {
    res.render('prueba');
});

//CRUD ATON create
router.get("/add", (req, res) => {
    res.render("aton/add");
});
router.post("/add", async (req, res) => {
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

    //console.log(newBalizamiento);
    await db.query("INSERT INTO balizamiento set ?", [newBalizamiento]);
    await db.query("INSERT INTO localizacion set ?", [newBalizamientoLocalizacion]);
    await db.query("INSERT INTO lampara set ?", [newBalizamientoLampara]);
    res.redirect("/aton/list"); //te redirige una vez insertado el item
});

//CRUD ATON read
router.get("/list", async (req, res) => {
    const balizas = await db.query(
        queryListadoAton
    );
    res.render("aton/list", { balizas });

});
router.get("/list/:busqueda", async(req, res) => {
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
    res.render("aton/list", { layout: 'layoutList', balizas });
    // NO FUNCIONA CON LA BARRA DELANTE res.render('/links/list');
});
router.get("/list/:filtro/:valor", async(req, res) => {
    var obj = req.params;
    var balizas;
    //Añadimos porcentajes para busqueda SQL que contenga 'busqueda' y lo que sea por delante y por detras
    obj.valor = "%" + obj.valor + "%";

    if (obj.filtro == "tipo" || obj.filtro == "apariencia")
        obj.filtro = "b." + obj.filtro;
    else
        obj.filtro = "lo." + obj.filtro;

    var sqlQuery = queryListadoAton + " where b.nif=lo.nif AND " + obj.filtro + " like ? order by lo.nif";
    balizas = await db.query(sqlQuery, obj.valor);
    //console.log(balizas);
    //like is case insensitive por defecto. En caso de quererlo sensitivo hay que añadir solo "like binary"
    res.render("aton/list", { layout: 'layoutList', balizas });
    // NO FUNCIONA CON LA BARRA DELANTE res.render('/links/list');
});
router.get("/plantilla/:nif", async(req, res) => {
    const { nif } = req.params;
    //const baliza = await db.query('SELECT * FROM balizamiento b  LEFT JOIN localizacion lo ON lo.nif=b.nif  LEFT JOIN lampara la ON la.nif=b.nif where b.nif=?', [nif]);  CON ESTA CONSULTA EL LEFT JOIN NO FUNCIONA BIEN PARA EL HIPOTETICO CASO EN EL QUE EXISTE UN ATON QUE NO ESTA EN ALGUNA DE LAS TRES TABLAS
    const baliza = await db.query(queryListadoAton + ' where b.nif=?', [nif]);
    //console.log(baliza[0]);
    const observaciones = await db.query('SELECT * FROM observaciones where nif=?', [nif]);
    const mantenimiento = await db.query('SELECT * FROM mantenimiento where nif=? order by fecha DESC', [nif]);
    
    res.render("aton/plantilla", { baliza: baliza[0], obs: observaciones, mant: mantenimiento });
    // NO FUNCIONA CON LA BARRA DELANTE res.render('/links/list');
});


module.exports = router;