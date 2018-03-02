// Backend server

(function() {
  // 
  const Express = require('express'),
    Chalk = require('chalk'),
    BodyParser = require('body-parser'),
    Mongoose = require('./mongo.connect.js'),
    Models = require('./models'),
    Config = require('./config'),
    PriceManager = require('./lib/price_manager.lib.js'),
    moment = require('moment'),
    fs = require('fs'),
    csv = require('csv-parser');

  let app = new Express();

  app.use(Express.static(__dirname + '/public')); //Allow loading of js, css files
  app.use(Express.static(__dirname + "/data")); //some stuff 
  app.use(BodyParser.urlencoded({ extended: true })); //JSON middleman
  app.set('view engine', 'ejs'); //Set the view engine
  app.set('views', __dirname + '/views'); //set views folder

  //Main homepage view route
  app.get('/', function(req, res) {
    console.log("HOMEPAGE");
    res.render("index.ejs", {
      title: "MAIN PAGE"
    });
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

    //Get the CSV from the SMSA repo
    console.log("GET CSV from Smsa repo..")
    var dates = [];
    fs.createReadStream(Config.smsa_repo + "/data/tweets.csv")
      .pipe(csv())
      .on('data', function(data) {

        dates.push(new Date(data.date.split(" ")[0]));
      })
      .on('end', function() {
        console.log("DONE");
        dates.sort(function(left, right) {
          return moment.utc(left.timeStamp).diff(moment.utc(right.timeStamp))
        });

        fs.writeFileSync(__dirname+"/data/dates.json",  JSON.stringify({start:moment(dates[0]).format("YYYY-MM-DD"), end: moment(dates[dates.length-1]).format("YYYY-MM-DD") }));
      });

  });


}());