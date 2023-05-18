//UN FETCH que se guarda en la variable 'balizas'
let balizas2 = [
    {
        nif: 11111,
        lat: '39º 25.22´N',
        lng: '00º 18.1´ W',
        tipo: "lkasfglkhjsdg"
    },
    {
        nif: 22222,
        lat: '39º 25.4´N',
        lng: '00º 19.5´ W',
        tipo: "346"
    },
    {
        nif: 33333,
        lat: '39º 25.6´N',
        lng: '00º 20.500´ W',
        tipo: "dfthyghk56k"
    },

]

let centerLatLng = { lat: 0, lng: 0 };
const puerto = document.getElementById("puerto").innerText;
switch (puerto) {
    case 'valencia':
        centerLatLng = { lat: 39.438, lng: -0.3172 };
        presetZoom=14;
        break;
    case 'sagunto':
        centerLatLng = { lat: 39.644, lng: -0.2142 };
        presetZoom=15;
        break;
    case 'gandia':
        centerLatLng = { lat: 38.995, lng: -0.15202 };
        presetZoom=16;
        break;
    default:
        centerLatLng = { lat: 27.438, lng: -0.3172 };
}

console.log(centerLatLng);

//var balizaprueba;
async function fetchData() {
    var apiURL = "http://localhost:4000/api/balizas";
    await fetch(apiURL).then(res => res.json())
        .then(response => {
            var data = response;
            //balizasprueba = JSON.stringify(response);
            //console.log(balizasprueba);
            //var atons = data.map(item => (balizas.push({ 'nif': item.nif, 'lat': item.latitud, 'lng': item.longitud, 'tipo': item.tipo })));
            //var atons ="["+ data.map(item => ( "{'nif':'"+item.nif + " " + "','lng':'"+item.longitud + " " +"','lat':'"+ item.latitud +"','tipo':'"+ item.tipo+"'}")).join(',')+ "]"; 
            //var atons = data.map(item => (balizas.push({ 'nif': item.nif, coordenadas: setMarkerLatLng(item.latitud, item.longitud), 'tipo': item.tipo })));
            initMap(data);
        });

}
//FIN FETCH



//FUNCION PARA TRADUCIR COORDENADAS A GOOGLE FORMAT
function setMarkerLatLng(lat, lng) {
    //console.log(lat + " " + lng)
    lat2 = 0;
    lng2 = 0;
    if (lat != null && lat.includes("º")) {
        lat = lat.replaceAll("'", "´");//quito espacios
        lat = lat.replaceAll("´", "´");
        lat = lat.replaceAll("'", "´"); // y reemplazo la coma ' por ´
        lat = lat.replaceAll("°", "º");

        var utmarraylat = lat.split("º");   //separo grados y minutos
        //console.log(utmarraylat[0] + " - " + utmarraylat[1]);
        //(utmarraylat[0] son grados y  utmarraylat[1] minutos
        utmarraylat[1] = utmarraylat[1].replace(",", ".");  //DE LOS MINUTOS sustituyo comas por PUNTOS
        var minutoslatVector = utmarraylat[1].split(".");  //de los minutos separo en las PUNTOS
        //console.log(minutoslatVector[0] + " - " + minutoslatVector[1]);
        var minutoslatEntero = parseFloat(minutoslatVector[0]);      //convierto a decimal (la separacion ha de ser un PUNTO)
        if (minutoslatVector[1].includes("´")) {
            var minutoslat = minutoslatVector[1].split("´")
        } else {
            var minutoslat = minutoslatVector[1].split(" ")
        }
        //console.log(minutoslat[0] + " - " + minutoslat[1]);
        var minutoslatDecimal = parseFloat(minutoslat[0]);
        lat2 = parseFloat(utmarraylat[0]) + (minutoslatEntero + minutoslatDecimal / 1000) / 60;
        //console.log(minutoslatVector);
        if (minutoslat[1].trim() == 'N')
            lat2 = 1 * lat2.toFixed(5);
        else if (minutoslat[1].trim() == 'S')
            lat2 = -1 * lat2.toFixed(5);
        //console.log(lat2);
    }

    if (lng != null && lng.includes("º")) {
        lng = lng.replaceAll("'", "´");
        lng = lng.replaceAll("'", "´");
        lng = lng.replaceAll("°", "º");
        var utmarraylng = lng.split("º");   //separo grados y minutos
        //console.log(utmarraylng[0] + " - " + utmarraylng[1]);
        //(utmarraylng[0] son grados y  utmarraylng[1] minutos
        utmarraylng[1] = utmarraylng[1].replace(",", ".");  //DE LOS MINUTOS sustituyo comas por PUNTOS
        var minutoslngVector = utmarraylng[1].split(".");  //de los minutos separo en las PUNTOS
        //console.log(minutoslngVector[0] + " - " + minutoslngVector[1]);
        var minutoslngEntero = parseFloat(minutoslngVector[0]);      //convierto a decimal (la separacion ha de ser un PUNTO)

        if (minutoslngVector[1].includes("´")) {
            var minutoslng = minutoslngVector[1].split("´")
        } else {
            var minutoslng = minutoslngVector[1].split(" ")
        }


        //console.log(minutoslng[0] + " - " + minutoslng[1]);
        var minutoslngDecimal = parseFloat(minutoslng[0]);
        lng2 = parseFloat(utmarraylng[0]) + (minutoslngEntero + minutoslngDecimal / 1000) / 60;
        if (minutoslng[1].trim() == 'E')
            lng2 = 1 * lng2.toFixed(5);
        else if (minutoslng[1].trim() == 'W')
            lng2 = -1 * lng2.toFixed(5);
        //console.log(lng2);
    }
    return { 'lat': lat2, 'lng': lng2 };
}


// Initialize and add the map
async function initMap(balizas) {
    const map = new google.maps.Map(document.getElementById("myMap"), {
        zoom: presetZoom,
        center: centerLatLng,
    });

    const markers = await Promise.all(balizas.map(async item => {
        const marker = new google.maps.Marker({
            position: setMarkerLatLng(item.latitud, item.longitud),
            label: item.nif.toString(),
            title: item.tipo,
            map: map,
        });
        // markers can only be keyboard focusable when they have click listeners
        // open info window when marker is clicked
        marker.addListener("click", () => {
            infoWindow.setContent(label);
            infoWindow.open(map, marker);
        });
        return await marker;
    }));
}

fetchData();
