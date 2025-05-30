let centerLatLng = centrar();
//console.log(centerLatLng);


//FUNCION PARA INICIAR EL MAPA DE GOOGLE
function initMapa(balizas) {
    //console.log(balizas);
    map = new google.maps.Map(document.getElementById("myMap"), {
        zoom: presetZoom,
        center: centerLatLng,
        mapId: "MAP_GOOGLE"
    });
     const markers = Promise.all(balizas.map(async item => {
        const marker = new google.maps.Marker({
            map: map,
            position: setMarkerLatLng(item.latitud, item.longitud),
            label: {
                text: item.nif.toString(),
                className: 'etiquetaGoogle'
            },
            title: item.tipo,
            icon: {
                url: myurl + '/img/icon/' + getTipo(item) + '.png',
                scaledSize: {
                    width: 15,
                    height: 30
                }
            },
            
        });

        /* PARA USAR UNA VENTANA */
  /*       const contentString =
                  '<div id="content">INFO' +
                  "<div>" +
                  '<a href="/aton/plantilla/' + item.nif.toString() + '">' + item.nif.toString() + "</a> " +
                  "</div>" +
                  "</div>";
      
              const infowindow = new google.maps.InfoWindow({
                  content: contentString,
                  ariaLabel: "AtoN",
              }); */ 
        /* FIN USAR  VENTANA */

        // markers can only be keyboard focusable when they have click listeners
        // open info window when marker is clicked
        marker.addListener("click", () => {
            //console.log(marker.label);
            location.href = '/aton/plantilla/' + marker.label.text;
        });


    /*     marker.addListener("click", () => {
            infowindow.open({
                anchor: marker,
                map,
            });
        }); */

        return await marker;
    })); 
}




fetchData().then((res) => { initMapa(res) });
