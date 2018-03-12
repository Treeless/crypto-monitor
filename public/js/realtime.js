$(function() {

  // Update the price percent change colors
  var updateColorsOfPercent = function() {
    var pchh = $("#percent-change-hour");
    var pchhv = parseFloat(pchh.html());

    //Percent change 1 hr
    if (pchhv > 0) {
      //green
      pchh.addClass('green-color');
      pchh.html("+" + pchh.html() + "% <span class='fa fa-arrow-up'></span>") //add a +
    } else if (pchhv == 0) {
      pchh.addClass('');
    } else {
      //red
      pchh.addClass('red-color');
      pchh.html(pchh.html() + "% <span class='fa fa-arrow-down'></span>")
    }

    //percent change 24 hr
    var pchtf = $('#percent-change-tf');
    var pchtfv = parseFloat(pchtf.html());
    if (pchtfv > 0) {
      //green
      pchtf.addClass('green-color');
      pchtf.html("+" + pchtf.html() + "% <span class='fa fa-arrow-up'></span>") //add a +
    } else if (pchtfv == 0) {
      pchtf.addClass('');
    } else {
      //red
      pchtf.addClass('red-color');
      pchtf.html(pchtf.html() + "% <span class='fa fa-arrow-down'></span>")
    }

    //percent change 7 d

    var pchsd = $('#percent-change-sd');
    var pchsdv = parseFloat(pchsd.html());
    if (pchsdv > 0) {
      //green
      pchsd.addClass('green-color');
      pchsd.html("+" + pchsd.html() + "% <span class='fa fa-arrow-up'></span>") //add a +
    } else if (pchsdv == 0) {
      pchsd.addClass('');
    } else {
      //red
      pchsd.addClass('red-color');
      pchsd.html(pchsd.html() + "% <span class='fa fa-arrow-down'></span>")
    }
  }

  var foo;
  var processing = false;
  var interval = setInterval(foo = function() {
    if (!processing)
      processing = true;
    else
      return
    $.getJSON("/current-bitcoin-price", function(priceData) {
      $('#bitcoin-price').html("$" + priceData.price.toLocaleString())
      $('#percent-change-hour').html(priceData.percent_change_1h);
      $('#percent-change-tf').html(priceData.percent_change_24h);
      $('#percent-change-sd').html(priceData.percent_change_7d);
      updateColorsOfPercent();
      processing = false;
    });
  }, 10000);
  foo();
});