const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const helpers = {};

helpers.listadoFotos = (req, res, next) => {
    const nif = req;
    var fotitos = [];
    var directorio = path.join(__dirname, "../public/img/imagenes", nif);
    fs.readdir(directorio, (err, files) => {
        if (files) {
            files.forEach(file => {
                fotitos.push(file);
            });
        }
    });
    return fotitos;
}


helpers.encryptPass = async (password) => {
    const sal = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, sal);
    return password;
};

helpers.verifyPassword = async (password, hashedPassword) => {
    try {
        return await bcrypt.compare(password, hashedPassword);
    } catch (e) {
        console.log(e);
    }
}


module.exports = helpers;