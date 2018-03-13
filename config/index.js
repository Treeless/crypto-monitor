(function() {
  //Merges some environment specific config values with the universal config values [API KEYS ETC] 

  var Config = require('./config.json')
  var where = process.env.NODE_ENV || 'development'
  var config = Object.assign(Config[where], Config['all']);

  module.exports = config;
}());
