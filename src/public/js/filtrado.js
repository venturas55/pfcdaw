
//FUNCION para filtrar
$("#myInput").on("keyup", function () {
    var value = $(this).val().toLowerCase();
    //console.log(value);
    $("#listado .fila").filter(function () {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
    });
});




//FUNCION SOLO PARA CONTAR FILAS EN VISTA 'balizas/list.hbs'
let inputBusqueda = document.getElementById("myInput");
if (!isNull(inputBusqueda))
    inputBusqueda.addEventListener("keyup", contar);

let inicial = document.getElementsByClassName("fila");

let suma = document.getElementById("suma");
if (!isNull(suma))
    suma.innerHTML = inicial.length;


