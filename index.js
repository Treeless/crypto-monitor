(function() {
  const Express = require('express'),
    Chalk = require('chalk'),
    BodyParser = require('body-parser'),
    Mongoose = require('./mongo.connect.js'),
    Models = require('./models'),
    Config = require('./config');

  let app = new Express();

  app.use(Express.static(__dirname + '/public')); //Allow loading of js, css files
  app.use(BodyParser.urlencoded({ extended: true })); //JSON middleman
  app.set('view engine', 'ejs'); //Set the view engine
  app.set('views', __dirname + '/views'); //set views folder

  //Main homepage view route
  app.get('/', function(req, res) {
    res.render("index.ejs", {});
  });

  app.listen('80', function() {
    console.log(Chalk.yellow("App listening on port: 80"));
  });


}());