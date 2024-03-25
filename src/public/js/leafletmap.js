// initialize Leaflet
console.log("leaflet initialization");
let centerLatLng = centrar();
//console.log(centerLatLng);

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
    marker.bindPopup('<div id="content">' +
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
  popup
    .setLatLng(e.latlng)
    .setContent("You clicked the map at " + e.latlng.toString())
    .openOn(map);
}