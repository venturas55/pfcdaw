/* new google.maps.Marker({
 position: myLatLng1,
 map,
 title: "Hola1!",
});

new google.maps.Marker({
 position: myLatLng2,
 map,
 title: "Hola2!",
});

new google.maps.Marker({
 position: myLatLng3,
 map,
 title: "hola3!",
});

new google.maps.Marker({
   position: setMarkerLatLng('39º 27.297´ N', '00º 17.161´ W'),
   map,
   title: "faro!",
 }); */

var map;
var marker;
var contentBalizas = document.getElementById("contentBalizas");

//UN FETCH
function recibirData() {
  var apiURL = "http://adriandeharo.es:4000/api/balizas";
  fetch(apiURL).then(res => res.json())
    .then(response => {
      var data = response;
      var atons = data.map(item => ("<p>" + item.nif + " " + item.longitud + " " + item.latitud + "</p>")).join('');
      contentBalizas.innerHTML = atons;
    })

}
recibirData();

var baliza = ['39º 27.297´ N', '00º 17.161´ W'];
const centerLatLng = { lat: 39.438, lng: -0.3172 };
const myLatLng1 = { lat: 39.428, lng: -0.3152 };
const myLatLng2 = { lat: 39.448, lng: -0.3182 };
const myLatLng3 = { lat: 39.458, lng: -0.3182 };
const myLatLng4 = { lat: 39.455, lng: -0.3181 };

function setMarkerLatLng(lat, lng) {
  var utmarray = lat.split(" ");    //separo grados y minutos
  var uno = parseFloat(utmarray[0].split("º")[0]);    //de los grados quito el simbolo del grado
  utmarray[1].replace(",", ".");  //sustituyo comas por PUNTOS
  var dosv = utmarray[1].split(".");  //separo en las PUNTOS
  var dos = parseFloat(dosv[0]);      //convierto a decimal (la separacion ha de ser un PUNTO)
  var tres = parseFloat(dosv[1].split("´")[0]);
  var lat2 = uno + (dos + tres / 1000) / 60;
  if (utmarray[2] == 'N')
    lat2 = 1 * lat2.toFixed(5); // Si no multiplicas por 1, devuelve string
  else if (utmarray[2] == 'S')
    lat2 = -1 * lat2.toFixed(5);
  console.log(lat2);
  utmarray = lng.split(" ");
  uno = parseFloat(utmarray[0].split("º")[0]);
  utmarray[1].replace(",", ".");
  dosv = utmarray[1].split(".");
  dos = parseFloat(dosv[0]);
  tres = parseFloat(dosv[1].split("´")[0]);
  var lng2 = uno + (dos + tres / 1000) / 60;

  if (utmarray[2] == 'E')
    lng2 = 1 * lng2.toFixed(5);
  else if (utmarray[2] == 'W')
    lng2 = -1 * lng2.toFixed(5);
  console.log(lng2);
  //alert("lat:" + lat2 + " y long:" + lng2);
  // marker.setPosition(new google.maps.LatLng(lat2, lng2));
  return { 'lat': lat2, 'lng': lng2 };
}

function initMap() {
  map = new google.maps.Map(document.getElementById("myMap"), {
    zoom: 14,
    center: centerLatLng,
  });
}

window.initMap = initMap;

function addMarker(location) {
  marker = new google.maps.Marker({
    position: setMarkerLatLng('39º 27.297´ N', '00º 17.161´ W'),
    map,
    title: "Añadiendo",
  });
}
addMarker(myLatLng4);