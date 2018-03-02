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
    csv = require('csv-parser'),
    lodash = require('lodash');

  let app = new Express();

  app.use(Express.static(__dirname + '/public')); //Allow loading of js, css files
  app.use(Express.static(__dirname + "/data")); //some stuff 
  app.use(BodyParser.urlencoded({ extended: true })); //JSON middleman
  app.set('view engine', 'ejs'); //Set the view engine
  app.set('views', __dirname + '/views'); //set views folder

  //Main homepage view route
  app.get('/', function(req, res) {
    var dates = JSON.parse(fs.readFileSync(__dirname + "/data/dates.json"));

    Mongoose.connection.db.collection('influencers').find({
      "tweets": {
        $elemMatch: { "$and": [{ "dateRaw": { "$gte": new Date(dates.start) } }, { "dateRaw": { "$lte": new Date(dates.end) } }] }
      }
    }).sort({ followers: -1 }).limit(10).toArray(function(err, influencers) {
      if (err) {
        console.log(err);
        return res.send("MONGODB ERROR. AAAAAAAAHHHH..." + err)
      }
      var topTweets = [];
      for (var i = 0; i < influencers.length; i++) {
        var influencer = influencers[i];
        topTweets.push(Object.assign({ accountName: influencer.accountName }, influencer.tweets[0]));
      }

      console.log("HOMEPAGE");
      res.render("index.ejs", {
        title: "MAIN PAGE",
        influencers: influencers,
        topTweets: topTweets
      });
    })
  });

  app.get("/current-bitcoin-price", function(req, res) {
    var spawn = require("child_process").spawn;
    var pythonProcess = spawn('python', [Config.smsa_repo + "/interfaces/prices.py", "now"]);

    pythonProcess.stdout.on('data', function(data) {

      // On output (our data)
      data = JSON.parse(data.toString('utf-8'));
      res.json(data);
    });

    pythonProcess.stderr.on('data', function(data) {
      console.log(data.toString('utf-8'));
    });
  })

  app.listen('80', function() {
    console.log(Chalk.yellow("App listening on port: 80"));

    //Get the CSV from the SMSA repo
    console.log("GET CSV from Smsa repo..")
    var row = [];
    var dates = [];
    fs.createReadStream(Config.smsa_repo + "/data/tweets.csv")
      .pipe(csv())
      .on('data', function(data) {
        var dateArr = data.date.split(" ");
        dates.push(moment(dateArr[0]).set('hour', dateArr[1]));
        row.push(data);

      })
      .on('end', function() {

        var prices = [];
        var foo = lodash.map(row, 'price');
        for (var i = 0; i < foo.length; i++) {
          prices.push([moment(dates[i]).valueOf(), parseFloat(foo[i])])
        }

        //consolidate each piece of JSON
        var pch1hr = [];
        var foo = lodash.map(row, 'percent_change_1h');
        for (var i = 0; i < foo.length; i++) {
          pch1hr.push([moment(dates[i]).valueOf(), parseFloat(foo[i])])
        }

        var pch24hr = [];
        foo = lodash.map(row, 'percent_change_24h');
        for (i = 0; i < foo.length; i++) {
          pch24hr.push([moment(dates[i]).valueOf(), parseFloat(foo[i])])
        }

        var pch7d = [];
        foo = lodash.map(row, 'percent_change_7d');
        for (i = 0; i < foo.length; i++) {
          pch7d.push([moment(dates[i]).valueOf(), parseFloat(foo[i])])
        }

        var tbpol = [];
        foo = lodash.map(row, 'tb_polarity');
        for (i = 0; i < foo.length; i++) {
          tbpol.push([moment(dates[i]).valueOf(), parseFloat(foo[i])])
        }

        var vader = [];
        foo = lodash.map(row, 'vader_polarity');
        for (i = 0; i < foo.length; i++) {
          vader.push([moment(dates[i]).valueOf(), parseFloat(foo[i])])
        }

        fs.writeFileSync(__dirname + "/data/charts.json", JSON.stringify({ prices: prices, pch1hr: pch1hr, pch24hr: pch24hr, pch7d: pch7d, tbpol: tbpol, vader: vader }));

        // Get dates for front end to focus on
        dates.sort(function(left, right) {
          return moment.utc(left.timeStamp).diff(moment.utc(right.timeStamp))
        });
        fs.writeFileSync(__dirname + "/data/dates.json", JSON.stringify({ start: moment(dates[0]).format("YYYY-MM-DD"), end: moment(dates[dates.length - 1]).format("YYYY-MM-DD") }));
      });
  });


}());