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

// All frames parsed by the XBee will be emitted here
var counter = 0;
var salleId = -1;
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'
xbeeAPI.parser.on("data", function (frame) {
  //on new device is joined, register it

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
      counter == 4 ? counter : counter++;
    }
    else if(d1 == 0){
      entry=false;
      counter == 0 ? counter : counter--;
    }
    //certificate
    // get salleID with device mac address
    request.get('https://localhost:8443/devices?macAddress='+macaddress+'&onEntryDoor='+entry+'', { json: true }, (err, res, body) => {
      if (err) {
        return console.log(err);
      }
      var devices = body;
      var device = Object.values(devices)[0];
      var salle = Object.values(device)[3];
      salleId = Object.values(salle)[0];
    });
    if(salleId == -1)
      return console.log("Aucune salle trouvé");
    else{
      // inscription de l'heure d'entrée ou de sortie
      if(entry && counter < 4){
        // update de le salle de la personne qui est entré
        request.patch('https://localhost:8443/personnes/'+counter+'', { json: true }, (err, res, body) => {
          if (err) {
            return console.log(err);
          }
          body = "{\n" +
            "  \"salle\": \"/salles/" + salleId + "\",\n" +
            "}";
          console.log(counter);
        });
        // heure d'entrée
        request.post('https://localhost:8443/histories', { json: true }, (err, res, body) => {
          if (err) {
            return console.log(err);
          }
          body = "{\n" +
            "  \"salle\": \"/salles/" + salleId + "\",\n" +
            "  \"personne\": \"/personnes/" + counter + "\",\n"+
            "  \"heureEntry\": " + Time + "\n"+
            "  \"heureExit\": \"\"\n" +
            "}";
        });
      }else if (!entry && counter > 0){
        // update de le salle de la personne qui est sortie
        request.patch('https://localhost:8443/personnes/'+counter+'', { json: true }, (err, res, body) => {
          if (err) {
            return console.log(err);
          }
          body = "{\n" +
            "  \"salle\": \"/salles/"+salleId+"\",\n" +
            "}";
          console.log(counter);
        });
        // inscription de l'heure de sortie
        request.post('https://localhost:8443/histories', { json: true }, (err, res, body) => {
          if (err) {
            return console.log(err);
          }
          body = "{\n" +
            "  \"salle\": \"/salles/"+salleId+"\",\n" +
            "  \"personne\": \"/personnes/" + counter + "\",\n" +
            "  \"heureEntry\": \"\"\n" +
            "  \"heureExit\": " + Time + "\n" +
            "}";
        });
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
    // setInterval(() => {
    //   client.emit('pad-event', {
    //     device: "test device",
    //     data: Math.round(Math.random()) * 2 - 1
    //   })
    //   ;
    // }, Math.random() * 1000);
  });

  client.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const port = 8000;
io.listen(port);
console.log('listening on port ', port);
//certificate
//process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'
// get salleID with device mac address
//request.get('https://localhost:8443/salles', { json: true }, (err, res, body) => {
  //if (err) { return console.log(err); }
  //var salles = body;
  //console.log(salles[0]);
  //console.log(Object.keys(salles[0])[1] + ":" + Object.values(salles[0])[1]);
  //console.log(body.explanation);
//});
//var salleID;
// post person with salleID



//
// serial_xbee.on("data", function(data) {
//     console.log(data.type);
//   // console.log('xbee data received:', data.type);
//   // client.emit('timer', "pouet");
// //
// });

// shepherd.on('ready', function () {
//   console.log('Server is ready.');
//
//   // allow devices to join the network within 60 secs
//   shepherd.permitJoin(60, function (err) {
//     if (err)
//       console.log(err);
//   });
// });
//
// shepherd.start(function (err) {                // start the server
//   if (err)
//     console.log(err);
// });
