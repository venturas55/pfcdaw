$(document).ready(function () {
    $("#myInput").on("keyup", function () {
        var value = $(this).val().toLowerCase();
        $("#listado .fila").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });
});

//FUNCION SOLO PARA CONTAR FILAS EN VISTA 'balizas/list.hbs'
document.getElementById("myInput").addEventListener("keyup", contar);
var inicial = document.getElementsByClassName("fila");
document.getElementById("suma").innerHTML = inicial.length;

async function contar() {
    //var numElem = document.getElementsByClassName("hidden").length;
    var numElem = await document.querySelectorAll('[style="display: none;"]');
    console.log(numElem);
    document.getElementById("suma").innerHTML = (inicial.length - numElem.length);
}
