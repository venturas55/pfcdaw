let centerLatLng = centrar();
//console.log(centerLatLng);
fetchData().then((res) => { initMapa(res) });

if (lat.value != "" && lng.value !="") {
    //console.log("es baliza");
    map.panTo(setMarkerLatLng(lat.value,lng.value));

} else {
    //console.log("NO es baliza");
}


