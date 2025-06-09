// initialize Leaflet
let centerLatLng = centrar();
let posicionInicial = { lat: 1, lng: 1 };
let map;
let pinMarkers = [];
let secondClick = false, firstLatLng, secondLatLng;
var popup = L.popup();

fetchData()?.then((balizas) => {
  map = L.map('myMap').setView(centerLatLng, presetZoom);
  // add the OpenStreetMap tiles
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 17,
  }).addTo(map);

  // show the scale bar on the lower left corner
  L.control.scale({ imperial: true, metric: true }).addTo(map);

  // show a marker on the map
  markers = [];
  balizas.forEach(item => {
    var icono =getTipo(item);
    let customIcon = {
      //iconUrl: myurl + '/img/icon/portalaton/' + getFlash(item) + '.png',
      iconUrl: myurl + '/img/icon/' + icono + '.png',
      iconSize: [16, 30],
      iconAnchor: [8, 30], // Valor por defecto centrado abajo
    }
    
    if(icono=="TC"){
      customIcon.iconSize= [20, 20];
      customIcon.iconAnchor = [10, 50];
      console.log("Hay un tc");
    }

    if (item.apagada) {
      customIcon.className = "AtoN desactivada";
      //customIcon.iconSize=[30,60];
    } else {
      customIcon.className = " AtoN activada";
    }
    let myIcon = L.icon(customIcon);
    let iconOptions = {
      title: item.tipo,
      draggable: true,
      icon: myIcon
    }
    /*     if (item.apagada){
          iconOptions.draggable = false;
        } */
    let marker = new L.Marker(setMarkerLatLng(item.latitud, item.longitud), iconOptions);


    marker.on('dragstart', function (event) {
      posicionInicial = event.target.getLatLng();
    });

    marker.on('dragend', function (event) {
      thismarker = event.target;
      var position = thismarker.getLatLng();
      thismarker.setLatLng(position, { draggable: 'true' });
      map.panTo(position);
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
          `       <button onclick="document.getElementsByClassName('leaflet-popup-close-button')[0].click();thismarker.setLatLng(posicionInicial);map.setView(posicionInicial);" class="btn btn-danger btn-block">NO</button>` +
          '   </div>' +
          '</div>')
        .openOn(map);

      markers.push(thismarker);
    });

    marker.on('click', function (e) {
      window.location.href = `/aton/plantilla/${item.nif.toString()}`;
    });

    let ruta = "";
    if (item.pictureUrl.length > 0) {
      ruta = `/img/imagenes/${item.nif.toString()}/${item.pictureUrl[0]}`;
    }
    else {
      ruta = "/img/icon/buoyIcon.jpg";
    }

    marker.bindTooltip(`
        <div class="bind-tooltip">
          <p> <strong> NIF: ${item.nif.toString()} </strong></p> 
          <p> Apariencia: ${item.apariencia}</p>
          <p class="text-center">${marker.getLatLng()}</p>
          <img class="avatar avatar-s" src="${ruta}" />
        </div>`, {
      opacity: 0.7,
      direction: 'top',
      sticky: false,
      offset: [0, -10],
    })

    marker.on('contextmenu', function (e) {
      const html = `
        <div class="bind-tooltip">
          <div class="d-flex flex-row gap-1">
            <p> <strong> NIF: ${item.nif.toString()} </strong></p> 
            <img class="avatar avatar-s" src="${ruta}" />
          </div>  
          <div class="d-flex flex-column gap-2 mt-2">
            <button class="btn btn-primary btn-sm" onclick="window.location.href='/aton/plantilla/${item.nif.toString()}'">Ver</button>
            <button class="btn btn-success btn-sm" onclick="window.location.href='/aton/pintado/${item.nif.toString()}'">Pintar</button>
            <button class="btn btn-danger btn-sm" onclick="window.location.href='/aton/toggleapagado/${item.nif.toString()}'">Apagar/Activar</button>
            <button class="btn btn-warning btn-sm" onclick="window.location.href='/mantenimientopreventivo/add/${item.nif.toString()}'">Preventivo</button>
          </div>  
        </div>
      `;
      L.popup()
        .setLatLng(e.latlng)
        .setContent(html)
        .openOn(map);

    });


    marker.addTo(map);

  });
  map.on('click', onMapDistance);
  map.attributionControl.setPrefix('')
});

function drawPin(latlang, title) {
  let iconOptions = {
    title,
    draggable: true,
  }
  let marker = new L.Marker(latlang, iconOptions);

  marker.on('dragend', function (event) {
    thismarker = event.target;
    var position = thismarker.getLatLng();
    thismarker.setLatLng(position, { draggable: 'true' });
    map.panTo(position);
    document.getElementById("latmarker").value = position.lat;
    document.getElementById("lngmarker").value = position.lng;
    actualizarCoordenadaDEC2WGS();
  });
  pinMarkers.push(marker);
  var position = marker.getLatLng();
  map.panTo(position);
  marker.addTo(map);
}

function drawThisPin() {
  drawPin({ "lat": document.getElementById("latmarker").value, "lng": document.getElementById("lngmarker").value }, "Un Pin");
}

function clearAll() {
  for (let i = 0; i < pinMarkers.length; i++)
    map.removeLayer(pinMarkers[i]);
  pinMarkers = [];
}

function clearLast() {
  map.removeLayer(pinMarkers[pinMarkers.length - 1]);
  pinMarkers.pop();
}

function onMapClick(e) {
  var coordenadas = e.latlng.toString().split("(")[1];
  var latitud = coordenadas.split(",")[0];
  var longitud = coordenadas.split(",")[1].split(")")[0];
  popup
    .setLatLng(e.latlng)
    .setContent("Coordenadas " + latitud + "  " + longitud)
    .openOn(map);
}

function onMapDistance(e) {
  if (secondClick) {
    secondClick = false;
    secondLatLng = e.latlng;
    //L.marker(secondLatLng).addTo(map).bindPopup('Point B<br/>' + e.latlng).openPopup();
    drawPin(secondLatLng, "Punto B")
    // Dibujamos una línea entre los dos puntos
    let pl = L.polyline([firstLatLng, secondLatLng], {
      color: 'red'
    }).bindTooltip(map.distance(firstLatLng, secondLatLng).toFixed(2) + "m", {
      permanent: true,  // Hace que la etiqueta siempre sea visible
      direction: 'top', // La etiqueta se posicionará arriba de la polilínea
    });
    pl.addTo(map);
    pinMarkers.push(pl);
  } else {
    firstLatLng = e.latlng;
    //L.marker(firstLatLng).addTo(map).bindPopup('Point A<br/>' + e.latlng).openPopup();
    drawPin(firstLatLng, "Punto A");
    secondClick = true;
  }
}

function toggleVisibilidad() {
  var elementos = document.querySelectorAll(".AtoN");
  var btn = document.getElementById("btn-toogle-ver");
    var icono = btn.querySelector("i");
/*   if (btn.innerHTML == 'Ver desactivadas <i class="fa fa-eye" aria-hidden="true"></i>')
    btn.innerHTML = 'Ver activadas <i class="fa fa-eye" aria-hidden="true"></i>'
  else
    btn.innerHTML = 'Ver desactivadas <i class="fa fa-eye" aria-hidden="true"></i>' */
  // Alternar la visibilidad entre las clases activada y desactivada
  elementos.forEach(function (elemento) {
    if (elemento.classList.contains("activada")) {
      btn.innerHTML = "Ver desactivadas";
      elemento.classList.remove("activada");
      elemento.classList.add("desactivada");

    } else {
      btn.innerHTML = "Ver activadas";
      elemento.classList.remove("desactivada");
      elemento.classList.add("activada");
    }
  });
  // Cambiar el texto y el ícono del botón
  if (icono.classList.contains("fa-eye")) {
    icono.classList.remove("fa-eye");
    icono.classList.add("fa-eye-slash");
    btn.innerHTML = 'Ver Activadas <i class="fa fa-eye-slash" aria-hidden="true"></i>';
  } else {
    icono.classList.remove("fa-eye-slash");
    icono.classList.add("fa-eye");
    btn.innerHTML = 'Ver Desactivadas <i class="fa fa-eye" aria-hidden="true"></i>';
  }
}

function actualizarCoordenadaWGS2DEC() {
  var latWGS = document.getElementById("latmarkerWGS").value;
  var lngWGS = document.getElementById("lngmarkerWGS").value;
  var lat = document.getElementById("latmarker");
  var lng = document.getElementById("lngmarker");
  var punto = setMarkerLatLng(latWGS, lngWGS);

  lat.value = punto.lat;
  lng.value = punto.lng;

}

function actualizarCoordenadaDEC2WGS() {
  var latWGS = document.getElementById("latmarkerWGS");
  var lngWGS = document.getElementById("lngmarkerWGS");
  var lat = document.getElementById("latmarker").value;
  var lng = document.getElementById("lngmarker").value;
  var punto = getMarkerLatLng({ lat, lng });

  latWGS.value = punto.lat;
  lngWGS.value = punto.lng;

}