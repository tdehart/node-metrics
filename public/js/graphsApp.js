$(function() {
  $('.metrics').append('<div class="metric"></div>');
  var x, y, xAxis, yAxis, xAxisDrawing, yAxisDrawing;

  var margin = {top: 20, right: 20, bottom: 30, left: 90},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var svg = d3.select(".metric").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    renderAxes();
   

  $('.listings-dropdown, .year-dropdown, .view-compareDownloads-checkbox, .type-radio, .view-graph-radio').change(function () {
    var val = $('.listings-dropdown').val(),
      typeVal = $('input[name=type]:checked').val();

    svg.selectAll(".bar").remove();
    svg.selectAll(".ratings").remove();
    svg.selectAll(".pie").remove();

    toggleInputs(typeVal);

    
    if (val !== "None") {
      d3.json("http://127.0.0.1:3000/listings/" + val + "/metrics", function(error, data) {
        switch (typeVal) {
          case "views":
            drawViewsGraph(data);
            break;
          case "downloads":
            drawDownloadBars(data);
            break;
          case "ratings":
            drawRatingsLines(data);
            break;
          default:
            break;
        }
        });
      }
    });

  function renderAxes () {
      var currentYear = new Date().getFullYear();

      // Set up default x scale
      x = d3.time.scale()
                  .domain([new Date(currentYear, 0), new Date(currentYear + 1, 0)])
                  .range([0, width]);

      // Set up default y scale
    y = d3.scale.linear()
              .domain([0, 250])
              .range([height, 0]);

    xAxis = d3.svg.axis()
                      .scale(x)
                      .ticks(d3.time.months)
                      .tickFormat(function (d) {
                        var monthAbbrev = d.toString().substring(4, 7),
                            dataYear = d.toString().substring(11, 15);

                        if ((monthAbbrev == "Jan") && (dataYear == (x.domain()[1].getFullYear().toString()))) {
                          return "";
                        }

                        return monthAbbrev;
                      })
                      .tickSize(4)
                      .tickPadding(10)
                      .orient("bottom");

    yAxis = d3.svg.axis()
                  .scale(y)
                  .innerTickSize(width)
                  .tickPadding(10)
                  .orient("left");

    
    xAxisDrawing = svg.append("g")
                .attr("class", "x-axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)
                .attr("display", "none");

      yAxisDrawing = svg.append("g")
                .attr("class", "y-axis")
                .attr("transform", "translate(" + width + ", 0)")
                .call(yAxis)
                .attr("display", "none");
    }

    function toggleInputs (typeVal) {
      switch (typeVal) {
      case "views":
        ($('input[name=graph]:checked').val() == "bar") ? $('.view-compare-checkboxes').show() : $('.view-compare-checkboxes').hide();
            $('.view-graph-radio').show();
        break;
      
      default:
        $('.view-compare-checkboxes').hide();
            $('.view-graph-radio').hide();
    }
    }

    function drawViewsGraph (data) {
      switch ($('input[name=graph]:checked').val()) {
      case "bar":
        drawViewsBars(data);
        break;
      case "pie":
        drawPieGraph(data);
        break;
    }
    }

    function drawViewsBars (data) {
      var views = [],
      yearToShow = new Date($('.year-dropdown').val(), 0).getFullYear(),
      parseDate = d3.time.format("%Y-%m").parse;
    
    _.forEach(data.view, function (val, key) {
      var date = parseDate(key);
      if (date.toString().substring(11, 15) == yearToShow) {
        views.push({date: parseDate(key), count: val})
      }
    });

    var highestCount = d3.max(views, function(d) { return d.count; }),
            largestYValue = Math.ceil(highestCount / 50) * 50;

        x.domain([new Date(yearToShow, 0), new Date(yearToShow + 1, 0)]);
        xAxisDrawing.call(xAxis)
              .attr("display", "inline");
    y.domain([0, largestYValue]);
    yAxisDrawing.call(yAxis)
          .attr("display", "inline");

    svg.selectAll(".views")
            .data(views)
            .enter()
            .append("rect")
            .attr("class", "views bar")
            .attr("x", function (d) {
                return x(d.date);
            })
            .attr("y", function (d) {
                return  y(d.count);
            })
            .attr("width", 40)
            .attr("height", function (d) { return y(0) - y(d.count); })
            .style("fill", function (d) { return "#003380"; })
            .style("stroke", "none");

        if ($('.view-compareDownloads-checkbox').is(":checked")) {
          var downloads = [];

          _.forEach(data.download, function (val, key) {
        var date = parseDate(key);
        if (date.toString().substring(11, 15) == yearToShow) {
          downloads.push({date: parseDate(key), count: val})
        }
      });

      addDownloadBars(downloads);
    }
    }

    function drawDownloadBars (data) {
      var downloads = [],
      yearToShow = new Date($('.year-dropdown').val(), 0).getFullYear(),
      parseDate = d3.time.format("%Y-%m").parse;
    
    _.forEach(data.download, function (val, key) {
      var date = parseDate(key);
      if (date.toString().substring(11, 15) == yearToShow) {
        downloads.push({date: parseDate(key), count: val})
      }
    });

    var highestCount = d3.max(downloads, function(d) { return d.count; }),
            largestYValue = Math.ceil(highestCount / 50) * 50;

    x.domain([new Date(yearToShow, 0), new Date(yearToShow + 1, 0)]);
        xAxisDrawing.call(xAxis)
              .attr("display", "inline");
        y.domain([0, largestYValue]);
    yAxisDrawing.call(yAxis)
          .attr("display", "inline");

    addDownloadBars(downloads);
    }

    function addDownloadBars (downloads) {
      svg.selectAll(".downloads")
            .data(downloads)
            .enter()
            .append("rect")
            .attr("class", "downloads bar")
            .attr("x", function (d) {
              return x(d.date);
            })
            .attr("y", function (d) {
              return  y(d.count);
            })
            .attr("width", 40)
            .attr("height", function (d) { return y(0) - y(d.count); })
            .style("fill", function (d) {
              return "orange";
            })
            .style("stroke", "none");
    }

    function drawRatingsLines(data) {
      var listingRatings = [],
      yearToShow = new Date($('.year-dropdown').val(), 0).getFullYear(),
      parseDate = d3.time.format("%Y-%m").parse,
      rgbColor = d3.rgb("orange");

    x.domain([new Date(yearToShow, 0), new Date(yearToShow + 1, 0)]);
        xAxisDrawing.call(xAxis)
              .attr("display", "inline");
      y.domain([0, 5]);
      yAxisDrawing.call(yAxis)
          .attr("display", "inline");

      [1, 2, 3, 4, 5].forEach(function (numActiveStars) { printStars(numActiveStars, yearToShow); });

        yAxisDrawing.selectAll("text")
              .attr("display", "none");

    var avgLine = d3.svg.line()
                    .x(function (d) {
                      return x(d.date);
                    })
                    .y(function (d) {
                      return y(d.avgRate);
                    });

    var dots = d3.svg.symbol()
                  .type("square")
                  .size("160");

      _.forEach(data.comment, function (val, key) {
      if (key.substring(0, 4) == yearToShow) {
        var totalRatings = val[5] + val[4] + val[3] + val[2] + val[1],
            averageRating = (val[5] * 5 + val[4] * 4 + val[3] * 3 + val[2] * 2 + val[1] * 1) / totalRatings;
        listingRatings.push({date: parseDate(key), avgRate: averageRating, ratings: val});
      }
    });

      // Sort ratings by date so the average line gets drawn correctly
    listingRatings.sort(function (a, b) {
      var monthA = a.date.getMonth(),
          monthB = b.date.getMonth();

      return monthA < monthB? 1 : ((monthA == monthB) ? 0 : -1);
    });

    svg.append("path")
        .attr("class", "average-line ratings")
        .attr("d", avgLine(listingRatings));

    /* The ratings in listingRatings holds the number of ratings each rate level
       has. The following loop calculates the thickness each rate level should
       be and where it should go on the graph. That is replaced by the rate level
       number in listingRatings.
    */ 
    listingRatings.forEach(function (d) {
      var ratingBefore = d.avgRate,
          index = 0;

      _.forEach(d.ratings, function (r) {
        var newRating = ratingBefore - r * .05;
        d.ratings[index] = newRating;
        ratingBefore = newRating;
        index++;
      });
    });

    // Draws the break-down of rate lines under the average rate line
    [0, 1, 2, 3, 4].forEach(function (i) {
      svg.append("path")
          .attr("class", "rate-lines ratings")
          .attr("d", drawRateLines(i, listingRatings))
          .style("fill", rgbColor.darker(i * 1.25));
    });

    svg.selectAll(".dots")
        .data(listingRatings)
        .enter()
        .append("path")
        .attr("class", "dots ratings")
        .attr("d", dots)
        .attr("transform", function (d) {
          return "translate(" + x(d.date) + "," + y(d.avgRate) +")";
        });
    }

    function printStars(numActiveStars, yearToShow) {
        var moveX = width + 25;

        for (var iteration = 0; iteration < numActiveStars; iteration++) {
          yAxisDrawing.append("svg:image")
                .attr("class", "ratings")
            .attr("xlink:href", "../img/activeStar.png")
            .attr("width", 15)
            .attr("height", 15)
            .attr("x", x(new Date(yearToShow, 0)))
            .attr("y", y(numActiveStars))
            .attr("transform", "translate(-" + moveX + ", -5)");

          moveX += 15;
        }

        for (var iteration = 0; iteration < (5 - numActiveStars); iteration++) {
      yAxisDrawing.append("svg:image")
            .attr("class", "ratings")
            .attr("xlink:href", "../img/inActiveStar.png")
            .attr("width", 15)
            .attr("height", 15)
            .attr("x", x(new Date(yearToShow, 0)))
            .attr("y", y(numActiveStars))
            .attr("transform", "translate(-" + moveX + ", -5)");

      moveX += 15;
        }
    }

    function drawRateLines (index, data) {
    return d3.svg.area()
              .x(function (data) {
                return x(data.date);
              })
              .y0(function (data) {
                if (index == 0) {
                  return y(data.avgRate);
                }
                return y(data.ratings[index - 1]);
              })
              .y1(function (data) {
                return y(data.ratings[index]);
              })
              (data);
  }

  function drawPieGraph (data) {
    var rgbColor = d3.rgb("#4DB8FF"),
          views = [],
          yearToShow = new Date($('.year-dropdown').val(), 0).getFullYear(),
      parseDate = d3.time.format("%Y-%m").parse,
            lineData = [{"x1": width / 2, "y1": 0, "x2": width / 2, "y2": height},
                      {"x1": (width - height) / 2, "y1": height / 2, "x2": (width + height) / 2, "y2": height / 2}];
      
        _.forEach(data.view, function (val, key) {
      var date = parseDate(key);
      if (date.toString().substring(11, 15) == yearToShow) {
        views.push({date: key, count: val})
      }
        });

        var highestViews = d3.max(views, function(d) { return d.count; }),
          radius = height / 2;

        xAxisDrawing.attr("display", "none");
    yAxisDrawing.attr("display", "none");

        var line = d3.svg.line()
                    .x(function (d) {
                      return d.x;
                    })
                    .y(function (d) {
                      return d.y;
                    })
                    .interpolate("linear");

      var lineGroup = svg.append("g")
                        .attr("class", "lines pie");

        // Draw the lines that intersect the circles
        for (var degreesToRotate = 0; degreesToRotate < 90; degreesToRotate += 30) {
          lineGroup.selectAll(".lines")
            .data(lineData)
            .enter()
            .append("line")
            .attr("x1", function(d) {
              return d.x1;
            })
            .attr("x2", function(d) {
              return d.x2;
            })
            .attr("y1", function(d) {
              return d.y1;
            })
            .attr("y2", function(d) {
              return d.y2;
            })
            .attr("transform", "rotate(" + degreesToRotate + "," + width / 2 + "," + height / 2 + ")");
        }

        var miniCircles = svg.append("g")
                            .attr("class", "mini-circles pie");

        // Draw all the circles inside the biggest circle
        for(var iteration = 5; iteration <= highestViews; iteration+=5) {
          miniCircles.append("circle")
                    .attr("cx", width / 2)
                      .attr("cy", height / 2)
                      .attr("r", (iteration * radius) / highestViews);
        }

        var arc = d3.svg.arc()
          .innerRadius(0)
          .outerRadius(function (d) {
            return (d.count * radius) / highestViews;
          })
          .startAngle(function (d) {
            var month = parseInt(d.date.toString().substring(5)),
              degree = (month - 1) * 30;
            return (degree * (Math.PI / 180));//something about the months
          })
          .endAngle(function (d) {
            var month = parseInt(d.date.toString().substring(5)),
              degree = month * 30;
          return (degree * (Math.PI / 180));
          });

    // Draw the arcs
        svg.selectAll("svg")
          .data(views)
      .enter()
      .append("path")
      .attr("class", "pie")
      .attr("d", arc)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
      .attr("fill", function (d) {
        return rgbColor.darker((d.count * 2.5) / highestViews);
      })
      .attr("stroke", function (d) {
        return rgbColor.darker((d.count * 2.5) / highestViews);
      });

        var textHolder = svg.append("g")
                      .attr("class", "scale pie");

        // Draw the views scale
        for (var iteration = 5; iteration <= highestViews; iteration+=5) {
          var text = textHolder.append("text")
                      .attr("class", "pie")
                            .attr("x", width / 2)
                          .attr("y", (height / 2) + ((iteration * radius) / highestViews))
                            .text(iteration);

          if (iteration + 5 > highestViews) {
            text.text(iteration + " views");
          }
        }

        // Draw the months scale
    textHolder.append("text")
          .attr("class", "pie")
          .attr("x", width / 2)
          .attr("y", 0)
          .text("Jan");

    textHolder.append("text")
          .attr("class", "pie")
          .attr("x", (width + height) / 2)
          .attr("y", height / 2)
          .text("Apr");

    textHolder.append("text")
          .attr("class", "pie")
                .attr("x", width / 2)
                .attr("y", height + 20)
                .text("Jul");

    textHolder.append("text")
          .attr("class", "pie")
                .attr("x", (width - height) / 2)
                .attr("y", height / 2)
                .attr("text-anchor", "end")
              .text("Oct");
  }

});