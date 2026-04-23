
const Cd_aire = {
    "cilindro": 0.35,
    "chapa": 1,
    "celosia_angulos": 1.2,
    "celosia_tubo": 0.35
}

const Cd_water = {
    "cilindro": 0.6,
    "cilindro_plus": 0.65, //para incrustaciones
    "cilindro_minus": 0.55, //para nuevas
}

const densidad = {
    "hormigon_armado": 2400,
    "hierro_fundicion": 7800
}

const oleaje = {
    "interior": 2,
    "intermedio": 3.5,
    "exterior": 5
}

const datos = {
    "velocidad_viento": 40,     // m/s
    "densidad_aire": 1.29,     // kg/m3
    "densidad_agua": 1024,     // kg/m3
    "velocidad_agua": 2          // m/s
}

const eslabones = [
    {
        "diametro": 10,
        "peso": 2,
        "t": 4
    },
    {
        "diametro": 13,
        "peso": 3.5,
        "t": 4
    },
    {
        "diametro": 16,
        "peso": 5.2,
        "t": 64
    },
    {
        "diametro": 18,
        "peso": 6.5,
        "t": 72
    },
    {
        "diametro": 20,
        "peso": 8.2,
        "t": 80
    },
    {
        "diametro": 22,
        "peso": 10,
        "t": 88
    },
    {
        "diametro": 24,
        "peso": 11,
        "t": 95
    },
    {
        "diametro": 26,
        "peso": 14,
        "t": 104
    },
    {
        "diametro": 30,
        "peso": 19,
        "t": 120
    },
    {
        "diametro": 32,
        "peso": 22.5,
        "t": 128
    },
    {
        "diametro": 34,
        "peso": 23.5,
        "t": 126
    },
    {
        "diametro": 36,
        "peso": 26.5,
        "t": 144
    },
    {
        "diametro": 38,
        "peso": 31,
        "t": 152
    },
    {
        "diametro": 40,
        "peso": 33,
        "t": 160
    },
    {
        "diametro": 42,
        "peso": 36,
        "t": 168
    },

]

function obtenerPeso(diametro) {
    const eslabon = eslabones.find(e => e.diametro === diametro);
    if (eslabon) {
        return eslabon.peso;
    }
    // Si no se encuentra el diámetro exacto, buscar el inmediato superior
    const eslabonSuperior = eslabones
        .filter(e => e.diametro > diametro) // Filtramos los diámetros superiores
        .sort((a, b) => a.diametro - b.diametro) // Ordenamos por diámetro ascendente
    [0]; // Tomamos el primero de la lista (el más cercano al diámetro buscado)

    if (eslabonSuperior) {
        return eslabonSuperior.peso; // Retornamos el peso del diámetro superior
    }

    return null; // Si no hay eslabón superior, devolvemos null
}

function volumen_cadena_por_metro(diametro) {
    return (diametro / 1000) ** 2 * Math.PI / 4 * 2  //el por dos es porque el eslabon va y vuelve.
}

function flotabilidad(volumen) {
    return datos.densidad_agua * volumen;
}

function peso_sumergido_por_metro(diametro) {
    return obtenerPeso(diametro) - flotabilidad(volumen_cadena_por_metro(diametro));
}

async function fetchBoyas() {
    try {
        var apiURL = myurl + "/api/aton/boyas";
        console.log("fetch URL: ", apiURL);
        return await fetch(apiURL).then(res => res.json());
    } catch (err) {
        console.log(err);
    }
}

function pgH(diametro, calado, ola) {
    return peso_sumergido_por_metro(diametro) * 9.81 * (calado + ola);
}

function pgL(diametro, l_cadena) {
    return peso_sumergido_por_metro(diametro) * 9.81 * l_cadena;
}

function durmiente(longitud, calado) {
    return longitud - calado;
}


let esteFondeo = null; // variable global

const nif = document.getElementById("nif").innerHTML;
fetchBoyas().then(boyas => {
    esteFondeo = boyas.find(b => b.nif === nif);
    esteFondeo = esteFondeo.fondeo[0];
    console.log(esteFondeo);

    // Cálculo de F_viento
    F_viento = 1 / 2 * parseFloat(esteFondeo.Cw_aerodinamico) * parseFloat(esteFondeo.area_total_viva) * datos.densidad_aire * datos.velocidad_viento ** 2;
    console.log("F_viento", F_viento);

    // Cálculo de F_drag
    F_drag = 1 / 2 * parseFloat(esteFondeo.Cd_aerodinamico) * parseFloat(esteFondeo.area_total_muerta) * datos.densidad_agua * datos.velocidad_agua ** 2;
    console.log("F_agua", F_drag);

    // Cálculo de Tho (fuerzas combinadas)
    Tho = F_viento + F_drag;

    // Cálculo de pgH y pgL
    let pegeH = pgH(esteFondeo.diametro_cadena, parseFloat(esteFondeo.calado), oleaje[esteFondeo.ubicacion]);
    let pegeL = pgL(esteFondeo.diametro_cadena, parseFloat(esteFondeo.longitud_cadena));

    console.log("pgH", pegeH);
    console.log("pgL", pegeL);

    // Resistencia de la cadena (Rc)
    let resistencia_cadena_Rc_intermedio = 5 * (Tho + pegeH);

    // Profundidad mínima por oleaje
    let Hminima = esteFondeo.calado - 0.1; 

    // Cálculo del radio de Borneo
    let radio_borneo_intermedio = esteFondeo.longitud_cadena - Math.sqrt(
        Hminima * (Hminima + 2 * Tho / peso_sumergido_por_metro(esteFondeo.diametro_cadena) / 9.81) +
        Tho / peso_sumergido_por_metro(esteFondeo.diametro_cadena) / 9.81 / Math.cosh(
            Hminima * peso_sumergido_por_metro(esteFondeo.diametro_cadena) * 9.81 / Tho + 1
        )
    );

    // Mostrar los resultados en la consola
    console.log("Rc(N):", resistencia_cadena_Rc_intermedio.toFixed(2), "N");
    console.log("RadioBorneo:", radio_borneo_intermedio.toFixed(2), "m");

    // Actualizar el contenido del HTML con los resultados
    document.getElementById("calculos").innerHTML =
        "Resistencia de cadena: " + resistencia_cadena_Rc_intermedio.toFixed(2) + " Newtons.<br>" +
        "Radio de Borneo: " + radio_borneo_intermedio.toFixed(2) + " m";
});