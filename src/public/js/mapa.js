let map;
let marker;

var baliza = ['39º 27.297´ N', '00º 17.161´ W'];
const centerLatLng = { lat: 39.438, lng: -0.3172 };
const myLatLng1 = { lat: 39.428, lng: -0.3152 };
const myLatLng2 = { lat: 39.448, lng: -0.3182 };
const myLatLng3 = { lat: 39.458, lng: -0.3182 };

function setMarker(lat, lng) {

  var utmarray = lat.split(" ");    //separo grados y minutos
  var uno = parseFloat(utmarray[0].split("º")[0]);    //de los grados quito el simbolo del grado
  utmarray[1].replace(",", ".");  //sustituyo comas por PUNTOS
  var dosv = utmarray[1].split(".");  //separo en las PUNTOS
  var dos = parseFloat(dosv[0]);      //convierto a decimal (la separacion ha de ser un PUNTO)
  var tres = parseFloat(dosv[1].split("´")[0]);
  var lat2 = uno + (dos + tres / 1000) / 60;
  if (utmarray[2] == 'N')
    lat2 = 1*lat2.toFixed(5); // Si no multiplicas por 1, devuelve string
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
    lng2 = 1 *lng2.toFixed(5);
  else if (utmarray[2] == 'W')
    lng2 = -1 *lng2.toFixed(5);
  console.log(lng2);
  //alert("lat:" + lat2 + " y long:" + lng2);
  // marker.setPosition(new google.maps.LatLng(lat2, lng2));
  return { 'lat': lat2, 'lng': lng2 };
}
//const myLatLng4 = setMarker('39º 27.297´ N', '00º 17.161´ W');
//console.log(myLatLng1);
//console.log(myLatLng4);
//alert(setMarker(baliza[0],baliza[1]).lat);
//alert(setMarker(baliza[0],baliza[1]).lng);

function initMap() {
  const map = new google.maps.Map(document.getElementById("myMap"), {
    zoom: 14,
    center: centerLatLng,
  });

  new google.maps.Marker({
    position: myLatLng1,
    map,
    title: "Hola!",
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
    position: setMarker('39º 27.297´ N', '00º 17.161´ W'),
    map,
    title: "faro!",
  });

}




window.initMap = initMap;