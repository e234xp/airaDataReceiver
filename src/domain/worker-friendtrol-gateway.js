module.exports = () => {
  const { db } = global.spiderman;
  const randomBytes = require('randombytes')

  let allGates = [];

  function init() {
    allGates.forEach(({ gate }) => {
      // gate.client.end();
    });
    allGates = [];

    allGates = db.devicesgate.find();

    setTimeout(() => {
      connectDevices();
    }, 1000);
  }

  function connectDevices() {
    allGates.forEach((gate) => {
      connect(gate);
    });
  }

  function connect(gate) {
    const { uuid, ip: host, port, user, pass } = gate;

    const server = global.spiderman.mqttclient.connect({
      host,
      port,
      user,
      pass,
      onConnect: (client, connack) => {
        if (connack) {
          const device = {
            ...gate,
            client,
          };

          allGates.push(device);

          // if (Array.isArray(gate.subscribe)) {
          //     gate.subscribe.forEach(sub => {
          //         console.log('mqtt workder onConnect subscribe topic 1', sub);
          //         server.subscribe(sub);
          //     });
          // } else {
          //     console.log('mqtt workder onConnect subscribe topic 2', gate.subscribe);
          //     server.subscribe(gate.subscribe);
          // }
          console.log("mqtt workder onConnect subscribe topic 2", "#");
          server.subscribe("#");
        }
      },
      onData: (client, topic, content) => {
        console.log("mqtt workder onData", topic);

        let message = content.toString();
        let time = new Date().valueOf();

        // check json format
        try {
          let obj = JSON.parse(message);
          delete obj["Time"];
          delete obj["time"];

          if (topic === "GW-001/RM16-001") {
            const bits = randomBytes(1).at(0)
            for (let index = 1; index < 8; index++) {
              obj[`DI${index * 2}`] = bits & (1 << index) ? 1 : 0
              obj[`DI${index * 2 + 1}`] = 1 - obj[`DI${index * 2}`]
            }
          }

          message = JSON.stringify(obj);
        } catch (ex) {
          console.log(`Workers callback`, `${ex.message}`);
        }

        global.domain.workerMongo.insertOne(
          "DeviceRow",
          {
            gateId: gate.uuid,
            topic,
            time,
            datetime: new Date(time).toLocaleString(),
            message: JSON.parse(message),
          },
          (err, data) => {
            if (data) {
              data.forEach((record) => {
                global.domain.workerMsgSender.send(JSON.stringify(record)); // to Express and MetaProcess

                // global.spiderman.socket.broadcastMessage({
                //     socketServer: global.spiderman.server.wsDeviceStatus,
                //     message: JSON.stringify(record)
                // });
              });
            }
          },
        );
      },
      onClose: (client) => {
        console.log("mqtt workder onClose");
      },
      onError: (client, err) => {
        console.log("mqtt workder onError", err);
      },
    });
  }

  return {
    init,
    // triggerByResult,
  };
};
