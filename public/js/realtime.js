$(function() {

  var foo;
  var processing = false;
  var interval = setInterval(foo = function() {
    if (!processing)
      processing = true;
    else
      return
    $.getJSON("/current-bitcoin-price", function(priceData) {
      $('#bitcoin-price').html("$" + priceData.price.toLocaleString())
      processing = false;
    });
  }, 10000);
  foo();
});