const dgram = require("dgram");

module.exports = () => {
  function create() {
    const client = dgram.createSocket("udp4");
    client.on("connect", () => {
      client.setSendBufferSize(65535)
    })
    return client;
  }

  return {
    create,
  };
};
