const { format } = require('timeago.js');
const helpers = {};

helpers.timeago = (fecha) => {
  var timestamp = new Date(fecha);
  return format(timestamp);
}

helpers.formatearSp = (fecha) => {
    var timestamp = new Date(fecha);
    mnth = ("0" + (timestamp.getMonth() + 1)).slice(-2),
      day = ("0" + timestamp.getDate()).slice(-2);
    return [day, mnth, timestamp.getFullYear()].join("/");
  }
  
  //Este es el formateo necesario para encajar una fecha en un input de type="date"
  helpers.formatearEn = (fecha) => {
    var timestamp = new Date(fecha);
    mnth = ("0" + (timestamp.getMonth() + 1)).slice(-2),
      day = ("0" + timestamp.getDate()).slice(-2);
    return [timestamp.getFullYear(), mnth, day].join("-");
  }
  

module.exports=helpers;