(function() {
  const BASE_HISTORICAL_URL = 'https://api.coindesk.com/v1/bpi/historical/close.json'; //?start={}end={}';
  const request = require('request');
  const moment = require('moment');

  module.exports = function() {
    //This function will retrieve all the historical price information for a coin
    this.bitcoinHistoricalBulkRetrieval = function() {
      return new Promise(function(resolve, reject) {
        var start = "2010-07-17"; //YYYY-MM-DD [start date? this is for bitcoin.]
        var end = moment().add(-1, 'days').format('YYYY-MM-DD'); //yesterday

        var url = BASE_HISTORICAL_URL + "?start=" + start + "&end=" + end;

        console.log(url);

        request.get(url, function(err, resp) {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            if (resp.statusCode == 200) {
              // console.log(resp.body);
              resolve(resp.body)
            } else {
              console.log(resp);

              reject("an issue occured");
            }
          }
        });
      });
    };
  };
}());