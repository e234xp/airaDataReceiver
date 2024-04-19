const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = () => {
  // let allDevices = [];
  let sendTimer = null;

  let sendCmd = '';
  let respCmd = '';

  let cmds = [
    "0103000B0001F5C8",
    "0103000E0001E5C9",
    "0203000D000115FA",
    "0103000C00014409"
  ];

  let result = {O2: 0, CO: 0, CH4: 0, H2S: 0} ;

  let client = null;

  function init() {
    global.spiderman.systemlog.writeInfo('domain worker-iotrouter-tcp init');

    // allDevices.forEach(({ conn }) => {
    //   conn.end();
    // });
    // allDevices = [];

    setTimeout(() => {
      connectDevices();

      sendRequestCmd();
    }, 1000);
  }

  function connectDevices() {
    const devices = [
      {
        host: "192.168.10.154",
        port: 8086
      }
    ];

    devices.forEach((dev) => {
      connect(dev);
    });
  }

  function connect(dev) {
    const { host, port } = dev;

    client = global.spiderman.tcpclient.connect({
      host,
      port,
      onReadly: (server) => {
        console.log("worker-iotrouter onReadly");

      },
      onConnect: (server) => {
        console.log("worker-iotrouter onConnect");

        // const device = {
        //   ...dev,
        //   server,
        // };

        // allDevices.push(device);
      },
      onData: (socket, data) => {
        // console.log("worker-iotrouter onData", socket);


        let ipAddress = socket.remoteAddress;
        ipAddress = ipAddress.replace('::ffff:', '');
        // console.log("worker-iotrouter onData", ipAddress);
        // console.log("worker-iotrouter onData", data);

        switch(sendCmd ) {
          case "0103000B0001F5C8":
            result["O2"] = (data[3] * 256 + data[4]) / 10;
            console.log("O2", result);

            break ;
          case "0103000E0001E5C9":
            result["CO"] = data[3] * 256 + data[4];
            console.log("CO", result);

            break ;
          case "0203000D000115FA":
            result["CH4"] = data[3] * 256 + data[4];
            console.log("CH4", result);

            break ;            
          case "0103000C00014409" :
            let time = new Date().valueOf();
            
            result["H2S"] = data[3] * 256 + data[4];
            console.log("H2S", result);
            
            global.domain.workerMongo.insertOne(
              'DeviceRow',
              { topic: ipAddress, time, datetime: new Date(time).toLocaleString(), message: result },
              (err, data) => {
                if (data) {
                  data.forEach((record) => {
                    console.log('iotrouter-tcp workder onData', record);
                    global.domain.workerMsgSender.send(JSON.stringify(record)); // to Express and MetaProcess
                    // global.spiderman.socket.broadcastMessage({
                    //   socketServer: global.spiderman.server.wsDeviceStatus,
                    //   message: JSON.stringify(record)
                    // });
                  });
                }
              }
            )

            break;
        }

        respCmd = data ;

      },

      onClose: () => {

      },
      onError: () => {

      }
    });
  }

  async function sendRequestCmd() {
    if (sendTimer) {
      clearTimeout(sendTimer);
      sendTimer = null;
    }

    result = {O2: 0, CO: 0, CH4: 0, H2S: 0} ;

    for (let i = 0; i < cmds.length; i++) {
      sendCmd = cmds[i];
      client.write(Buffer.from(sendCmd, "hex"));

      while (1) {
        if (respCmd != "") {
          // console.log('ccc', sendCmd, respCmd);
          respCmd = '';
          break;
        }
        await delay(1000);
      }
    }

    sendTimer = setTimeout(() => {
      sendRequestCmd();
    }, (10 - (new Date().getSeconds() % 10)) * 1000);
  }

  return {
    init,
    //     trigger,
  };
};
