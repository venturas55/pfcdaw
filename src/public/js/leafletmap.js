  // initialize Leaflet
  console.log("leaflet initialization");
  let centerLatLng = centrar();
  //console.log(centerLatLng);
  fetchData().then((res) => { initMapaLeafLet(res) });