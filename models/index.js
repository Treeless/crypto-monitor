(function() {
  //This requires all the models and returns the model objects for the requiring file
  //

  var models = {};
  require("fs").readdirSync(__dirname).forEach(function(file) {
    var exports = require("./" + file);
    let modelName = Object.keys(exports)[0]
    models[modelName] = exports[modelName];
  });

  module.exports = models;
}());
