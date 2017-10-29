(function() {
  //Merges some environment specific config values with the universal config values [API KEYS ETC] 

  var Config = require('./config.json')
  var config = Object.assign(Config[process.env.NODE_ENV || 'development'], Config['all']);

  module.exports = config;
}());
