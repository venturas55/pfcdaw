//Este documento en js realiza la simulación de la luz, leyendo la caracteristica de la base de datos.
//====================================================================================================//


//Funcion que cambia la 'visibilidad' del elemento circular que simula la luz
function parpadeoToggle() {
    let x = document.getElementById("luz");
    if (x.style.display === "block") {
        x.style.display = "none";
    } else {
        x.style.display = "block";
    }
}

//Funcion que cambia el estado tras un retardo indicado 
function secuencia() {
    document.getElementById("luz").style.display = "block";
    for (let i = 0; i < destellosAcum.length - 1; i++) {
        setTimeout(parpadeoToggle, destellosAcum[i] * 1000);
    }
}

//Funcion para leer el color de la señal.
function defineColor() {

    let apariencia = document.getElementById("aparienciaID");
    let ap = apariencia.innerText.charAt(apariencia.innerText.length - 1).toUpperCase();
    //console.log(ap);
    switch (ap) {
        case 'R':
            document.getElementById("luz").style.backgroundColor = "red";
            break;
        case 'G':
        case 'V':
            document.getElementById("luz").style.backgroundColor = "green";
            break;
        case 'B':
        case 'W':
            document.getElementById("luz").style.backgroundColor = "rgb(240, 240, 240)";
            break;
        case 'A':
        case 'Y':
            document.getElementById("luz").style.backgroundColor = "yellow";
            break;
    }
}

//Funcion que cambia el estado tras un retardo indicado 
function defineCambiosEstado(){
    let destellos;
    let destellosAcum;
    let caracteristicaMod;
    let repeticiones;
    let caracteristica = document.getElementById("caracteristicaID").innerText;
    if (caracteristica === null)
        caracteristica = "L0.5 oc1.5 L0.5 oc4.5";
    caracteristica = caracteristica.toLowerCase();
    caracteristica = caracteristica.replace(/\ |\(|\[|\[|\)|\]\+/g, '');
    caracteristica = caracteristica.replace(/,/g, '.');
    caracteristica = caracteristica.replace(/oc/g, "l");
    caracteristica = caracteristica.replace(/o/g, "l");
    //console.log(caracteristica);
    
    //Tratamos las posibles repeticiones
    //Si hay X
    if (caracteristica.search("x") != -1) {
        repeticiones = caracteristica.charAt(caracteristica.search("x") + 1); //el siguiente digito al simbolo multiplicacion 'x' es el numero de repeticiones
        let trimado = 'x' + repeticiones;
        caract = caracteristica.split(trimado);
        caract[0] = caract[0].repeat(repeticiones);
        caracteristicaMod = caract[0].concat(caract[1]);
    } else
        caracteristicaMod = caracteristica;
    //console.log(caracteristicaMod)
    
    
    //Doy por hecho que siempre se alternan L y O empezando por L
    caracteristicaMod = caracteristicaMod.replace('l', '');
    //quito la primera L por no generar un item de array al usar el split
    destellos = caracteristicaMod.split('l');
    destellosAcum = new Array(destellos.length);
    destellosAcum.fill(0, 0, destellos.length);
    
    //Lo parseo a float
    for (let i = 0; i < destellos.length; i++) {
        destellos[i] = parseFloat(destellos[i]);
    }
    //console.log(destellos);


    //Genero un array con los tiempos acumulados, desde 0 para poder aplicar los setInterval.
    for (let i = 0; i < destellosAcum.length; i++) {
        for (let j = 0; j <= i; j++) {
            destellosAcum[i] += parseFloat(destellos[j]);
        }
    }
    console.log(destellosAcum);
    return destellosAcum;
}


//EJECUCIÓN DEL CODIGO

//defino color
defineColor();
//defino cambios de estado en el tiempo
let destellosAcum = defineCambiosEstado();
//ejecuto la primera vez para mostrar la simulacion de la luz porque inicialmente se encuentra oculto.
secuencia();

//Y ejecuto los siguientes cambios de estado.
setInterval(() => {
    secuencia()
}, destellosAcum[destellosAcum.length - 1] * 1150)
