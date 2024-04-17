module.exports = () => {
  global.domain.workerMongo.init();
  global.domain.workerMsgSender.init();

  global.domain.workerFriendtrolGateway.init();
  // global.domain.workerIOTRouter.init();
  // global.domain.workerDemographic.init();
};
