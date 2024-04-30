module.exports = () => {
  let expressClient = null;
  let expressHost = process.env.AIRA_CONNECT_HOST;
  let expressPort = parseInt(process.env.AIRA_CONNECT_PORT);

  let metaClient = null;
  let metaHost = process.env.AIRA_META_PROCESSOR_HOST;
  let metaPort = parseInt(process.env.AIRA_META_PROCESSOR_PORT);

  let eventClient = null;
  let eventHost = process.env.AIRA_EVENT_DISPATCHER_HOST;
  let eventPort = parseInt(process.env.AIRA_EVENT_DISPATCHER_PORT);

  function init() {
    console.log(`worker-msgsender init start`);
    expressClient = global.spiderman.udp.create();
    metaClient = global.spiderman.udp.create();
    eventClient = global.spiderman.udp.create();
    console.log(`worker-msgsender init end`);
  }

  function send(data) {
    expressClient.send(
      data,
      0,
      data.length,
      expressPort,
      expressHost,
      (err, bytes) => {
        console.log(
          `worker-msgsender to ${expressHost} ${expressPort}`,
          err,
          bytes,
        );
      },
    );

    metaClient.send(data, 0, data.length, metaPort, metaHost, (err, bytes) => {
      console.log(`worker-msgsender to ${metaHost} ${metaPort}`, err, bytes);
    });

    eventClient.send(
      data,
      0,
      data.length,
      eventPort,
      eventHost,
      (err, bytes) => {
        console.log(
          `worker-msgsender to ${eventHost} ${eventPort}`,
          err,
          bytes,
        );
      },
    );
  }

  return {
    init,
    send,
  };
};
