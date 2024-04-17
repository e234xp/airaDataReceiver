const { uuid: uuidv4 } = require("uuidv4");
// const DB_FOLDER = `${global.params.dataPath}/db`;
// const QUEUE_FOLDER = `${DB_FOLDER}/runtimequeue/`;
// const fs = require('fs');

module.exports = () => {
  const { db } = global.spiderman;

  let processInterval = 500;
  let maxQueSize = 200;
  let toRowDataQue = [];

  let allAirs = [];
  let allEles = [];
  let allEnvs = [];
  let allMacs = [];
  let gateSignals = [];

  function init(processInterval = 500, maxQueSize = 200) {
    processInterval = processInterval ? processInterval : 500;
    maxQueSize = maxQueSize ? maxQueSize : 200;

    toRowDataQue = [];
  }

  function pushTask(data) {
    if (toRowDataQue.length >= maxQueSize) return null;

    const procUuid = uuidv4();
    data.proc_uuid = procUuid;
    toRowDataQue.push(data);

    return procUuid;
  }

  async function updateSetting() {
    function updateDevice(collection, devices) {
      let _diff = db[collection].find();
      if (_diff && _diff.length >= 1) {
        //  add/mod
        for (let i = 0; i < _diff.length; i++) {
          // let found = devices.findIndex(o => o.uuid === _diff[i].uuid && o.updated_time !== _diff[i].updated_time);
          let found = devices.findIndex((o) => o.uuid === _diff[i].uuid);
          if (found >= 0) {
            devices[found] = _diff[i];
          } else {
            devices.push(_diff[i]);
          }
        }

        // //  del
        // for (let i = devices.length - 1; i >= 0; i--) {
        //     if (_diff.findIndex(o => o.uuid === devices[i].uuid) < 0)
        //         devices.splice(i, 1);
        // }
      }
    }

    // 1.0 update db from deivce setting
    updateDevice("devicesair", allAirs);
    updateDevice("devicesele", allEles);
    updateDevice("devicesenv", allEnvs);
    updateDevice("devicesmac", allMacs);

    // 2.0 update gate device setting
    if (allAirs.length >= 1) {
      allAirs.forEach((it) => {
        let found = gateSignals.find((o) => o.gateId === it.gateId);

        if (!found) {
          found = { gateId: it.gateId, signal: it.signal };
          gateSignals.push(found);
        }
        found.signal = [...found.signal, ...it.signal];
      });
    }

    if (allEles.length >= 1) {
      allEles.forEach((it) => {
        let found = gateSignals.find((o) => o.gateId === it.gateId);

        if (!found) {
          found = { gateId: it.gateId, signal: it.signal };
          gateSignals.push(found);
        }
        found.signal = [...found.signal, ...it.signal];
      });
    }

    if (allEnvs.length >= 1) {
      allEnvs.forEach((it) => {
        let found = gateSignals.find((o) => o.gateId === it.gateId);

        if (!found) {
          found = { gateId: it.gateId, signal: it.signal };
          gateSignals.push(found);
        }
        found.signal = [...found.signal, ...it.signal];
      });
    }

    if (allMacs.length >= 1) {
      allMacs.forEach((it) => {
        let found = gateSignals.find((o) => o.gateId === it.gateId);

        if (!found) {
          found = { gateId: it.gateId, signal: it.signal };
          gateSignals.push(found);
        }
        found.signal = [...found.signal, ...it.signal];
      });
    }
  }

  async function processRule1Loop() {
    while (true) {
      while (toRowDataQue.length > 0) {
        let reqData = toRowDataQue.shift();
        let now = Date.now();
        let retData = null;
        try {
        } catch (e) {
          continue;
        }
      }
      await delay(processInterval);
    }
  }

  return {
    init,
    pushTask,
  };
};
