const express = require('express');
const morgan = require('morgan');
//Inicializacion
const app = express();

//Configuracion
app.set('port', process.env.PORT || 4000);


//Middleware
app.use(morgan('dev')); //Para que muestre mensajes relacionados con el desarrollo por consola

//Variables globales (que podrán ser usadas en cualquier vista)

//Rutas


//Public

//Arrancar servidor
app.listen(app.get('port'), () => {
    console.log('Servidor en puerto', app.get('port'));
});