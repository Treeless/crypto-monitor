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


  //Historical price (start and end need to be a unix timestamp)
  var getHistoricalPrice = function(start, end) {
    return new Promise(function(resolve, reject) {
      var spawn = require("child_process").spawn;
      var pythonProcess = spawn('python', [Config.smsa_repo + "/interfaces/prices.py", "historical", start, end]);

      pythonProcess.stdout.on('data', function(data) {

        // On output (our data)
        data = JSON.parse(data.toString('utf-8'));
        resolve(data)
      });

      pythonProcess.stderr.on('data', function(data) {
        console.log(data.toString('utf-8'));
      });
    });
  }

  //period = "hourly" OR "daily"
  //data is information straight from SMSA and coinmarketcap
  var formatDataForChart = function(period, data) {
    /*
    DAILY:
    Format of data before formatting
      {'2018-03-02':
       { crypto: 'BTC',
         timestamp: 1519966800,
         close: 11086.4,
         high: 11189,
         low: 10850.1,
         open: 10977.4,
         usd_market_cap: 185456000000,
         usd_volume: 7620590000 }
         ,}
    */
    var formatted = [];
    if (period == "hourly") {
      for (var i = 0; i < data.length; i++) {
        formatted.push([moment(data[i].date).valueOf(), parseFloat(data[i].price)]);
      }
    } else if (period == "daily") {
      var dateKeys = Object.keys(data);
      for (var i = 0; i < dateKeys.length; i++) {
        var date = dateKeys[i];
        var timestamp = moment(data[date].timestamp * 1000).valueOf();
        var price = data[date].close;
        formatted.push([timestamp, price]);
      }
    } else {
      console.log("Period needs to be hourly or daily");
    }
    return formatted
  }

  //Returns the prediction data in the chartable format
  var formatPredictionDataForChart = function(data) {
    var formatted = [];
    for(var i=0; i< data.length; i++){
      formatted.push([moment(data[i].date).valueOf(), parseFloat(data[i].price)]);
    }
    return formatted;
  }

  //Main homepage view route
  app.get('/', function(req, res) {

    //The last predictions for each hourly, daily
    // TODO, pull this data from mongodb if its being put in there

    //hourly [2 prediction types] - prediction with sentiment, and prediction without
    var predictions = {
      "hourly": {
        "priceOnly": [{
          price: 11000, //Price prediction
          percentage: 13, //Percentage change based on previous hour
          date: moment().add(3, "hour").valueOf() //timestamp of when the prediction is for
        },
        {
          price: 12000,
          percentage: 17,
          date: moment().add(2, "hour").valueOf()
        },
        {
          price: 10200,
          percentage: 17,
          date: moment().add(1, "hour").valueOf()
        }],
        "priceAndSentiment": [{
          price: 12000,
          percentage: 17,
          date: moment().add(3, "hour").valueOf()
        },
        {
          price: 11522,
          percentage: 17,
          date: moment().add(2, "hour").valueOf()
        },
        {
          price: 10501,
          percentage: 17,
          date: moment().add(1, "hour").valueOf()
        }]
      },
      "daily": {
        "priceOnly": [{
          price: 11500,
          percentage: 17,
          date: moment().add(3, "day").valueOf()
        }, {
          price: 9004,
          percentage: 17,
          date: moment().add(2, "day").valueOf()
        }, {
          price: 12100,
          percentage: 17,
          date: moment().add(1, "day").valueOf()
        }],
        priceAndSentiment: [{
            price: 12500,
            percentage: 17,
            date: moment().add(3, "day").valueOf()
          },
          {
            price: 11224,
            percentage: 19,
            date: moment().add(2, "day").valueOf()
          },
          {
            price: 10124,
            percentage: 10,
            date: moment().add(1, "day").valueOf()
          }
        ]
      }
    };

    //PLEASE NOTE:
    //Temporarily predictions are gonna be some random data (THIS NEEDS TO LATER COME FROM MONGODB)

    //The hourly data
    var hourlyPriceChartData = [];

    //Display last 48 hours for hourly
    var today = moment().toDate()
    var fortyEightHoursAgo = moment().subtract(48, "hour").toDate()
    Mongoose.connection.db.collection('live_tweets_sent').find({
      $and: [{
        "date": { "$lte": today }
      }, {
        "date": { $gte: fortyEightHoursAgo }
      }]
    }).toArray(function(err, hourlyPriceData) {

      hourlyPriceData = formatDataForChart("hourly", hourlyPriceData);

      //Pull from predictions data and format for use in charts
      var hourlyPricePredictionViaPrices = formatPredictionDataForChart(predictions.hourly.priceOnly);
      var hourlyPricePredictionViaSentimentAndPrice = formatPredictionDataForChart(predictions.hourly.priceAndSentiment); // This data will be takcked onto the hourlyPriceChartData for 'hourly price AND sentiment chart'

      //Display last 30 days for Daily
      var thirtyDaysAgo = moment().subtract(30, "day").unix(); //FOR PYTHON
      getHistoricalPrice(thirtyDaysAgo, moment(today).unix()).then(function(priceData) {
        // Format the data we get into daily close data segments : [[timestamp, price], ...]
        var dailyPriceChartData = formatDataForChart("daily", priceData);


        //Pull from predictions data and format for use in charts
        var dailyPricePredictionViaPrices = formatPredictionDataForChart(predictions.daily.priceOnly);
        var dailyPricePredictionViaSentimentAndPrice = formatPredictionDataForChart(predictions.daily.priceAndSentiment);

        //Note: HourlyPriceData is the bitcoin prices per hour for 48 hour period. The predictions are charted independently on the same graph
        res.render("index.ejs", {
          chartData: {
            hourlyPriceData: hourlyPriceData,
            hourlyPredictionPriceOnly: hourlyPricePredictionViaPrices,
            hourlyPredictionPriceAndSentiment: dailyPricePredictionViaSentimentAndPrice,
            dailyPriceData: dailyPriceChartData,
            dailyPredictionPriceOnly: dailyPricePredictionViaPrices,
            dailyPredictionPriceAndSentiment: dailyPricePredictionViaSentimentAndPrice
          },
          predictions: predictions,
          nextDayPrediction: predictions.daily.priceOnly[predictions.daily.priceOnly.length - 1], //Last prediction we made for daily
          nextHourPrediction: predictions.hourly.priceOnly[predictions.hourly.priceOnly.length - 1], //Last prediction we made for hourly
          moment: moment
        });
      });
    });
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
  });

  app.listen('80', function() {
    console.log(Chalk.yellow("App listening on port: 80"));
  });


}());