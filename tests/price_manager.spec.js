(function() {
  const MANAGER = require('../lib/price_manager.lib.js');
  let manager;

  describe("price_manager.lib", function() {
    beforeEach(function() {
      // new instance before each test
      manager = new MANAGER();
    });
    describe("#bitcoinHistoricalBulkRetrieval", function() {
      it("retrieves full list of prices for a symbol", function(done) {
        this.timeout(3000); //3 second timeout.

        manager.bitcoinHistoricalBulkRetrieval()
          .then(function(result) {
            // console.log(result);
            try {
              expect(JSON.parse(result)).to.contain.keys('bpi');
              done();
            } catch (e) {
              done(e);
            }
          }, function(err) {
            done(err); //finished with an error
          });
      });
    });
  });
}());