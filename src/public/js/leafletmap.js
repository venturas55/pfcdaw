// initialize Leaflet
let centerLatLng = centrar();
let posicionInicial = { lat: 1, lng: 1 };
let map;
let pinMarkers = [];
let secondClick = false, firstLatLng, secondLatLng;
var popup = L.popup();
const fechaActual = new Date();
let fechaMenos30 = new Date(fechaActual);
fechaMenos30.setDate(fechaMenos30.getDate() - 30);
let modoCreacionActivo = false;
let btnDistance = document.getElementById("botoneraDistancias");
btnDistance.classList.toggle('desactivada');
let btnLimpiarUltimo = document.getElementById("limpiarUltimo");
btnLimpiarUltimo.disabled = true;

fetchData()?.then((balizas) => {
  // === 1. INICIALIZACIÓN DEL MAPA ===
  map = L.map('myMap').setView(centerLatLng, presetZoom);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 17 }).addTo(map);
  L.control.scale({ imperial: true, metric: true }).addTo(map);
  map.attributionControl.setPrefix('');
  map.on('click', function (e) {
    if (!modoCreacionActivo) return;  // 👈 si está desactivado no hace nada
    onMapDistance(e);
  });

  const markers = [];

  // === 2. FUNCIONES AUXILIARES ===

  function crearIcono(item) {
    const icono = getTipo(item);
    const iconConfig = {
      iconUrl: `${myurl}/img/icon/${icono}.png`,
      iconSize: [16, 30],
      iconAnchor: [8, 30],
      className: item.apagada ? 'AtoN desactivada' : 'AtoN activada',
    };


    if (icono === 'TC') {
      iconConfig.iconSize = [20, 20];
      iconConfig.iconAnchor = [10, 50];
    }
    return L.icon(iconConfig);
  }

  function crearTooltip(item, marker) {
    const ruta = item.pictureUrl.length > 0
      ? `/img/imagenes/${item.nif}/${item.pictureUrl[0]}`
      : "/img/icon/buoyIcon.jpg";

    return `
      <div class="bind-tooltip">
        <p><strong>NIF: ${item.nif}</strong></p>
        <p>Apariencia: ${item.apariencia}</p>
        <p class="text-center">${marker.getLatLng()}</p>
        <img class="avatar avatar-s" src="${ruta}" />
      </div>`;
  }

  function crearPopupHTML(item, position, textposition, posicionInicial) {
    return `
      <div class="card-body">
        <h4>¿Desplazar señal aquí?</h4>
        <form action="/aton/editLocalizacionFromMap/${item.nif}" method="POST">
          <input type="hidden" name="nif" value="${item.nif}" />
          <div class="form-group mb-2">
            <label for="latitud">LATITUD</label>
            <input type="text" name="latitud" value="${textposition.lat}" class="form-control" />
          </div>
          <div class="form-group mb-2">
            <label for="longitud">LONGITUD</label>
            <input type="text" name="longitud" value="${textposition.lng}" class="form-control" />
          </div>
          <input type="hidden" name="lat" value="${position.lat}" />
          <input type="hidden" name="lng" value="${position.lng}" />
          <div class="form-group mb-2 text-center">
            <button class="btn btn-success btn-block">SI</button>
          </div>
        </form>
        <div class="form-group mb-2 text-center">
          <button type="button" id="cancelarMovimiento" class="btn btn-danger btn-block">NO</button>

        </div>
      </div>`;
  }

  // === 3. DIBUJAR BALIZAS ===

  balizas.forEach(item => {
    try {
      const icono = crearIcono(item);
      const marker = new L.Marker({ "lat": item.coordenadas.x, "lng": item.coordenadas.y }, {
        icon: icono,
        title: item.tipo,
        draggable: true,
      });

      //SI NECESITA PINTADO
      if (item.necesita_pintado) {
        const htmlIcon = L.divIcon({
          className: 'custom-div-icon',
          html: '<i class="fa fa-paint-brush me-1 text-primary infoAtoN info-desactivada"></i>',
          iconSize: [50, 50],
          iconAnchor: [-10, 35],
        });

        const submarker = L.marker({ "lat": item.coordenadas.x, "lng": item.coordenadas.y }, {
          icon: htmlIcon,
          interactive: false // si solo lo quieres como decorativo
        });
        submarker.addTo(map);

      }
      //SI TIENE ALGUN TICKET ACTIVO
      if (item.tickets.length > 0) {
        const htmlIcon = L.divIcon({
          className: 'custom-div-icon',
          html: '<i class="fa fa-exclamation-triangle me-1 blink_me text-danger infoAtoN info-desactivada"></i>',
          iconSize: [50, 50],
          iconAnchor: [20, 35],
        });

        const submarker = L.marker({ "lat": item.coordenadas.x, "lng": item.coordenadas.y }, {
          icon: htmlIcon,
          interactive: false // si solo lo quieres como decorativo
        });
        submarker.addTo(map);

      }


      // SI TIENE ALGUN MANTENIMIENTO REALIZADO EN EL ULTIMO MES
      for (let i = 0; i < item.mantenimiento.length; i++) {
        if (new Date(item.mantenimiento[i].fecha).getTime() > fechaMenos30.getTime()) {
          /*   circle = L.circleMarker({ "lat": item.coordenadas.x, "lng": item.coordenadas.y }, {
             radius: 15,
             color: '#ee6371',      // rojo bootstrap
             weight: 1,
             fillColor: '#5d66ec',
             fillOpacity: 0.15,
             interactive: false
           }).addTo(map);
           // Opcional: mandar detrás del marker
           circle.bringToBack();
           break;*/

          const htmlIcon = L.divIcon({
            className: 'custom-div-icon',
            html: '<div class="circulito infoAtoN info-desactivada"></div>',
            iconSize: [40, 40],
            iconAnchor: [20, 35],
          });

          const submarker = L.marker({ "lat": item.coordenadas.x, "lng": item.coordenadas.y }, {
            icon: htmlIcon,
            interactive: false // si solo lo quieres como decorativo
          });
          submarker.addTo(map);
          break;
        }
      }
      let posicionInicial;
      marker.on('dragstart', e => posicionInicial = e.target.getLatLng());

      marker.on('dragend', e => {
        const thismarker = e.target;
        const newPosition = thismarker.getLatLng();
        const textPos = getMarkerLatLng(newPosition);
        thismarker.setLatLng(newPosition, { draggable: 'true' });
        map.panTo(newPosition);
        popup
          .setLatLng(newPosition)
          .setContent(crearPopupHTML(item, newPosition, textPos, posicionInicial))
          .openOn(map);
        markers.push(thismarker);

        // Vincular evento al botón "NO"
        setTimeout(() => {
          const botonCancelar = document.getElementById('cancelarMovimiento');
          if (botonCancelar) {
            botonCancelar.addEventListener('click', () => {
              thismarker.setLatLng(posicionInicial);
              map.setView(posicionInicial);
              map.closePopup();
            });
          }
        }, 0);
      });

      marker.on('click', () => {
        window.location.href = `/aton/plantilla/${item.nif}`;
      });

      marker.bindTooltip(crearTooltip(item, marker), {
        opacity: 0.7,
        direction: 'top',
        sticky: false,
        offset: [0, -10],
      });

      marker.on('contextmenu', e => {
        const ruta = item.pictureUrl.length > 0
          ? `/img/imagenes/${item.nif}/${item.pictureUrl[0]}`
          : "/img/icon/buoyIcon.jpg";

        const html = `
        <div class="bind-tooltip">
          <div class="d-flex flex-row gap-1">
            <p><strong>NIF: ${item.nif}</strong></p> 
            <img class="avatar avatar-s" src="${ruta}" />
          </div>  
          <div class="d-flex flex-column gap-2 mt-2">
            <button class="btn btn-primary btn-sm" onclick="window.location.href='/aton/plantilla/${item.nif}'">Ver</button>
            <button class="btn btn-success btn-sm" onclick="window.location.href='/aton/pintura/${item.nif}/map'">Necesita Pintado</button>
            <button class="btn btn-danger btn-sm" onclick="window.location.href='/aton/toggleapagado/${item.nif}'">Apagar/Activar</button>
            <button class="btn btn-warning btn-sm" onclick="window.location.href='/mantenimientopreventivo/add/${item.nif}'">Preventivo</button>
          </div>  
        </div>`;
        L.popup().setLatLng(e.latlng).setContent(html).openOn(map);
      });

      marker.addTo(map);
    } catch (err) {
      // añadir info del item al error
      err.item = item;
      throw err; // ahora el catch final lo recibirá con el item
    }
  });

  // === 4. CAPA DE ZONAS ===

  const zonas = [
    {
      type: "Feature",
      properties: { zone: "zonaII" },
      geometry: {
        type: "Polygon",
        coordinates: [[ //HORARIO
          [-0.2119, 39.4666], //2
          [-0.2119, 39.3827], //7
          [-0.32045, 39.3827], //9
          //[-0.3300, 39.4038], //58
          [-0.328516, 39.40395], //58
          //[-0.332033, 39.41215], //57
          [-0.3307, 39.41351], //57
          [-0.32985, 39.422433], //54
          [-0.331933, 39.4255],//55
          [-0.334138, 39.4376],
          [-0.3265, 39.4476],
          [-0.332422, 39.4600577],
          [-0.32907, 39.462141],
          [-0.3165, 39.4629], //56
          [-0.3166, 39.4666], //1
          [-0.2119, 39.4666], //2
        ]]
      }
    },
    {
      type: "Feature",
      properties: { zone: "zonaI" },
      geometry: {
        type: "Polygon",
        coordinates: [[ //ANTIHORARIO
          [-0.331933, 39.4255], //55
          [-0.3173, 39.42058], //cardinalsur
          [-0.31381, 39.42273], //rotonda
          [-0.31312, 39.42286], //rotonda
          [-0.31245, 39.42328], //rotonda
          [-0.3089, 39.43038], //26
          [-0.3022, 39.4338], //25
          [-0.302, 39.44446],//20
          [-0.2987, 39.44446],//20 derecha
          [-0.29775, 39.4463],//20arriba
          [-0.2914, 39.44403],//16
          [-0.2857, 39.4549],//10
          [-0.2958, 39.45857],//10
          [-0.2960, 39.4583],//10
          [-0.30766, 39.46209],//10izq
          [-0.30775, 39.46282],//10izq arriba
          [-0.3165, 39.4629], //56
          [-0.32907, 39.462141],
          [-0.332422, 39.4600577],
          [-0.3265, 39.4476],
          [-0.334138, 39.4376],
        ]]
      },

    },
    {
      type: "Feature",
      properties: { zone: "zonaI" }, //sagunto
      geometry: {
        type: "Polygon",
        coordinates: [[ //ANTIHORARIO
          [-0.21560669, 39.655126], // Punto 1
          [-0.219511985, 39.650277316], // 
          [-0.213621854, 39.647567], // 
          [-0.21391153, 39.6469068], // 
          [-0.2133, 39.646659], // 
          [-0.2134502, 39.6457337], // 
          [-0.2130103, 39.645733778], // 
          [-0.2123236, 39.6428009], // me fumo un recoveco
          [-0.2134394, 39.6426357], // 
          [-0.21983385, 39.645585], // 
          [-0.2242112, 39.6400085], // 
          [-0.2238357, 39.639867], // 
          [-0.224061, 39.63951277], // 
          [-0.2144694, 39.63505942], // me fumo un muelle en contradique
          [-0.2115726, 39.6380504],
          [-0.21115422, 39.6376786],
          [-0.211991, 39.6368523],
          [-0.2120018, 39.6353486],
          [-0.21216273, 39.63524946],
          [-0.212152, 39.6334977],
          [-0.21191597, 39.6334647],
          [-0.21188378, 39.633258],
          [-0.2123451, 39.6332747],
          [-0.2154994, 39.6292588], //la cardinal sur 
          [-0.2053928, 39.6304],// me fumo el martillo campa san
          [-0.2055966, 39.642421],
          [-0.208118, 39.643338],
          [-0.20829, 39.643263],
          [-0.20858, 39.64333],
          [-0.209598, 39.64808],
          [-0.2098775, 39.648113], // me fumo el varadero
          [-0.2102, 39.65036],
          [-0.2111, 39.65226], //bocana pesquero
          [-0.210446, 39.65292],
        ]]
      },

    },
    {
      type: "Feature",
      properties: { zone: "zonaII" }, //sagunto
      geometry: {
        type: "Polygon",
        coordinates: [[ //ANTIHORARIO
          //[-0.205478 + 0.0867 * Math.cos(12 * Math.PI / 10), 39.63058 + 0.0667 * Math.sin(12 * Math.PI / 10)], // Punto 13
          [-0.271911, 39.588228],

          [-0.205478 + 0.0867 * Math.cos(13 * Math.PI / 10), 39.63058 + 0.0667 * Math.sin(13 * Math.PI / 10)], // Punto 14
          [-0.205478 + 0.0867 * Math.cos(14 * Math.PI / 10), 39.63058 + 0.0667 * Math.sin(14 * Math.PI / 10)], // Punto 15
          [-0.205478 + 0.0867 * Math.cos(15 * Math.PI / 10), 39.63058 + 0.0667 * Math.sin(15 * Math.PI / 10)], // Punto 16
          [-0.205478 + 0.0867 * Math.cos(16 * Math.PI / 10), 39.63058 + 0.0667 * Math.sin(16 * Math.PI / 10)], // Punto 17
          [-0.205478 + 0.0867 * Math.cos(17 * Math.PI / 10), 39.63058 + 0.0667 * Math.sin(17 * Math.PI / 10)], // Punto 18
          [-0.205478 + 0.0867 * Math.cos(18 * Math.PI / 10), 39.63058 + 0.0667 * Math.sin(18 * Math.PI / 10)], // Punto 19
          [-0.205478 + 0.0867 * Math.cos(19 * Math.PI / 10), 39.63058 + 0.0667 * Math.sin(19 * Math.PI / 10)], // Punto 20
          [-0.205478 + 0.0867 * Math.cos(0 * Math.PI / 10), 39.63058 + 0.0667 * Math.sin(0 * Math.PI / 10)],  // Punto 1
          [-0.205478 + 0.0867 * Math.cos(1 * Math.PI / 10), 39.63058 + 0.0667 * Math.sin(1 * Math.PI / 10)],  // Punto 2
          [-0.205478 + 0.0867 * Math.cos(2 * Math.PI / 10), 39.63058 + 0.0667 * Math.sin(2 * Math.PI / 10)],  // Punto 2
          //[-0.205478 + 0.0867 * Math.cos(3 * Math.PI / 10), 39.63058 + 0.0667 * Math.sin(3 * Math.PI / 10)],  // Punto 2
          [-0.153679,39.68384], //a 3mn de escollera ocn direccion 55 rumbo
          [-0.209341, 39.653944], //escollera
          [-0.2111, 39.65226], //verde pesquero
          [-0.2102, 39.65036],
          [-0.2098775, 39.648113],
          [-0.209598, 39.64808],
          [-0.20858, 39.64333],
          [-0.20829, 39.643263],
          [-0.208118, 39.643338],
          [-0.2055966, 39.642421],
          [-0.2053928, 39.6304],// verde bocana
          [-0.2154994, 39.6292588], //la cardinal sur 
          [-0.22798,39.63486],
          [-0.22826,39.63553], [-0.2279,39.6367],[-0.230369,39.6388],[-0.23878,39.6353],[-0.25852,39.61527],[-0.267448,39.5990]




          //[-0.205478 + 0.0867 * Math.cos(1 * Math.PI / 10), 39.63058 + 0.0667 * Math.sin(1 * Math.PI / 10)],  // Punto 2
          //[-0.205478 + 0.0867 * Math.cos(2 * Math.PI / 10), 39.63058 + 0.0667 * Math.sin(2 * Math.PI / 10)],  // Punto 3
          //[-0.205478 + 0.0867 * Math.cos(3 * Math.PI / 10), 39.63058 + 0.0667 * Math.sin(3 * Math.PI / 10)],  // Punto 4
          //[-0.205478 + 0.0867 * Math.cos(4 * Math.PI / 10), 39.63058 + 0.0667 * Math.sin(4 * Math.PI / 10)],  // Punto 5
          //[-0.1987838,39.69629],
          //[-0.205478 + 0.0867 * Math.cos(5 * Math.PI / 10), 39.63058 + 0.0667 * Math.sin(5 * Math.PI / 10)],  // Punto 6


          //[0.138471,39.692074], //es el de la 55 en direccion verdadera a 4mn del punto de la escollera [ -0.209341, 39.653944]

        ]]
      },
    },
    {
      type: "Feature",
      properties: { zone: "zonaII" }, //GANDIA
      geometry: {
        type: "Polygon",
        coordinates: [[ //ANTIHORARIO
          [-0.156183, 38.998800], // Punto 1
          [-0.1442,38.9953],[-0.14459,38.9949],[-0.14672,38.9942],[-0.15031,38.9915],
          [-0.126183, 38.962133], // Punto 2
          [-0.0473,39.0050], //punto2b
          [-0.0772,39.0417], // punto 1b
        ]]
      },

    },
    {
      type: "Feature",
      properties: { zone: "zonaI" }, //GANDIA
      geometry: {
        type: "Polygon",
        coordinates: [[ //ANTIHORARIO
          [-0.144646, 38.995056], // 
          [-0.156244, 38.998091], // 
          [-0.156780, 38.997857], // 
          [-0.155868, 38.996640],  // 
          [-0.155128, 38.996915],
          [-0.154742, 38.9964071],
          [-0.153100, 38.996982],
          [-0.1529717, 38.996799],
          [-0.156147, 38.995698],
          [-0.1560616, 38.9955899],
          [-0.1589262, 38.994614],//VIENE CURVA EN PLAYA VARADERO
          [-0.1592588, 38.9939639],
          [-0.160868, 38.9931968],
          [-0.16051411, 38.9926297],
          [-0.1600849, 38.9928215],
          [-0.160042, 38.99277154],
          [-0.15525698, 38.99453933],
          [-0.1553857, 38.9947477],
          [-0.15432357, 38.995123], //VIENE RECOVECO EN GANDRIA GRAU (LA ROJA)
          [-0.15392661, 38.9948145],
          [-0.15179157, 38.995623331],
          [-0.15133023, 38.9951814],
          [-0.151458978, 38.994964595],
          [-0.1489162, 38.992954997],
          [-0.14702797, 38.9943392],
          [-0.1467597, 38.9943975],



        ]]
      },

    },
  ];

  const capaZonas = L.geoJSON(zonas, {
    style: feature => ({
      color: feature.properties.zone === 'zonaII' ? '#9999ff' : '#9999aa',
      color: feature.properties.zone === 'zonaI' ? '#99ff99' : '#9999ff'
    })
  });

  let zonasVisibles = false;

  // === 5. BOTONES DE TOGGLE ZONAS ===

  const crearBotonToggle = (position, id, texto, clase, callback) => {
    const control = L.control({ position });
    control.onAdd = function () {
      const div = L.DomUtil.create('div', 'leaflet-control-custom');
      div.innerHTML = `<button id="${id}" class="${clase}">${texto}</button>`;
      L.DomEvent.disableClickPropagation(div);
      return div;
    };
    control.addTo(map);
    return id;
  };

  //boton de la info extra mostrada en el plano
  crearBotonToggle('topright', 'btn-toogle-ver-info', 'Ver info <i class="fa fa-eye" aria-hidden="true"></i>', 'btn btn-secondary btn-sm');
  document.getElementById('btn-toogle-ver-info').addEventListener('click', () => {
    toggleVisibilidadInfo();
  });

  //boton para alternar entre balizas activas y desactivadas
  crearBotonToggle('bottomleft', 'btn-toogle-ver', 'Ver Desactivadas <i class="fa fa-eye" aria-hidden="true"></i>', 'btn btn-secondary btn-sm');
  document.getElementById('btn-toogle-ver').addEventListener('click', () => {
    toggleVisibilidad();
  });

  crearBotonToggle('bottomright', 'btn-modo-creacion', 'Activar medicion <i class="fa fa-exchange" aria-hidden="true"></i>', 'btn btn-primary btn-sm');
  document.getElementById('btn-modo-creacion').addEventListener('click', function () {
    modoCreacionActivo = !modoCreacionActivo;
    if (modoCreacionActivo) {
      this.innerHTML = 'Desactivar medicion <i class="fa fa-exchange" aria-hidden="true"></i>';
      map.getContainer().style.cursor = 'crosshair'; // cambia cursor
      btnDistance.classList.toggle('desactivada');
    } else {
      this.innerHTML = 'Activar medicion <i class="fa fa-exchange" aria-hidden="true"></i>';
      map.getContainer().style.cursor = '';
      if (!modoCreacionActivo) {
        clearAll();
      }
      btnDistance.classList.toggle('desactivada');
    }
  });

  //Boton para ver o no las Zonas portuarias
  crearBotonToggle('bottomright', 'toggleZonasBtn', 'Zona II', 'btn btn-primary btn-sm');
  document.getElementById('toggleZonasBtn').addEventListener('click', () => {
    if (zonasVisibles) {
      map.removeLayer(capaZonas);
    } else {
      map.addLayer(capaZonas);
    }
    zonasVisibles = !zonasVisibles;
  });

}).catch(err => {
  console.error("Error en fetchData:", err);
  if (err.item) console.error("Item que causó error:", err.item);
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
  btnLimpiarUltimo.disabled = false;

}

function drawThisPin() {
  drawPin({ "lat": document.getElementById("latmarker").value, "lng": document.getElementById("lngmarker").value }, "Un Pin");
}

function clearAll() {
  for (let i = 0; i < pinMarkers.length; i++)
    map.removeLayer(pinMarkers[i]);
  pinMarkers = [];
  secondClick = false
  btnLimpiarUltimo.disabled = true;
}

function clearLast() {
  map.removeLayer(pinMarkers[pinMarkers.length - 1]);
  pinMarkers.pop();
  secondClick = false
  if (pinMarkers.length == 0)
    btnLimpiarUltimo.disabled = true;
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

function toggleVisibilidadInfo() {
  var elementos = document.querySelectorAll(".infoAtoN");
  var btn = document.getElementById("btn-toogle-ver-info");
  var icono = btn.querySelector("i");
  // Alternar la visibilidad entre las clases activada y desactivada
  elementos.forEach(function (elemento) {
    if (elemento.classList.contains("info-activada")) {
      btn.innerHTML = "Ocultar info";
      elemento.classList.remove("info-activada");
      elemento.classList.add("info-desactivada");

    } else {
      btn.innerHTML = "Ver info";
      elemento.classList.remove("info-desactivada");
      elemento.classList.add("info-activada");
    }
  });
  // Cambiar el texto y el ícono del botón
  if (icono.classList.contains("fa-eye")) {
    icono.classList.remove("fa-eye");
    icono.classList.add("fa-eye-slash");
    btn.innerHTML = 'Ocultar Info <i class="fa fa-eye-slash" aria-hidden="true"></i>';
  } else {
    icono.classList.remove("fa-eye-slash");
    icono.classList.add("fa-eye");
    btn.innerHTML = 'Ver Info <i class="fa fa-eye" aria-hidden="true"></i>';
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
