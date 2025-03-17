// LE BE estribor LB babor BE
// CARDINAL CN CS CE CO
// ESPECIAL ME
// FARO FA
var direccion = document.getElementById("direccion").getAttribute("direccion");
var puerto = document.getElementById("puerto").getAttribute("puerto");
var cabecera = document.getElementById("cabecera").getAttribute("cabecera");
//var protocolo = document.getElementById("protocolo").getAttribute("value");
//console.log(puerto);
//let myurl = 'http://localhost:' + puerto;
//let myurl = 'http://adriandeharo.es:'+puerto;
//let myurl = 'https://san.valenciaport.com';
console.log("Direccion: ", direccion)
console.log("puerto: ", puerto)
console.log("cabecera: ", cabecera)

let myurl = "http://" + direccion;
console.log("URL: ", myurl);
//console.log("PROTOCOLO: ",protocolo);
//FUNCION PARA CERRAR MODALES
function cierraModal() {
    var el = document.getElementsByClassName("modal");
    for (var i = 0; i < el.length; i++) {
        el[i].style.display = "none";
    }
    passcheck = "";
}
function cambiarUsuario() {
    var passcheck = document.getElementById("contrasenaConfirmacion").value;
    //TODO: verificar el pass con la base de datos
}

function abreModalObs(id) {
    //console.log("observacion con id" + id);
    var item = document.getElementById("myModalBorradoObs");
    var ref = document.getElementById("refobsdel");
    ref.href += id;
    //console.log(ref.href);
    item.style.display = 'block';
}


function abreModalMant(id) {
    //console.log("Mantenimiento con id" + id);
    var item = document.getElementById("myModalBorradoMant");
    var ref = document.getElementById("refmantdel");
    ref.href += id;
    console.log(ref.href);
    item.style.display = 'block';
}

/////############
//FUNCIONES PARA EL MAPS DE GOOGLE
//FUNCION PARA CONFIGURAR LA VARIABLE CON LA QUE SE CENTRARÁ EL MAPA DE LA API DE GOOGLE, COGIENDO EL CENTRO DE LA PROPIA URL
//En el presente proyecto se denomina a:
//       coordendas WGS al formato por ejemplo 39º 52.417'N
//       coordendas UTM al formato por ejemplo 39º 52' 25" N
//       coordendas DECIMAL al formato por ejemplo 39.873617

function centrar() {
    let centerLatLng = {};
    const url = window.location.href.split('/');
    //console.log(url[url.length-1]);

    switch (url[url.length - 1]) {
        case 'valencia':
            centerLatLng = {
                lat: 39.438,
                lng: -0.3172
            };
            presetZoom = 14;
            break;
        case 'sagunto':
            centerLatLng = {
                lat: 39.642,
                lng: -0.2142
            };
            presetZoom = 14.4;
            break;
        case 'gandia':
            centerLatLng = {
                lat: 38.995,
                lng: -0.15202
            };
            presetZoom = 16.5;
            break;
        default:
            centerLatLng = setMarkerLatLng(lat.value, lng.value);
            presetZoom = 18;
    }


    // console.log(centerLatLng);
    return centerLatLng;
}
//UN FETCH que se guarda en la variable 'balizas'
async function fetchData() {
    try {
        var apiURL = myurl + "/api/balizas";
        console.log("fetch URL: ", apiURL);
        return await fetch(apiURL).then(res => res.json());
        /* .then(response => {
            var data = response;
            //balizasprueba = JSON.stringify(response);
            //console.log(balizasprueba);
            return data;
            //initMap(data);
        }); */
    } catch (err) {
        console.log(err);
    }


}
//FIN FETCH

//FUNCION PARA TRADUCIR COORDENADAS. DEVUELVE UN OBJETO GOOGLE FORMAT CON LAS COORDENADAS
function setMarkerLatLng(lat, lng) {
    //console.log(lat + " " + lng)
    var lat2 = 0;
    var lng2 = 0;
    if (lat != null && lat.includes("º")) {
        lat = lat.replaceAll("'", "´"); // y reemplazo la coma ' por ´
        lat = lat.replaceAll("°", "º");

        var utmarraylat = lat.split("º"); //separo grados y minutos
        //console.log(utmarraylat[0] + " - " + utmarraylat[1]);
        //(utmarraylat[0] son grados y  utmarraylat[1] minutos
        utmarraylat[1] = utmarraylat[1].replace(",", "."); //DE LOS MINUTOS sustituyo comas por PUNTOS
        var minutoslatVector = utmarraylat[1].split("."); //de los minutos separo en las PUNTOS
        //console.log(minutoslatVector[0] + " - " + minutoslatVector[1]);

        if (minutoslatVector.length > 1) {
            var minutoslatEntero = parseFloat(minutoslatVector[0]); //convierto a decimal (la separacion ha de ser un PUNTO)

            if (minutoslatVector[1].includes("´")) {
                var minutoslat = minutoslatVector[1].split("´")
            } else {
                var minutoslat = minutoslatVector[1].split(" ")
            }
            //console.log(minutoslat[0] + " - " + minutoslat[1]);
            var minutoslatDecimal = parseFloat(minutoslat[0]);
            lat2 = parseFloat(utmarraylat[0]) + (minutoslatEntero + minutoslatDecimal / 1000) / 60;
        } else {
            var minutoslat = minutoslatVector[0].trim().split(" ");
            lat2 = parseFloat(utmarraylat[0]) + parseFloat(minutoslat[0]) / 60;
        }
        //console.log(minutoslatVector);
        if (minutoslat[1].trim() == 'N')
            lat2 = 1 * lat2.toFixed(6);
        else if (minutoslat[1].trim() == 'S')
            lat2 = -1 * lat2.toFixed(6);
        //console.log(lat2);
    }

    if (lng != null && lng.includes("º")) {
        lng = lng.replaceAll("'", "´");
        lng = lng.replaceAll("°", "º");
        var utmarraylng = lng.split("º"); //separo grados y minutos
        //console.log(utmarraylng[0] + " - " + utmarraylng[1]);
        //(utmarraylng[0] son grados y  utmarraylng[1] minutos
        utmarraylng[1] = utmarraylng[1].replace(",", "."); //DE LOS MINUTOS sustituyo comas por PUNTOS
        var minutoslngVector = utmarraylng[1].split("."); //de los minutos separo en las PUNTOS
        //console.log(minutoslngVector[0] + " - " + minutoslngVector[1]);

        if (minutoslngVector.length > 1) {

            var minutoslngEntero = parseFloat(minutoslngVector[0]); //convierto a decimal (la separacion ha de ser un PUNTO)

            if (minutoslngVector[1].includes("´")) {
                var minutoslng = minutoslngVector[1].split("´")
            } else {
                var minutoslng = minutoslngVector[1].split(" ")
            }
            //console.log(minutoslng[0] + " - " + minutoslng[1]);
            var minutoslngDecimal = parseFloat(minutoslng[0]);
            lng2 = parseFloat(utmarraylng[0]) + (minutoslngEntero + minutoslngDecimal / 1000) / 60;
        } else {
            var minutoslng = minutoslngVector[0].trim().split(" ");
            lng2 = parseFloat(utmarraylng[0]) + parseFloat(minutoslng[0]) / 60;
        }


        if (minutoslng[1].trim() == 'E')
            lng2 = 1 * lng2.toFixed(6);
        else if (minutoslng[1].trim() == 'W')
            lng2 = -1 * lng2.toFixed(6);
        //console.log(lng2);
    }
    return {
        'lat': lat2,
        'lng': lng2
    };
}
//FUNCION PARA TRADUCIR COORDENADAS DE UN OBJETO GOOGLE FORMAT PASA A COORDENADAS WEB.
function getMarkerLatLng({ lat, lng }) {
    //console.log(lat + " " + lng)
    var lattext = "";
    var lngtext = "";
    var latabs = Math.abs(lat);
    var lngabs = Math.abs(lng);

    lattext = Math.trunc(latabs) + "º " + ((latabs - Math.trunc(latabs)) * 60).toFixed(3) + "´";
    lat > 0 ? lattext += "N" : lattext += "S";


    lngtext = Math.trunc(lngabs) + "º " + ((lngabs - Math.trunc(lngabs)) * 60).toFixed(3) + "´";
    lng > 0 ? lngtext += "E" : lngtext += "W";


    return {
        'lat': lattext,
        'lng': lngtext
    };
}

//FUNCION QUE LE PASA UN OBJETO BALIZA Y LE DEVUELVE UNA LETRA QUE REPRESENTA EL COLOR/TIPO
function getTipo(item) {
    //var balizaPrueba="25620";
    var color = item.apariencia.toUpperCase().replaceAll(" ", "");
    color = color.charAt(color.length - 1);

    var caracteristica = item.caracteristica.toLowerCase().replaceAll(" ", "").replaceAll(".", "").replaceAll(",", "").replaceAll("+", "");
    var tipo = item.tipo.toLowerCase();
    item.cambio = false;

    if (tipo.includes("faro")) {
        item.cambio = true;
        color = "F";

    } else if (tipo.includes("semaforo")) {
        color = "S";
        item.cambio = true;
    } else if (tipo.includes("peligro")) {
        color = "PA";
        item.cambio = true;
    } else if (tipo.includes("navegable")) {
        color = "AN";
        item.cambio = true;
    } else if (tipo.includes(" odas ") || tipo.includes(" sado ")) {
        color = "ODAS";
        item.cambio = true;
    } else {
        switch (color) {
            case 'R':
                item.cambio = true;
                color = "R";
                break;
            case 'G':
            case 'V':
                item.cambio = true;
                color = "V";
                break;
            case 'B':
            case 'W':
                item.cambio = true;
                color = "B";
                break;
            case 'A':
            case 'Y':
                item.cambio = true;
                color = "A";
                break;

        }
    }
    //Si tiene una de las siguientes caracteristicas siendo Blanca... es muy probable que sea una cardinal.
    if (caracteristica == "l025oc025" && color == "B") {
        color = "CN";
        item.cambio = true;
    } else if ((caracteristica == "[(l025oc025)x2]l025oc375" || caracteristica == "[(l03oc08)x2]l03oc25") && color == "B") {
        color = "CE";
        item.cambio = true;
    } else if (caracteristica == "[(l025oc025)x6]l2oc5" && color == "B") {
        color = "CS";
        item.cambio = true;
    } else if (caracteristica == "[(l025oc025)x5]l025oc375" && color == "B") {
        color = "CO";
        item.cambio = true;
    }

    if (!item.cambio) {
        //IMPRIMO ERRORES
        color = "B";
        //console.log(item);
    }
    /*  if (item.nif==balizaPrueba)
            console.log(color); */

    return color;
}

///////// #################################
//FUNCIONES PARA EL FILTRADO
//FUNCION para comprobar si algun objeto del DOM es null
function isNull(campo) {
    return !(typeof campo !== 'undefined' && campo !== null);
}
//FUNCION SOLO PARA CONTAR FILAS EN VISTA 'balizas/list.hbs'
async function contar() {
    //var numElem = document.getElementsByClassName("hidden").length;
    var numElem = document.querySelectorAll('[style="display: none;"]');
    //console.log(numElem);
    let suma = document.getElementById("suma");
    if (!isNull(suma)) {
        suma.innerHTML = inicial.length;
        document.getElementById("suma").innerHTML = (inicial.length - numElem.length);
    }
}

////##############
//FUNCIONES PARA EL PARPADEO
//Funcion que cambia la 'visibilidad' del elemento circular que simula la luz
function parpadeoToggle() {
    let x = document.getElementById("luz");
    if (x.style.display === "block") {
        x.style.display = "none";
    } else {
        x.style.display = "block";
    }
}
//Funcion que cambia el estado tras un retardo indicado 
function secuencia() {
    document.getElementById("luz").style.display = "block";
    for (let i = 0; i < destellosAcum.length - 1; i++) {
        setTimeout(parpadeoToggle, destellosAcum[i] * 1000);
    }
}
//Funcion para leer el color de la señal.
function defineColor() {
    let apariencia = document.getElementById("aparienciaID");
    let ap = apariencia.innerText.charAt(apariencia.innerText.length - 1).toUpperCase();
    //console.log(ap);
    switch (ap) {
        case 'R':
            document.getElementById("luz").style.backgroundColor = "red";
            break;
        case 'G':
        case 'V':
            document.getElementById("luz").style.backgroundColor = "green";
            break;
        case 'B':
        case 'W':
            document.getElementById("luz").style.backgroundColor = "rgb(240, 240, 240)";
            break;
        case 'A':
        case 'Y':
            document.getElementById("luz").style.backgroundColor = "yellow";
            break;
    }
}
//Funcion que cambia el estado tras un retardo indicado 
function defineCambiosEstado() {
    let destellos;
    let destellosAcum;
    let caracteristicaMod;
    let repeticiones;
    let caracteristica = document.getElementById("caracteristicaID").innerText;
    if (caracteristica === null)
        caracteristica = "L0.5 oc1.5 L0.5 oc4.5";
    caracteristica = caracteristica.toLowerCase();
    caracteristica = caracteristica.replace(/\ |\(|\[|\[|\)|\]\+/g, '').replace(/,/g, '.').replace(/oc/g, "l").replace(/o/g, "l");
    //console.log(caracteristica);

    //Tratamos las posibles repeticiones
    //Si hay X
    if (caracteristica.search("x") != -1) {
        repeticiones = caracteristica.charAt(caracteristica.search("x") + 1); //el siguiente digito al simbolo multiplicacion 'x' es el numero de repeticiones
        let trimado = 'x' + repeticiones;
        caract = caracteristica.split(trimado);
        caract[0] = caract[0].repeat(repeticiones);
        caracteristicaMod = caract[0].concat(caract[1]);
    } else
        caracteristicaMod = caracteristica;
    //console.log(caracteristicaMod)


    //Doy por hecho que siempre se alternan L y O empezando por L
    caracteristicaMod = caracteristicaMod.replace('l', '');
    //quito la primera L por no generar un item de array al usar el split
    destellos = caracteristicaMod.split('l');
    destellosAcum = new Array(destellos.length);
    destellosAcum.fill(0, 0, destellos.length);

    //Lo parseo a float
    for (let i = 0; i < destellos.length; i++) {
        destellos[i] = parseFloat(destellos[i]);
    }
    //console.log(destellos);


    //Genero un array con los tiempos acumulados, desde 0 para poder aplicar los setInterval.
    for (let i = 0; i < destellosAcum.length; i++) {
        for (let j = 0; j <= i; j++) {
            destellosAcum[i] += parseFloat(destellos[j]);
        }
    }
    console.log(destellosAcum);
    return destellosAcum;
}