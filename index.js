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
    //Make the date we show to be the last week.
    var dates = { start: moment().startOf('week').toDate(), end: moment().endOf('day').toDate() }

    var chartedInfluencerData = [];

    //Find all the influencers that have tweets between our two dates
    Mongoose.connection.db.collection('influencers').find({
      "tweets": {
        $elemMatch: { "$and": [{ "dateRaw": { "$gte": new Date(dates.start) } }, { "dateRaw": { "$lte": new Date(dates.end) } }] }
      }
    }).sort({ followers: -1 }).limit(10).toArray(function(err, influencers) {
      if (err) {
        console.log(err);
        return res.send("MONGODB ERROR. AAAAAAAAHHHH..." + err)
      }

      //Get the top tweets from each influencer we have this week
      // Also, format some data so we can plot on the bitcoin price chart
      var topTweets = [];
      for (var i = 0; i < influencers.length; i++) {
        var influencer = influencers[i];
        for (var j = 0; j < influencer.tweets.length; j++) {
          var tweet = influencer.tweets[j]
          //[timestamp, tweet]
          chartedInfluencerData.push([moment(tweet.dateRaw).valueOf(), tweet.text])
        }

        topTweets.push(Object.assign({ accountName: influencer.accountName }, influencer.tweets[0]));
      }

      //GET THE sentiment and price data outputted by the SMSA repo
      // Ex: { "_id" : ObjectId("5aa19fbe46b3c33ce4e5c4f2"), "symbol" : "BTC", 
      //  "date" : ISODate("2018-03-08T20:40:30.631Z"), "tweet_count" : "792", 
      //  "timestamp" : "1520557200.0", "tb_polarity" : "0.1523370823433956",
      //  "vader_polarity" : "0.21940012626262625", "price" : "9404.7" }
      Mongoose.connection.db.collection("live_tweets_sent")
        .find({ "$and": [{ "date": { "$gte": new Date(dates.start) } }, { "date": { "$lte": new Date(dates.end) } }] })
        .toArray(function(err, output) {
          if (err) {
            console.log("error getting live_tweets_sent", err)
          } else {

            //Get the values
            let formattedData = {}

            formattedData.tweet_count = output.map(a => [moment(a.date).valueOf(), parseInt(a.tweet_count)]);
            formattedData.tbpol = output.map(a => [moment(a.date).valueOf(), parseFloat(a.tb_polarity)]);
            formattedData.vader = output.map(a => [moment(a.date).valueOf(), parseFloat(a.vader_polarity)]);
            formattedData.prices = output.map(a => [moment(a.date).valueOf(), parseFloat(a.price)]);

            console.log(formattedData)


            //GET THE PREDICTION FROM SMSA
            // Should be stored in mongo
            // TODO. Waiting on nakul's stuff
            var predictedPrice = { date: moment().format("YYYY-MM-DD"), price: 11000 };


            res.render("index.ejs", {
              title: "MAIN PAGE",
              influencers: influencers,
              chartedInfluencerData: chartedInfluencerData, //Influencer pieces to plot onto the charts
              topTweets: topTweets,
              predictedPrice: predictedPrice,
              chartData: formattedData,
              dates: dates
            });
          }
        })
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
  });


}());