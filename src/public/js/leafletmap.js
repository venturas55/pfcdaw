// initialize Leaflet
//console.log("leaflet initialization");
let centerLatLng = centrar();
//console.log(centerLatLng);
let posicionInicial = { lat: 1, lng: 1 };
let map;

fetchData()?.then((balizas) => {
  map = L.map('myMap').setView(centerLatLng, presetZoom);
  // add the OpenStreetMap tiles
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 17,
  }).addTo(map);
  /*   var TopoLayer = L.tileLayer('../topo/{z}/{x}/{y}.jpg', { maxZoom: 17 ,minZoom: 0 });
    map.addLayer(TopoLayer); */

  // show the scale bar on the lower left corner
  L.control.scale({ imperial: true, metric: true }).addTo(map);


  var marker = new L.marker([39.435, -0.29], { opacity: 0.01 }); //opacity may be set to zero 
  marker.bindTooltip("Darsena Norte", {permanent: true, className: "my-label", offset: [0, 0] });
  marker.addTo(map);


  // show a marker on the map
  markers = [];
  balizas.forEach(item => {
    let customIcon = {
      iconUrl: myurl + '/img/icon/' + getTipo(item) + '.png',
      iconSize: [20, 40],
    }
    if(item.apagada)
      customIcon.className="apagada";
    let myIcon = L.icon(customIcon);
    let iconOptions = {
      title: item.tipo,
      draggable: true,
      icon: myIcon
    }
    let marker = new L.Marker(setMarkerLatLng(item.latitud, item.longitud), iconOptions);

    marker.on('dragstart', function (event) {
      console.log(posicionInicial);
      posicionInicial = event.target.getLatLng();
      //console.log(marker);
      //marker.setLatLng(new L.LatLng(position.lat, position.lng), { draggable: 'true' });
    });

    marker.on('dragend', function (event) {
      thismarker = event.target;
      var position = thismarker.getLatLng();
      console.log(position);
      thismarker.setLatLng(new L.LatLng(position.lat, position.lng), { draggable: 'true' });
      map.panTo(new L.LatLng(position.lat, position.lng));
      //console.log(item.pos0);
      //console.log(position);
      var textposition = getMarkerLatLng(position);
      popup
        .setLatLng(position)
        .setContent('   <div class="card-body"> <h4>Desplazar señal aqui? </h4>' +
          ' <form action="/aton/editLocalizacionFromMap/' + item.nif + '" method="POST">' +
          '<input value="' + item.nif + '" class="form-control" type="hidden" name="nif" />' +
          '<div class="form-group mb-2"><label for="latitud">LATITUD</label>' +
          '<input value="' + textposition.lat + '" class="form-control" type="text" name="latitud" /> </div>' +
          '<div class="form-group mb-2">' +
          '<label for="longitud">LONGITUD</label>' +
          '<input value="' + textposition.lng + '" class="form-control" type="text" name="longitud" /> </div>' +
          '<input value="' + position.lat + '" class="form-control" type="hidden" name="lat" /> ' +
          '<input value="' + position.lng + '" class="form-control" type="hidden" name="lng" /> ' +
          '<div class="form-group mb-2 text-center">' +
          '    <button class="btn btn-success btn-block">SI</button>' +
          ' </div>' +
          ' </form>' +
          '    <div class="form-group mb-2 text-center">' +
          // `       <button onclick="document.getElementsByClassName('leaflet-popup-close-button')[0].click();map.setView({lat:39.446534,lng:-0.306931});" class="btn btn-danger btn-block">NO</button>` +
          `       <button onclick="document.getElementsByClassName('leaflet-popup-close-button')[0].click();thismarker.setLatLng(posicionInicial);map.setView(posicionInicial);" class="btn btn-danger btn-block">NO</button>` +
          '   </div>' +
          '</div>')
        .openOn(map);

      markers.push(thismarker);
    });

    marker.bindTooltip('<div>' +
      "<div>NIF:" +
      '<p>' + item.nif.toString() + "</p> Apariencia: " + item.apariencia + "</div>" +
      '<img class="avatar avatar-s" src="/img/imagenes/' + item.nif.toString() + '/' + item.pictureUrl[0] + '"/>' +
      "</div>", {
      opapcity: 0.8,
      direction: 'top',
      sticky: true,
    })
      .bindPopup('<div>' +
        "<div>NIF:" +
        '<a href="/aton/plantilla/' + item.nif.toString() + '">' + item.nif.toString() + "</a> Apariencia: " + item.apariencia + "</div>" +
        //'<div> Coordenadas: ' + item.longitud + " "+ item.latitud+ '</div>' +
        "</div>").openPopup();

    marker.addTo(map);

  });
  map.on('click', onMapDistance);
});

var popup = L.popup();

function drawPin() {
  console.log("Drawing pin");
  console.log(map);

  let iconOptions = {
    title: "Nuevo punto de estudio",
    draggable: true,
  }

  let marker = new L.Marker({ "lat": document.getElementById("latmarker").value, "lng": document.getElementById("lngmarker").value }, iconOptions);
  /*   marker.on('dragstart', function (event) {
      console.log(posicionInicial);
      posicionInicial = event.target.getLatLng();
    }); */

  marker.on('dragend', function (event) {
    thismarker = event.target;
    var position = thismarker.getLatLng();
    thismarker.setLatLng(new L.LatLng(position.lat, position.lng), { draggable: 'true' });
    map.panTo(new L.LatLng(position.lat, position.lng));
    console.log(position);
    document.getElementById("latmarker").value = position.lat;
    document.getElementById("lngmarker").value = position.lng;
  });
  marker.addTo(map);
  map.panTo(new L.LatLng(document.getElementById("latmarker").value, document.getElementById("lngmarker").value));
}

function onMapClick(e) {
  //console.log("You clicked the map at ", e);
  var coordenadas = e.latlng.toString().split("(")[1];
  var latitud = coordenadas.split(",")[0];
  var longitud = coordenadas.split(",")[1].split(")")[0];
  popup
    .setLatLng(e.latlng)
    .setContent("Coordenadas " + latitud + "  " + longitud)
    .openOn(map);
}

let firstLatLng, secondLatLng, secondClick = false;
function onMapDistance(e) {
  if (secondClick) {
    secondLatLng = e.latlng;
    L.marker(secondLatLng).addTo(map).bindPopup('Point B<br/>' + e.latlng).openPopup();
     // Dibujamos una línea entre los dos puntos
     L.polyline([firstLatLng, secondLatLng], {
      color: 'red'
    }).addTo(map);
    medirDistancia();
    secondClick=false;
  } else {
    firstLatLng = e.latlng;
    L.marker(firstLatLng).addTo(map).bindPopup('Point A<br/>' + e.latlng).openPopup();
    secondClick=true;
  }
}
function medirDistancia() {
  var distance = map.distance(firstLatLng, secondLatLng);
  document.getElementById('distance').innerHTML = distance.toFixed(2);
  firstLatLng = undefined;
  console.log(L.polyline);
}

function actualizarCoordenadaWGS2DEC(){
  var latWGS=document.getElementById("latmarkerWGS").value;
  var lngWGS=document.getElementById("lngmarkerWGS").value;
  var lat=document.getElementById("latmarker");
  var lng=document.getElementById("lngmarker");
  var punto=setMarkerLatLng(latWGS, lngWGS);
  //console.log(punto.lat);

  lat.value = punto.lat;
  lng.value = punto.lng;

}

function actualizarCoordenadaDEC2WGS() {
  var latWGS = document.getElementById("latmarkerWGS");
  var lngWGS = document.getElementById("lngmarkerWGS");
  var lat = document.getElementById("latmarker").value;
  var lng = document.getElementById("lngmarker").value;
  var punto = getMarkerLatLng({ lat, lng });
  //console.log(punto.lat);

  latWGS.value = punto.lat;
  lngWGS.value = punto.lng;

}