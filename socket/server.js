const io = require('socket.io')();
var SerialPort = require('serialport');
var xbee_api = require('xbee-api');
var C = xbee_api.constants;
const request = require('request');

var xbeeAPI = new xbee_api.XBeeAPI({
  api_mode: 2
});

let serialport = new SerialPort("COM3", {
  baudRate: 9600,
}, function (err) {
  if (err) {
    return console.log('Error: ', err.message)
  }
});

serialport.pipe(xbeeAPI.parser);
xbeeAPI.builder.pipe(serialport);

serialport.on("open", function () {
  var frame_obj = { // AT Request to be sent
    type: C.FRAME_TYPE.AT_COMMAND,
    command: "NI", //Mac address source low  or d0 (for entry button)  or d1 (for exit button)
    commandParameter: [],
  };

  xbeeAPI.builder.write(frame_obj);

  frame_obj = { // AT Request to be sent
    type: C.FRAME_TYPE.REMOTE_AT_COMMAND_REQUEST,
    destination64: "FFFFFFFFFFFFFFFF",
    command: "NI",//SH(source high) or d0 (for entry button)  or d1 (for exit button)
    commandParameter: [],
  };
  xbeeAPI.builder.write(frame_obj);

});

//declaration variable globale
var personneID = 0;
var salleId = -1;

//autorisation certificat
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'



// All frames parsed by the XBee will be emitted here
xbeeAPI.parser.on("data", function (frame) {
  //on packet received, dispatch event
  //let dataReceived = String.fromCharCode.apply(null, frame.data);
  if (C.FRAME_TYPE.ZIGBEE_RECEIVE_PACKET === frame.type) {
    console.log("C.FRAME_TYPE.ZIGBEE_RECEIVE_PACKET");
    let dataReceived = String.fromCharCode.apply(null, frame.data);
    console.log(">> ZIGBEE_RECEIVE_PACKET >", dataReceived);

    browserClient && browserClient.emit('pad-event', {
      device: frame.remote64,
      data: dataReceived
    });
  }

  if (C.FRAME_TYPE.NODE_IDENTIFICATION === frame.type) {
    // let dataReceived = String.fromCharCode.apply(null, frame.nodeIdentifier);
    // console.log(">> ZIGBEE_RECEIVE_PACKET >", frame);


  } else if (C.FRAME_TYPE.ZIGBEE_IO_DATA_SAMPLE_RX === frame.type) {
    var macaddress = Object.values(frame)[1];
    var d0 = Object.values(Object.values(frame)[4])[0]; // entry => if value = 0
    var d1 = Object.values(Object.values(frame)[4])[1]; // exit => if value = 0
    var entry = false;
    var Time = new Date();

    if(d0 == 0) {
      entry = true;
      personneID == 4 ? personneID : personneID++;

      // get salleID with device mac address
      salleId = getSalleId(macaddress, entry);
      //console.log(salleId);
      if(salleId == -1)
        return console.log("Aucune salle trouvé");
      else{
        // inscription de l'heure d'entrée ou de sortie
        if(personneID <= 4){
          // update de le salle de la personne qui est entré
          updatePersonne(personneID, salleId);
          // heure d'entrée
          registerEntryTime(Time, personneID);
        }
      }
    }
    else if(d1 == 0){
      entry=false;
      personneID == 0 ? personneID : personneID--;

      // get salleID with device mac address
      salleId = getSalleId(macaddress, entry);

      if(salleId == -1)
        return console.log("Aucune salle trouvé");
      else{
        // inscription de l'heure de sortie
        if (personneID > 0){
          // update de le salle de la personne qui est sortie
          updatePersonneExit(personneID);
          // inscription de l'heure de sortie
          registerExitTime(Time, personneID);
        }
      }
    }
  } else if (C.FRAME_TYPE.REMOTE_COMMAND_RESPONSE === frame.type) {

  } else {
    console.debug(frame);
    let dataReceived = String.fromCharCode.apply(null, frame.commandData)
    console.log(dataReceived);
  }

});

let browserClient;

io.on('connection', (client) => {
  console.log(client.client.id);
  browserClient = client;

  client.on('subscribeToPad', (interval) => {
    console.log('client is subscribing to timer with interval ', interval);
  });

  client.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const port = 8000;
io.listen(port);
console.log('listening on port ', port);

function getSalleId(macaddress, entry) {
  var parameters = 'macAddress=' + macaddress + '&onEntryDoor=' + entry;
  apiRequests('get','devices',parameters,null, function (data){
    var device = data;
    var salle = Object.values(data)[3];
    //console.log(salle.id);
    return salle.id; // salleID
  });
}

function updatePersonne(personneID, salleId) {
  var body = "{\n" +
    "  \"salle\": \"/salles/" + salleId + "\"\n" +
    "}";
  apiRequests('patch','personnes',personneID,body);
}

function updatePersonneExit(personneID){
  var body = "{\n" +
    "  \"salle\": \"\"\n" +
    "}";
  apiRequests('patch','personnes',personneID,body);
}

function registerEntryTime(Time, personneID) {
  var body = "{\n" +
    "  \"salle\": \"/salles/" + salleId + "\",\n" +
    "  \"personne\": \"/personnes/" + personneID + "\",\n" +
    "  \"heureEntry\": " + Time + "\n" +
    "}";
  apiRequests('post','histories',null, body);
}

function registerExitTime(Time, personneID) {
  var body = "{\n" +
    "  \"salle\": \"/salles/" + salleId + "\",\n" +
    "  \"personne\": \"/personnes/" + personneID + "\",\n" +
    "  \"heureExit\": " + Time + "\n" +
    "}";
  apiRequests('post','histories',null, body);
}

function apiRequests(method, entity, parameters, bodyInfo, callback){
  if(parameters === undefined || parameters == null){
    if(method == 'post'){
      request.post('https://localhost:8443/' + entity +'', {json: true}, (err, res, body) => {
        if (err) {
          return console.log(err);
        }
        body = bodyInfo;
      });
    }else if(method == 'get'){
      request.get('https://localhost:8443/' + entity + '', {json: true}, (err, res, body) => {
        if (err) {
          return console.log(err);
        }
        callback(Object.values(body)[0]);
      });
    }else if(method == 'patch'){
      request.patch('https://localhost:8443/' + entity +'', {json: true}, (err, res, body) => {
        if (err) {
          return console.log(err);
        }
        body = bodyInfo;
      });
    }
  }
  else
  {
    if(method == 'get'){
      request.get('https://localhost:8443/' + entity + '?' + parameters + '', {json: true}, (err, res, body) => {
        if (err) {
          return console.log(err);
        }
        callback(Object.values(body)[0]);
      });
    }else if(method == 'patch'){
      request.patch('https://localhost:8443/' + entity + '/' + parameters + '', {json: true}, (err, res, body) => {
        if (err) {
          return console.log(err);
        }
        body = bodyInfo;
      });
    }
  }
}
