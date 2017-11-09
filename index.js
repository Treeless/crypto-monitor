(function() {
  const Express = require('express'),
    Chalk = require('chalk'),
    BodyParser = require('body-parser'),
    Mongoose = require('./mongo.connect.js'),
    Models = require('./models'),
    Config = require('./config'),
    PriceManager = require('./lib/price_manager.lib.js'),
    moment = require('moment');

  let app = new Express();

  app.use(Express.static(__dirname + '/public')); //Allow loading of js, css files
  app.use(BodyParser.urlencoded({ extended: true })); //JSON middleman
  app.set('view engine', 'ejs'); //Set the view engine
  app.set('views', __dirname + '/views'); //set views folder

  //Main homepage view route
  app.get('/', function(req, res) {
    res.render("index.ejs", {});
  });

  //API route for retrieving the bitcoin price
  app.get('/btc/price-history', function(req, res) {
    var manager = new PriceManager().bitcoinHistoricalBulkRetrieval()
      .then(function(result) {
        var json = JSON.parse(result);
        //Format time...
        var keys = Object.keys(json.bpi); //all the dates
        var formatted = []; //where the formatted data will be placed in
        for (var i = 0; i < keys.length; i++) {
          var date = keys[i];
          var price = json.bpi[date];

          //Format the date to unix timestamp
          var ts = moment(date).valueOf();
          formatted.push([ts, price]);
        }

        res.json({ data: formatted });
      }, function(err) {
        res.json({ error: err });
      });
  });

  app.listen('80', function() {
    console.log(Chalk.yellow("App listening on port: 80"));
  });


}());