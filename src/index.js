const express = require('express');
const morgan = require('morgan');
const exphbs = require('express-handlebars'); //Para usar plantillas
const path = require('path'); //Para manejar directorios, basicamente unirlos 
const flash = require('connect-flash'); //Para mostar mensajes
const session = require('express-session'); //Lo necesita el flash tb
const MySQLstore = require('express-mysql-session'); // para poder guardar la sesion en la sql
const passport = require('passport');
const { database } = require('./config');
var cors = require('cors')
//console.log(process.env.DB_HOST);

//Inicializacion
const app = express();
require('./lib/passport'); //para que se entere de la autentificacion que se ha creado 

//Configuracion
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs.engine({ //con esto se configura el app.engine
    defaultLayout: 'main',
    layoutDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    helpers: require('./lib/handlebars') //no hay nada aun
}));
app.set('view engine', '.hbs'); //Para utilizar el app.engine

//Middleware
app.use(cors({
    origin: (origin, callback) => {
        const ACCEPTED_ORIGINS = [
            "http://localhost:" + app.get('port'),
            "http://san.adriandeharo.es:" + app.get('port'),
            "https://localhost:" + app.get('port'),
            "https://san.adriandeharo.es:" + app.get('port'),
        ]
        if (ACCEPTED_ORIGINS.includes(origin)) {
            return callback(null, true);
        }
        if (!origin) {
            return callback(null, true);
        }
        return callback(new Error("CORS no aceptado en la app"));
    }
}

));

app.use(session({
    secret: 'mysesion',
    resave: false,
    saveUninitialized: false,
    store: new MySQLstore(database)
}));
app.use(flash()); // Para poder usar el middleware de enviar mensajes popups
app.use(morgan('dev')); //Para que muestre mensajes relacionados con el desarrollo por consola
app.use(express.urlencoded({ extended: false })); //aceptar los datos desde los formularios sin aceptar imagenes ni nada raro
app.use(express.json()); //Para enviar y recibir jsons.
app.use(passport.initialize()); //iniciar passport
app.use(passport.session()); //para que sepa donde guardar y como manejar los datos
//CORS
//TODO: aun no funciona el CORS, cada vez que se actualiza el proyecto hay que poner el fetch del dominio a mano adriandeharo.es en funciones.js
/* app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT');
    next();
}); */

//Variables globales (que podrán ser usadas en cualquier vista)
app.use((req, res, next) => {
    app.locals.signupMessage = req.flash('signupMessage');
    app.locals.success = req.flash('success');
    app.locals.warning = req.flash('warning');
    app.locals.error = req.flash('error');
    app.locals.message = req.flash('message');
    app.locals.user = req.user;
    app.locals.puerto = app.get('port');
    next();
});


//Rutas
app.use(require('./routes')); //busca automaticamente index.js
app.use(require('./routes/authentication'));
app.use(require('./routes/fotos'));
app.use('/aton', require('./routes/aton'));
app.use(require('./routes/documentos'));
app.use(require('./routes/api'));
app.use(require('./routes/inventario'));
app.use(require('./routes/backups'));
app.use(require('./routes/mapas'));
app.use(require('./routes/profile'));
app.use('/tickets', require('./routes/tickets'));
app.use('/mantenimientopreventivo', require('./routes/preventivos'));



//Public
app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.static(path.join(__dirname,'..', 'database')));

//Bootstrap
app.use('/css', express.static(path.join(__dirname, '../node_modules/bootstrap/dist/css')))
app.use('/js', express.static(path.join(__dirname, '../node_modules/bootstrap/dist/js')))
app.use('/js', express.static(path.join(__dirname, '../node_modules/@popperjs/core/dist/umd')))
app.use('/js', express.static(path.join(__dirname, '../node_modules/jquery/dist')))

//VUE
/* const history = require('connect-history-api-fallback');
app.use(history());
app.use('/js', express.static(path.join(__dirname, '../node_modules/vue'))) */

//Fontawesome
app.use('/css', express.static(path.join(__dirname, '../node_modules/font-awesome/css')))
app.use('/fonts', express.static(path.join(__dirname, '../node_modules/font-awesome/fonts')))

//Leaflet
app.use('/leaflet', express.static(path.join(__dirname, '../node_modules', 'leaflet', 'dist')))

//Arrancar servidor
app.listen(app.get('port'), () => {
    console.log("Running on http://localhost:" + app.get('port'));
});