// initialize Leaflet
//console.log("leaflet initialization");
let centerLatLng = centrar();
//console.log(centerLatLng);
let posicionInicial={lat:1,lng:1};

fetchData().then((balizas) => {
  map = L.map('myMap').setView(centerLatLng, presetZoom);
  // add the OpenStreetMap tiles
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 17,
  }).addTo(map);
  /*   var TopoLayer = L.tileLayer('../topo/{z}/{x}/{y}.jpg', { maxZoom: 17 ,minZoom: 0 });
    map.addLayer(TopoLayer); */

  // show the scale bar on the lower left corner
  L.control.scale({ imperial: true, metric: true }).addTo(map);
  // show a marker on the map
  markers = [];
  balizas.forEach(item => {
    let customIcon = {
      iconUrl: myurl + '/img/icon/' + getTipo(item) + '.png',
      iconSize: [20, 40],
    }
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
      '<img class="avatar avatar-s" src="/img/imagenes/' + item.nif.toString() + '/' + item.nif.toString() + '.jpg"/>' +
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
  map.on('click', onMapClick);
});

var popup = L.popup();
function onMapClick(e) {
  var coordenadas = e.latlng.toString().split("(")[1];
  var latitud = coordenadas.split(",")[0];
  var longitud = coordenadas.split(",")[1].split(")")[0];
  popup
    .setLatLng(e.latlng)
    .setContent("Coordenadas " + latitud + "  " + longitud)
    .openOn(map);
}