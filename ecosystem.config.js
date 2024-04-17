const airaDataReceiver = {
  name: "airaDataReceiver",
  script: "./src/main.js",
  ignore_watch : ["node_modules", "src/data"],
}

module.exports = { apps: [airaDataReceiver] }