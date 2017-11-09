(function() {
  const url = 'https://api.coindesk.com/v1/bpi/historical/close.json'; //?start={}end={}';
  const request = require('request');

  module.exports = function() {
    //This function will retrieve all the historical price information for a coin
    this.historicalBulkRetrieval = function() {
      var start = ""; //YYYY-MM-DD
      var end = ""; //^

      request.get(url + "?start" + start + "&end=" + end, function(err, resp) {
        if (err) {
          console.log(err);
        } else {
          if (resp.statusCode == 200) {
            console.log(resp.body);
          } else {
            console.log(resp);
          }
        }
      });
    };
  };
}());