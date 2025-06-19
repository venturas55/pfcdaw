let centerLatLng = centrar();
//console.log(centerLatLng);

 async function initMap() {
    const balizas = await fetchData();

    const map = new google.maps.Map(document.getElementById('myMap'), {
      center: centerLatLng,
      zoom: presetZoom,
      scaleControl: true
    });

    const zonasCoords = [ /* tus coordenadas geojson de zonas */ ];
    const zonasVisible = new google.maps.Data();
    zonasVisible.addGeoJson({ features: zonasCoords.map(z => ({
      type: "Feature",
      geometry: z.geometry,
      properties: z.properties
    }))});
    zonasVisible.setStyle(feature => ({
      fillColor: feature.getProperty('zone') === 'DPP' ? '#9999ff' : '#ffbbbb',
      strokeColor: feature.getProperty('zone') === 'DPP' ? '#9999ff' : '#ffbbbb',
      strokeWeight: 2
    }));

    let zonasLayerActiva = false;

    function toggleZonas() {
      if (zonasLayerActiva) pisos = zonasVisible.setMap(null);
      else zonasVisible.setMap(map);
      zonasLayerActiva = !zonasLayerActiva;
    }

    document.getElementById('toggleZonasBtn').addEventListener('click', toggleZonas);

    balizas.forEach(item => {
      const position = { lat: item.latitud, lng: item.longitud };
      const iconUrl = `${myurl}/img/icon/${getTipo(item)}.png`;
      const marker = new google.maps.Marker({
        position,
        map,
        draggable: true,
        title: item.tipo,
        icon: {
          url: iconUrl,
          scaledSize: new google.maps.Size(item.tipo==='TC'?20:16, item.tipo==='TC'?20:30),
          anchor: new google.maps.Point(item.tipo==='TC'?10:8, item.tipo==='TC'?50:30),
          className: item.apagada ? 'AtoN desactivada' : 'AtoN activada'
        }
      });

      const tooltip = new google.maps.InfoWindow({
        content: `
          <div class="bind-tooltip">
            <p><strong>NIF: ${item.nif}</strong></p>
            <p>Apariencia: ${item.apariencia}</p>
            <p>${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}</p>
            <img class="avatar avatar-s" src="${
              item.pictureUrl.length>0
              ? `/img/imagenes/${item.nif}/${item.pictureUrl[0]}`
              : "/img/icon/buoyIcon.jpg"
            }"/>
          </div>`
      });

      marker.addListener('mouseover', () => tooltip.open(map, marker));
      marker.addListener('mouseout', () => tooltip.close());

      let startPos;
      marker.addListener('dragstart', () => startPos = marker.getPosition());

      marker.addListener('dragend', e => {
        const newPos = marker.getPosition();
        map.panTo(newPos);
        const textPos = { lat: newPos.lat(), lng: newPos.lng() };

        const infoWindow = new google.maps.InfoWindow({
          content: `
          <div class="card-body">
            <h4>¿Desplazar señal aquí?</h4>
            <form action="/aton/editLocalizacionFromMap/${item.nif}" method="POST">
              <input type="hidden" name="nif" value="${item.nif}">
              <div class="form-group mb-2"><label>LATITUD<input class="form-control" name="latitud" value="${textPos.lat}"></label></div>
              <div class="form-group mb-2"><label>LONGITUD<input class="form-control" name="longitud" value="${textPos.lng}"></label></div>
              <input type="hidden" name="lat" value="${newPos.lat()}">
              <input type="hidden" name="lng" value="${newPos.lng()}">
              <div class="text-center">
                <button class="btn btn-success btn-sm">SI</button>
                <button type="button" id="cancelarMovimiento" class="btn btn-danger btn-sm">NO</button>
              </div>
            </form>
          </div>`
        });
        infoWindow.open(map, marker);

        google.maps.event.addListenerOnce(infoWindow, 'domready', () => {
          document.getElementById('cancelarMovimiento').onclick = () => {
            marker.setPosition(startPos);
            map.panTo(startPos);
            infoWindow.close();
          };
        });
      });

      marker.addListener('click', () => {
        window.location.href = `/aton/plantilla/${item.nif}`;
      });

      marker.addListener('rightclick', e => {
        const content = `
          <div class="bind-tooltip">
            <div class="d-flex align-items-center gap-2">
              <strong>NIF: ${item.nif}</strong>
              <img class="avatar avatar-s" src="${
                item.pictureUrl.length>0
                ? `/img/imagenes/${item.nif}/${item.pictureUrl[0]}`
                : "/img/icon/buoyIcon.jpg"
              }"/>
            </div>
            <div class="mt-2 d-grid gap-2">
              <button class="btn btn-primary btn-sm" onclick="window.location.href='/aton/plantilla/${item.nif}'">Ver</button>
              <button class="btn btn-success btn-sm" onclick="window.location.href='/aton/pintura/${item.nif}/map'">Necesita Pintado</button>
              <button class="btn btn-danger btn-sm" onclick="window.location.href='/aton/toggleapagado/${item.nif}'">Apagar/Activar</button>
              <button class="btn btn-warning btn-sm" onclick="window.location.href='/mantenimientopreventivo/add/${item.nif}'">Preventivo</button>
            </div>
          </div>`;
        const ctxInfo = new google.maps.InfoWindow({ content });
        ctxInfo.setPosition(e.latLng);
        ctxInfo.open(map);
      });
    });

    // Añadir botón toggle zonas
    const controlDiv = document.createElement('div');
    const btn = document.createElement('button');
    btn.id = 'toggleZonasBtn';
    btn.className = 'btn btn-primary btn-sm';
    btn.textContent = 'Zona II';
    controlDiv.appendChild(btn);
    map.controls[google.maps.ControlPosition.BOTTOM_RIGHT].push(controlDiv);
  }

  initMap();