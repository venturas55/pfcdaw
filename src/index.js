const express = require('express');
const morgan = require('morgan');
const exphbs = require('express-handlebars'); //Para usar plantillas
const path = require('path'); //Para manejar directorios, basicamente unirlos 


//Inicializacion
const app = express();

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
app.use(morgan('dev')); //Para que muestre mensajes relacionados con el desarrollo por consola
app.use(express.urlencoded({ extended: false })); //aceptar los datos desde los formularios sin aceptar imagenes ni nada raro
app.use(express.json()); //Para enviar y recibir jsons.


//Variables globales (que podrán ser usadas en cualquier vista)
app.use((req, res, next) => {

    app.locals.user = req.user;
    next(); // Para que continue ejecutando
});


//Rutas
app.use(require('./routes')); //busca automaticamente index.js
app.use(require('./routes/autenthication')); //busca automaticamente js
app.use('aton',require('./routes/aton')); //busca automaticamente js


//Public
app.use(express.static(path.join(__dirname, 'public')));

//Arrancar servidor
app.listen(app.get('port'), () => {
    console.log('Servidor en puerto', app.get('port'));
});