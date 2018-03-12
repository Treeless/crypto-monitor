$('#main-container').bind('mousemove touchmove touchstart', function(e) {
  var chart,
    point,
    i,
    event;

  for (i = 0; i < Highcharts.charts.length; i = i + 1) {
    chart = Highcharts.charts[i];
    // Find coordinates within the chart
    event = chart.pointer.normalize(e.originalEvent);
    // Get the hovered point
    point = chart.series[0].searchPoint(event, true);

    if (point) {
      point.highlight(e);
    }
  }
});
/**
 * Override the reset function, we don't need to hide the tooltips and
 * crosshairs.
 */
Highcharts.Pointer.prototype.reset = function() {
  return undefined;
};

/**
 * Highlight a point by showing tooltip, setting hover state and draw crosshair
 */
Highcharts.Point.prototype.highlight = function(event) {
  event = this.series.chart.pointer.normalize(event);
  this.onMouseOver(); // Show the hover marker
  this.series.chart.tooltip.refresh(this); // Show the tooltip
  this.series.chart.xAxis[0].drawCrosshair(event, this); // Show the crosshair
};

/**
 * Synchronize zooming through the setExtremes event handler.
 */
function syncExtremes(e) {
  var thisChart = this.chart;

  if (e.trigger !== 'syncExtremes') { // Prevent feedback loop
    Highcharts.each(Highcharts.charts, function(chart) {
      if (chart !== thisChart) {
        if (chart.xAxis[0].setExtremes) { // It is null while updating
          chart.xAxis[0].setExtremes(
            e.min,
            e.max,
            undefined,
            false, { trigger: 'syncExtremes' }
          );
        }
      }
    });
  }
}

//THEME
/**
 * (c) 2010-2017 Torstein Honsi
 *
 * License: www.highcharts.com/license
 * 
 * Dark theme for Highcharts JS
 * @author Torstein Honsi
 */
Highcharts.theme = {
  colors: ['#2b908f', '#90ee7e', '#f45b5b', '#7798BF', '#aaeeee', '#ff0066',
    '#eeaaee', '#55BF3B', '#DF5353', '#7798BF', '#aaeeee'
  ],
  chart: {
    backgroundColor: {
      linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
      stops: [
        [0, '#2a2a2b'],
        [1, '#3e3e40']
      ]
    },
    style: {
      fontFamily: '\'Unica One\', sans-serif'
    },
    plotBorderColor: '#606063'
  },
  title: {
    style: {
      color: '#E0E0E3',
      textTransform: 'uppercase',
      fontSize: '20px'
    }
  },
  subtitle: {
    style: {
      color: '#E0E0E3',
      textTransform: 'uppercase'
    }
  },
  xAxis: {
    gridLineColor: '#707073',
    labels: {
      style: {
        color: '#E0E0E3'
      }
    },
    lineColor: '#707073',
    minorGridLineColor: '#505053',
    tickColor: '#707073',
    title: {
      style: {
        color: '#A0A0A3'

      }
    }
  },
  yAxis: {
    gridLineColor: '#707073',
    labels: {
      style: {
        color: '#E0E0E3'
      }
    },
    lineColor: '#707073',
    minorGridLineColor: '#505053',
    tickColor: '#707073',
    tickWidth: 1,
    title: {
      style: {
        color: '#A0A0A3'
      }
    }
  },
  tooltip: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    style: {
      color: '#F0F0F0'
    }
  },
  plotOptions: {
    series: {
      dataLabels: {
        color: '#B0B0B3'
      },
      marker: {
        lineColor: '#333'
      }
    },
    boxplot: {
      fillColor: '#505053'
    },
    candlestick: {
      lineColor: 'white'
    },
    errorbar: {
      color: 'white'
    }
  },
  legend: {
    itemStyle: {
      color: '#E0E0E3'
    },
    itemHoverStyle: {
      color: '#FFF'
    },
    itemHiddenStyle: {
      color: '#606063'
    }
  },
  credits: {
    style: {
      color: '#666'
    }
  },
  labels: {
    style: {
      color: '#707073'
    }
  },

  drilldown: {
    activeAxisLabelStyle: {
      color: '#F0F0F3'
    },
    activeDataLabelStyle: {
      color: '#F0F0F3'
    }
  },

  navigation: {
    buttonOptions: {
      symbolStroke: '#DDDDDD',
      theme: {
        fill: '#505053'
      }
    }
  },

  // scroll charts
  rangeSelector: {
    buttonTheme: {
      fill: '#505053',
      stroke: '#000000',
      style: {
        color: '#CCC'
      },
      states: {
        hover: {
          fill: '#707073',
          stroke: '#000000',
          style: {
            color: 'white'
          }
        },
        select: {
          fill: '#000003',
          stroke: '#000000',
          style: {
            color: 'white'
          }
        }
      }
    },
    inputBoxBorderColor: '#505053',
    inputStyle: {
      backgroundColor: '#333',
      color: 'silver'
    },
    labelStyle: {
      color: 'silver'
    }
  },

  navigator: {
    handles: {
      backgroundColor: '#666',
      borderColor: '#AAA'
    },
    outlineColor: '#CCC',
    maskFill: 'rgba(255,255,255,0.1)',
    series: {
      color: '#7798BF',
      lineColor: '#A6C7ED'
    },
    xAxis: {
      gridLineColor: '#505053'
    }
  },

  scrollbar: {
    barBackgroundColor: '#808083',
    barBorderColor: '#808083',
    buttonArrowColor: '#CCC',
    buttonBackgroundColor: '#606063',
    buttonBorderColor: '#606063',
    rifleColor: '#FFF',
    trackBackgroundColor: '#404043',
    trackBorderColor: '#404043'
  },

  // special colors for some of the
  legendBackgroundColor: 'rgba(0, 0, 0, 0.5)',
  background2: '#505053',
  dataLabelsColor: '#B0B0B3',
  textColor: '#C0C0C0',
  contrastTextColor: '#F0F0F3',
  maskColor: 'rgba(255,255,255,0.3)'
};

// Apply the theme
Highcharts.setOptions(Highcharts.theme);