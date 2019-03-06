const moment = require('moment');

var resetDatabase = async () => {
  var models = require('./../../models');
  await models.sequelize.sync({ force: true, logging: false });

}

module.exports = { resetDatabase }