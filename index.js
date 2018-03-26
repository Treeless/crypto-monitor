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

  //period = "hourly" OR "daily"
  //data is information straight from SMSA and coinmarketcap
  var formatDataForChart = function(period, data) {
    var formatted = [];
    if (period == "hourly" || period == "daily") {
      for (var i = 0; i < data.length; i++) {
        formatted.push([moment.utc(data[i].date).local().valueOf(), parseFloat(data[i].price)]);
      }
    } else if (period == "sentiment") {
      // We need to create two arrays, each with their own type of sentiment data
      formatted = [
        [],
        [],
        []
      ]
      console.log("sentiment formatting")
      for (var i = 0; i < data.length; i++) {
        var timestamp = moment.utc(data[i].date).local().valueOf()
        formatted[0].push([timestamp, parseFloat(data[i].tb_polarity)]); //TextBlob
        formatted[1].push([timestamp, parseFloat(data[i].vader_polarity)]); //Vader
        formatted[2].push([timestamp, parseFloat(data[i].tweet_count)]); //Number of tweets
      }
    } else {
      console.log("Period needs to be hourly or daily or sentiment");
    }
    return formatted
  }

  //Returns the prediction data in the chartable format
  var formatPredictionDataForChart = function(data) {
    var formatted = [];
    for (var i = 0; i < data.length; i++) {
      formatted.push([moment.utc(data[i].date).local().valueOf(), parseFloat(data[i].price)]);
    }
    return formatted;
  }

  var getSentimentData = function(start, end) {
    return new Promise(function(resolve, reject) {
      Mongoose.connection.db.collection('twitter_sentiment')
        .find({"$and": [{ "date": { "$gte": start } }, { "date": { "$lte": end } }] })
        .toArray(function(err, sentimentData) {
          if (err) {
            reject(err)
          } else {
            resolve(formatDataForChart("sentiment", sentimentData))
          }
        });
    });
  }

  //Historical price (start and end need to be a unix timestamp)
  var getHistoricalPrice = function(start, end, type) {
    return new Promise(function(resolve, reject) {
      Mongoose.connection.db.collection('prices')
        .find({ "type": type, "$and": [{ "date": { "$gte": start } }, { "date": { "$lte": end } }] })
        .toArray(function(err, prices) {
          if (err) {
            reject(err)
          } else {
            resolve(formatDataForChart(type, prices))
          }
        });
    });
  }

  var getCurrentBitcoinPrice = function() {
    return new Promise(function(resolve, reject) {
      var spawn = require("child_process").spawn;
      var pythonProcess = spawn(Config.python_cmd, [Config.smsa_repo + "/interfaces/i_prices.py", "now"]);

      pythonProcess.stdout.on('data', function(data) {
        console.log('data', data)

        // On output (our data)
        data = JSON.parse(data.toString('utf-8'));
        resolve(data)
      });

      pythonProcess.stderr.on('data', function(data) {
        console.log(data.toString('utf-8'));
      });
    });
  };

  //Get the predictions for the specified type
  var getPredictions = function(type) {
    return new Promise(function(resolve, reject) {
      // CALL MONGODB. Get all the predictions
      Mongoose.connection.db.collection('predictions')
        .find({ "type": type })
        .toArray(function(err, predictions) {
          if (err) {
            console.log("ERROR getting predictions");
            reject(err)
          } else {
            resolve(formatPredictionDataForChart(predictions))
          }
        })
    });
  }

  //Main route. Simplified using the new async/await
  app.get('/', async(req, res) => {
    let today = moment(moment().valueOf()).toDate()
    let ninetySixHours = moment(moment().subtract(96, "hour").valueOf()).toDate()
    let thirtyDaysAgo = moment(moment().subtract(30, "day").valueOf()).toDate()

    try {
      //Hourly
      let historicalHourlyPrices = await getHistoricalPrice(ninetySixHours, today, "hourly");
      let hourlyPredictions = await getPredictions("hourly");

      console.log("HISTORICAL_HOURLY", historicalHourlyPrices.length);
      console.log("HOURLY_PREDICTIONS", hourlyPredictions.length);

      //Get sentiment
      let sentimentChartData = await getSentimentData(ninetySixHours, today); //array of 3 arrays (textblob, vader, tweetcount)

      console.log("SENTIMENT_HOURLY", sentimentChartData.length);

      //Daily
      let historicalDailyPrices = await getHistoricalPrice(thirtyDaysAgo, today, "daily");
      let dailyPredictions = await getPredictions("daily");

      console.log("HISTORICAL_DAILY", historicalDailyPrices.length);
      console.log("DAILY_PREDICTIONS", dailyPredictions.length);

      //Current
      let currentPrice = await getCurrentBitcoinPrice()

      console.log("CURRENT_PRICE", currentPrice)

      //Render the page
      res.render("index.ejs", {
        currentPrice: currentPrice,
        historicalHourlyPrices: historicalHourlyPrices,
        hourlyPredictions: hourlyPredictions,
        sentimentChartData: sentimentChartData,
        historicalDailyPrices: historicalDailyPrices,
        dailyPredictions: dailyPredictions,
        moment: moment
      });
    } catch (e) {
      res.send(e);
    }
  })

  app.get("/current-bitcoin-price", function(req, res) {
    getCurrentBitcoinPrice().then(function(data) {
      res.json(data);
    })
  });

  app.listen(Config.port, function() {
    console.log(Chalk.yellow("(" + Config.environment + ") App listening on port:" + Config.port));
  });

}());