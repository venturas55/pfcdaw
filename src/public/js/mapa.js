let centerLatLng = centrar();
//console.log(centerLatLng);
fetchData().then((res) => { initMapa(res) });
