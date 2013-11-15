$(function() {
  $('.metrics').append('<div class="metric"></div>');
  var x, y, xAxis, yAxis, xAxisDrawing, yAxisDrawing, months30Days = [4, 6, 9, 11];

  var margin = {top: 20, right: 20, bottom: 30, left: 90},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  var svg = d3.select(".metric").append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  renderAxes();

  $('.listings-dropdown, .year-dropdown, .view-compareDownloads-checkbox, .type-radio, .view-graph-radio, .date-selection').change(function () {
    var val = $('.listings-dropdown').val(),
        typeVal = $('input[name=type]:checked').val(),
        yearly = $('.yearly-checkbox').is(":checked"),
        month = $('.month-dropdown').val(),
        day = ($('.day-dropdown').val().length == 1) ? "0" + $('.day-dropdown').val() : $('.day-dropdown').val(),
        year = $('.year-dropdown').val(),
        interval = "",
        type = "";

    /* Removes the data (not the axes) drawn from the previous graph shown, if any */
    svg.selectAll(".bar").remove();
    svg.selectAll(".ratings").remove();
    svg.selectAll(".pie").remove();
    svg.selectAll(".comparison").remove();
    svg.selectAll(".comments").remove();
    svg.selectAll(".textCloud").remove();
    svg.selectAll(".bubbleCloud").remove();

    /* Shows or hides inputs depending on which radio buttons are choosen */
    toggleInputs(typeVal);

    if (yearly) {
      interval = "yearly";
    } else if (day !== "00") {
      if (month !== "00") {
        interval = "hourly";
      }
    } else if (month !== "00") {
      interval = "daily";
    } else if (year !== "0000") {
      interval = "monthly";
    }

    if (typeVal == "views") {
      type += "view";
      if ($('input[name=graph]:checked').val() == "comparison") {
        type += "&type=download&type=search";
      } else if ($('.view-compareDownloads-checkbox').is(":checked")) {
        type += "&type=download";
      }
    } else if (typeVal == "downloads") {
      type += "download"
    } else if (typeVal == "ratings" || typeVal == "comments") {
      type += "comment";
    } else if (typeVal == "search rank" || typeVal == "search terms") {
      type += "search";
    }

    /* Gets the data and draws the appropriate graph */
    if (val !== "None" && interval !== "" && type !== "") {
      d3.json("http://127.0.0.1:3000/listings/" + val + "/metrics2?interval=" + interval + "&type=" + type, function(error, data) {
        var date = {interval: interval, month: month, day: day, year: year};

        switch (typeVal) {
          case "views":
            drawViewsGraph(data, date);
            break;
          case "downloads":
            var dateInfo = parseSelectedDate(date, true);
            drawDownloadBars(data, dateInfo["parseDate"], dateInfo["selectedDate"], date["interval"]);
            break;
          case "ratings":
            var dateInfo = parseSelectedDate(date, true);
            drawRatingsLines(data, dateInfo["parseDate"], dateInfo["selectedDate"]);
            break;
          case "comments":
            var dateInfo = parseSelectedDate(date, true);
            drawCommentsBars(data, dateInfo["parseDate"], dateInfo["selectedDate"], date["interval"]);
            break;
          case "search rank":
            var dateInfo = parseSelectedDate(date, false);
            drawBubbleCloud(data, dateInfo["parseDate"]);
            break;
          case "search terms":
            var dateInfo = parseSelectedDate(date, false);
            drawTextCloud(data, dateInfo["parseDate"]);
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

                if (dataYear == x.domain()[1].getFullYear()) {
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
        $(".date-selection").show();
        break;
      case "search rank":
      case "search terms":
        $('.view-compare-checkboxes').hide();
        $('.view-graph-radio').hide();
        $(".date-selection").hide();
        break;
      default:
        $('.view-compare-checkboxes').hide();
        $('.view-graph-radio').hide();
        $(".date-selection").show();
    }
  }

  function drawViewsGraph (data, date) {
    var dateInfo;

    switch ($('input[name=graph]:checked').val()) {
      case "bar":
        dateInfo = parseSelectedDate(date, true);
        drawViewsBars(data, dateInfo["parseDate"], dateInfo["selectedDate"], date["interval"]);
        break;
      case "pie":
        dateInfo = parseSelectedDate(date, false);
        drawPieGraph(data, dateInfo["parseDate"], dateInfo["selectedDate"], date["interval"]);
        break;
      case "comparison":
        dateInfo = parseSelectedDate(date, false);
        drawComparisonGraph(data, dateInfo["selectedDate"], date["interval"]);
        break;
    }
  }

  function parseSelectedDate (date, redrawAxes) {
    var parseDate = "",
        selectedDate = "";

    if (date.interval == "yearly") {
      console.log("yearly");
      parseDate = d3.time.format("%Y").parse;
      if (redrawAxes) {
        x.domain([new Date(2011, 0), new Date(2013, 11)]);
        xAxis.ticks(d3.time.years)
              .tickFormat(function (d) {
                return d.getFullYear();
              });
      }
    } else if (date.interval == "monthly") {
      console.log("monthly");
      parseDate = d3.time.format("%Y-%m").parse;
      selectedDate = date["year"];
      if (redrawAxes) {
        x.domain([new Date(date["year"], 0), new Date(date["year"], 12)]);
        xAxis.ticks(d3.time.months)
              .tickFormat(function (d) {
                var monthAbbrev = d.toString().substring(4, 7),
                    dataYear = d.toString().substring(11, 15);

                if (dataYear == x.domain()[1].getFullYear()) {
                  return "";
                }

                return monthAbbrev;
              });
      }
    } else if (date.interval == "daily") {
        console.log("daily");
        parseDate = d3.time.format("%Y-%m-%d").parse;
        selectedDate = date["year"] + "-" + date["month"];
        if (redrawAxes) {
          x.domain([new Date(date["year"], parseInt(date["month"]) - 1, 1), new Date(date["year"], date["month"], 1)]);
          xAxis.ticks(d3.time.days)
                .tickFormat(function (d) {
                  var dataMonth = d.getMonth();

                  if (dataMonth == x.domain()[1].getMonth()) {
                    return "";
                  }

                  return d.getDate();
                });
        }
    } else if (date.interval == "hourly") {
        console.log("hourly");
        parseDate = d3.time.format("%Y-%m-%d-%H").parse;
        selectedDate = date["year"] + "-" + date["month"] + "-" + date["day"];
        if (redrawAxes) {
          x.domain([new Date(date["year"], parseInt(date["month"]) - 1, date["day"], 0), new Date(date["year"], parseInt(date["month"]) - 1, date["day"], 24)]);
          xAxis.ticks(d3.time.hour)
                .tickFormat(function (d) {
                  if (d.getDate() != x.domain()[0].getDate()) {
                    return "";
                  }
                  return d.getHours();
                });
        }
    }

    if (redrawAxes) {
      xAxisDrawing.call(xAxis)
                  .attr("display", "inline");
    }

    return {parseDate: parseDate, selectedDate: selectedDate};
  }

  function drawViewsBars (data, parseDate, selectedDate, interval) {
    var views = [];
    
    _.forEach(data.view, function (val) {
      if (val["date"].substring(0, selectedDate.length) == selectedDate) {
        views.push({date: val["date"], count: val["count"]});
      }
    });

    if (views.length > 0) {
      var highestCount = d3.max(views, function(d) { return d.count; }),
          largestYValue = Math.ceil(highestCount / 50) * 50;

      y.domain([0, largestYValue]);
    }

    yAxisDrawing.call(yAxis)
                .attr("display", "inline")
                .selectAll("text")
                .attr("display", "inline");
    
    svg.selectAll(".views")
        .data(views)
        .enter()
        .append("rect")
        .attr("class", "views bar")
        .attr("x", function (d) {
          return x(parseDate(d.date));
        })
        .attr("y", function (d) {
          return  y(d.count);
        })
        .attr("width", function (d) {
          if (interval == "yearly" || interval == "monthly") {
            return 40;
          } else {
            return 20;
          }
        })
        .attr("height", function (d) { return y(0) - y(d.count); })
        .style("fill", function (d) { return "#003380"; })
        .style("stroke", "none")
        .attr("transform", function (d) {
          if (interval == "daily" || interval == "hourly") {
            return "translate(10,0)";
          }
          return "translate(0,0)";
        });

    if ($('.view-compareDownloads-checkbox').is(":checked")) {
      var downloads = [];

      _.forEach(data.download, function (val) {
        if (val["date"].substring(0, selectedDate.length) == selectedDate) {
          downloads.push({date: val["date"], count: val["count"]});
        }
      });

      addDownloadBars(downloads, parseDate, interval);
    }
  }

  function drawDownloadBars (data, parseDate, selectedDate, interval) {
    var downloads = [];
    
    _.forEach(data.download, function (val) {
      if (val["date"].substring(0, selectedDate.length) == selectedDate) {
        downloads.push({date: val["date"], count: val["count"]});
      }
    });

    if (downloads.length > 0) {
      var highestCount = d3.max(downloads, function(d) { return d.count; }),
          largestYValue = Math.ceil(highestCount / 50) * 50;

      y.domain([0, largestYValue]);
    }

    yAxisDrawing.call(yAxis)
                .attr("display", "inline")
                .selectAll("text")
                .attr("display", "inline");

    addDownloadBars(downloads, parseDate, interval);
  }

  function addDownloadBars (downloads, parseDate, interval) {
    svg.selectAll(".downloads")
        .data(downloads)
        .enter()
        .append("rect")
        .attr("class", "downloads bar")
        .attr("x", function (d) {
          return x(parseDate(d.date));
        })
        .attr("y", function (d) {
          return  y(d.count);
        })
        .attr("width", function (d) {
          if (interval == "yearly" || interval == "monthly") {
            return 40;
          } else {
            return 20;
          }
        })
        .attr("height", function (d) { return y(0) - y(d.count); })
        .style("fill", function (d) {
          return "orange";
        })
        .style("stroke", "none")
        .attr("transform", function (d) {
          if (interval == "daily" || interval == "hourly") {
            return "translate(10,0)";
          }
          return "translate(0,0)";
        });
  }

  function drawRatingsLines(data, parseDate, selectedDate) {
    var listingRatings = [],
        highestComments = 0,
        rateAreaThickness = 0,
        colors = ["#000000", "#332100", "#664200", "#B27300", "#FFA500"];

    y.domain([0, 5]);
    yAxisDrawing.call(yAxis)
                .attr("display", "inline")
                .selectAll("text")
                .attr("display", "none");

    [1, 2, 3, 4, 5].forEach(function (numActiveStars) { printStars(numActiveStars); });

    var avgLine = d3.svg.line()
                    .x(function (d) {
                      return x(parseDate(d.date));
                    })
                    .y(function (d) {
                      return y(d.avgRate);
                    });

    var dots = d3.svg.symbol()
                  .type("square")
                  .size("160");

    _.forEach(data.comment, function (val) {
      if (val["date"].substring(0, selectedDate.length) == selectedDate) {
        var count = val["count"],
            totalRatings = count[5] + count[4] + count[3] + count[2] + count[1],
            averageRating = (count[5] * 5 + count[4] * 4 + count[3] * 3 + count[2] * 2 + count[1] * 1) / totalRatings;

        if (totalRatings > highestComments) {
          highestComments = totalRatings;
        }

        listingRatings.push({date: val["date"], avgRate: averageRating, ratings: count});
      }
    });

    /* Calculates the thickness the individuals rate lines should be based on
       the highest total ratings on the graph. */
    if (highestComments > 50) {
      rateAreaThickness = .005;
    } else if (highestComments > 10) {
      rateAreaThickness = .05;
    } else {
      rateAreaThickness = .5;
    }

    // Sort ratings by date so the average line gets drawn correctly
    listingRatings.sort(function (a, b) {
      var aDateSplit = a.date.split("-"),
          aDate = parseInt(aDateSplit[aDateSplit.length - 1]),
          bDateSplit = b.date.split("-"),
          bDate = parseInt(bDateSplit[bDateSplit.length - 1]);

      return aDate < bDate? 1 : ((aDate == bDate) ? 0 : -1);
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
      var ratingBefore = d.avgRate;

      for (var index = 5; index > 0; index--) {
        var newRating = ratingBefore - d.ratings[index] * rateAreaThickness;
        d.ratings[index] = newRating;
        ratingBefore = newRating;
      }
    });

    // Draws the break-down of rate lines under the average rate line
    [1, 2, 3, 4, 5].forEach(function (i) {
      svg.append("path")
          .attr("class", "rate-lines ratings")
          .attr("d", drawRateLines(i, listingRatings, parseDate))
          .style("fill", colors[i - 1]);
    });

    svg.selectAll(".dots")
        .data(listingRatings)
        .enter()
        .append("path")
        .attr("class", "dots ratings")
        .attr("d", dots)
        .attr("transform", function (d) {
          return "translate(" + (x(parseDate(d.date)) + 10) + "," + y(d.avgRate) +")";
        });
  }

  function printStars(numActiveStars) {
    var moveX = width + 25;

    for (var iteration = 0; iteration < numActiveStars; iteration++) {
      yAxisDrawing.append("svg:image")
                  .attr("class", "ratings")
                  .attr("xlink:href", "../img/activeStar.png")
                  .attr("width", 15)
                  .attr("height", 15)
                  .attr("x", x(x.domain()[0]))
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
                    .attr("x", x(x.domain()[0]))
                    .attr("y", y(numActiveStars))
                    .attr("transform", "translate(-" + moveX + ", -5)");

        moveX += 15;
    }
  }

  function drawRateLines (index, data, parseDate) {
    return d3.svg.area()
              .x(function (data) {
                return x(parseDate(data.date));
              })
              .y0(function (data) {
                if (index == 5) {
                  return y(data.avgRate);
                }
                return y(data.ratings[index + 1]);
              })
              .y1(function (data) {
                return y(data.ratings[index]);
              })
              (data);
  }

  function drawPieGraph (data, parseDate, selectedDate, interval) {
    var rgbColor = d3.rgb("#4DB8FF"),
        views = [],
        radius = height / 2,
        rotateValues = [0, 0, 0, 0],
        rotateValuesForYearly = [],
        degreesForSlices = getDegreesForSlices(interval, selectedDate),
        lineData = [{"x1": width / 2, "y1": 0, "x2": width / 2, "y2": height / 2}];
      
    _.forEach(data.view, function (val) {
      if (val["date"].substring(0, selectedDate.length) == selectedDate) {
        views.push({date: val["date"], count: val["count"]})
      }
    });

    xAxisDrawing.attr("display", "none");
    yAxisDrawing.attr("display", "none");

    if (views.length > 0) {
      var highestViews = d3.max(views, function(d) { return d.count; });

      var lineGroup = svg.append("g")
                        .attr("class", "lines pie");

      // Draw the lines that intersect the circles
      for (var degreesToRotate = 0; degreesToRotate < 360; degreesToRotate += degreesForSlices) {
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

        /* Gets the degrees at 1/4 marks around the circle to put the text for the scale at */ 
        if (interval == "yearly" && degreesForSlices > 90) {
          rotateValuesForYearly.push(degreesToRotate);
        }else if (((degreesToRotate + degreesForSlices) > 270 || degreesToRotate == 270) && rotateValues[3] == 0) {
          rotateValues[3] = degreesToRotate;
        } else if (((degreesToRotate + degreesForSlices) > 180 || degreesToRotate == 180) && rotateValues[2] == 0) {
          rotateValues[2] = degreesToRotate;
        } else if (((degreesToRotate + degreesForSlices) > 90 || degreesToRotate == 90) && rotateValues[1] == 0) {
          rotateValues[1] = degreesToRotate;
        }
      }

      var miniCircles = svg.append("g")
                            .attr("class", "mini-circles pie");

      // Draw all the circles inside the biggest circle
      for(var iteration = Math.ceil(highestViews / 4); iteration <= highestViews; iteration+=Math.ceil((highestViews / 4))) {
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
                    var degree = 0;

                    /* The degrees for the slices are different depending on what interval
                       the graph is shown in so we need to compute the starting angle accordingly. */
                    switch (interval) {
                      case "hourly":
                        var hour = parseInt(parseDate(d.date).getHours());
                        degree = hour * degreesForSlices;
                        break;
                      case "daily":
                        var day = parseInt(parseDate(d.date).getDate());
                        degree = (day - 1) * degreesForSlices;
                        break;
                      case "monthly":
                        var month = parseInt(parseDate(d.date).getMonth());
                        degree = month * degreesForSlices;
                        break;
                      case "yearly":
                        var year = parseInt(parseDate(d.date).getFullYear()),
                            currentYear = parseInt(new Date().getFullYear());
                        degree = (($('.year-dropdown > option').length - 1) - (currentYear - year)) * degreesForSlices;
                        break;
                    }

                    return (degree * (Math.PI / 180));
                  })
                  .endAngle(function (d) {
                    var degree = 0;

                    /* The degrees for the slices are different depending on what interval
                       the graph is shown in so we need to compute the ending angle accordingly. */
                    switch (interval) {
                      case "hourly":
                        var hour = parseInt(parseDate(d.date).getHours());
                        degree = (hour + 1) * degreesForSlices;
                        break;
                      case "daily":
                        var day = parseInt(parseDate(d.date).getDate());
                        degree = day * degreesForSlices;
                        break;
                      case "monthly":
                        var month = parseInt(parseDate(d.date).getMonth());
                        degree = (month + 1) * degreesForSlices;
                        break;
                      case "yearly":
                        var year = parseInt(parseDate(d.date).getFullYear()),
                            currentYear = parseInt(new Date().getFullYear());
                        degree = ($('.year-dropdown > option').length - (currentYear - year)) * degreesForSlices;
                        break;
                    }

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
      for (var iteration = Math.ceil(highestViews / 4); iteration <= highestViews; iteration+=Math.ceil(highestViews / 4)) {
        var text = textHolder.append("text")
                              .attr("class", "pie")
                              .attr("x", width / 2)
                              .attr("y", (height / 2) + ((iteration * radius) / highestViews))
                              .text(iteration);

        if (iteration + Math.ceil(highestViews / 4) > highestViews) {
          text.text(iteration + " views");
        }
      }

      /* Draws the text for the scale showing the intervals (ex. Jan, Feb or 6:00, 7:00) */
      drawScale(textHolder, interval, ((interval == "yearly") ? rotateValuesForYearly : rotateValues), selectedDate);
    }
  }

  function drawScale (textHolder, interval, rotateValues, selectedDate) {
    var text = [];

    switch (interval) {
      case "hourly":
        text = ["0:00", "6:00", "12:00", "18:00"];
        break;
      case "daily":
        var month = parseInt(selectedDate.split("-")[1]);
        if (months30Days.indexOf(month) > -1) {
          text = ["1", "8", "16", "23"];
        } else if (month != 2) {
          text = ["1", "8", "16", "24"];
        } else {
          if (isLeapYear(parseInt(selectedDate.split("-")[0]))) {
            text = ["1", "8", "15", "22"];
          } else {
            text = ["1", "7", "14", "22"];
          }
        }
        break;
      case "monthly":
        text = ["Jan", "Apr", "Jul", "Oct"];
        break;
      case "yearly":
        $('.year-dropdown option').each(function () {
          text.push(this.value);
        });
        text.sort();
        break;
    }

    for (var iteration = 0; iteration < rotateValues.length; iteration++) {
      textHolder.append("text")
                .attr("class", "pie")
                .attr("x", width / 2)
                .attr("y", 0)
                .text(text[iteration])
                .attr("transform", "rotate(" + rotateValues[iteration] + "," + width / 2 + "," + height / 2 + ")");
    }
  }

  function getDegreesForSlices (interval, selectedDate) {
    var selectedDateSplit = selectedDate.split("-");

    if (interval == "hourly") {
      return 360 / 24;
    } else if (interval == "daily") {
      var month = parseInt(selectedDateSplit[1]);
      if (months30Days.indexOf(month) > -1) {
        return 360 / 30;
      } else if (month != 2) {
        return 360 / 31;
      } else {
        if (isLeapYear(parseInt(selectedDateSplit[0]))) {
          return 360 / 29;
        } else {
          return 360 / 28;
        }
      }
    } else if (interval == "monthly") {
      return 360 / 12;
    } else if (interval == "yearly") {
      return 360 / $('.year-dropdown > option').length;
    }
  }

  function drawComparisonGraph (data, selectedDate, interval) {
    var searchesCount = 0,
        allSearchesCount = 0,
        viewsCount = 0,
        allViewsCount = 0,
        downloadsCount = 0,
        allDownloadsCount = 0,
        radius = height / 2,
        lineData = [{"x1": width / 2, "y1": 0, "x2": width / 2, "y2": height / 2}/*,
                    {"x1": (width - height) / 2, "y1": height / 2, "x2": (width + height) / 2, "y2": height / 2}*/];
      
    _.forEach(data.search, function (val) {
      if (val["mostRecentDateSearched"].substring(0, selectedDate.length) == selectedDate) {
        searchesCount += val["count"];
      }

      /* The highest arc value is different depending on which interval the
         graph is shown in. Yearly and monthly add all the years together,
         daily adds the the whole year selected together, and hourly adds
         the whole month selected together. */
      if (interval == "yearly" || interval == "monthly") {
        allSearchesCount += val["count"];
      } else if (interval == "daily") {
        if (val["mostRecentDateSearched"].substring(0, 4) == selectedDate.substring(0, 4)) {
          allSearchesCount += val["count"];
        }
      } else if (interval == "hourly") {
        if (val["mostRecentDateSearched"].substring(5, 7) == selectedDate.substring(5, 7)) {
          allSearchesCount += val["count"];
        }
      }
    });

    _.forEach(data.view, function (val) {
      if (val["date"].substring(0, selectedDate.length) == selectedDate) {
        viewsCount += val["count"];
      }

      /* The highest arc value is different depending on which interval the
         graph is shown in. Yearly and monthly add all the years together,
         daily adds the the whole year selected together, and hourly adds
         the whole month selected together. */
      if (interval == "yearly" || interval == "monthly") {
        allViewsCount += val["count"];
      } else if (interval == "daily") {
        if (val["date"].substring(0, 4) == selectedDate.substring(0, 4)) {
          allViewsCount += val["count"];
        }
      } else if (interval == "hourly") {
        if (val["date"].substring(5, 7) == selectedDate.substring(5, 7)) {
          allViewsCount += val["count"];
        }
      }
    });

    _.forEach(data.download, function (val) {
      if (val["date"].substring(0, selectedDate.length) == selectedDate) {
        downloadsCount += val["count"];
      }

      /* The highest arc value is different depending on which interval the
         graph is shown in. Yearly and monthly add all the years together,
         daily adds the the whole year selected together, and hourly adds
         the whole month selected together. */
      if (interval == "yearly" || interval == "monthly") {
        allDownloadsCount += val["count"];
      } else if (interval == "daily") {
        if (val["date"].substring(0, 4) == selectedDate.substring(0, 4)) {
          allDownloadsCount += val["count"];
        }
      } else if (interval == "hourly") {
        if (val["date"].substring(5, 7) == selectedDate.substring(5, 7)) {
          allDownloadsCount += val["count"];
        }
      }
    });

    /* The highest arc value is the arc with the highest number of counts */
    var highestCount = d3.max([allSearchesCount, allViewsCount, allDownloadsCount]);

    xAxisDrawing.attr("display", "none");
    yAxisDrawing.attr("display", "none");

    var lineGroup = svg.append("g")
                        .attr("class", "lines comparison"),
        textHolder = svg.append("g")
                        .attr("class", "counts key comparison");

    // Draw the lines that intersect the circles
    for (var degreesToRotate = 0, iteration = highestCount; degreesToRotate < 360; degreesToRotate += 30, iteration -= (highestCount/12)) {
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

      textHolder.append("text")
                .attr("x", width / 2)
                .attr("y", 0)
                .text(Math.round(highestCount - iteration))
                .attr("transform", "rotate(" + degreesToRotate + "," + width / 2 + "," + height / 2 + ")");
    }

    var miniCircles = svg.append("g")
                          .attr("class", "mini-circles comparison");

    // Draw all the circles inside the biggest circle
    for(var iteration = radius; iteration >= (radius - 180); iteration-=60) {
      miniCircles.append("circle")
                  .attr("cx", width / 2)
                  .attr("cy", height / 2)
                  .attr("r", iteration);
    }

    var arcData = [{radius: radius, degree: (searchesCount / highestCount), color: "#00007A"},
                    {radius: (radius - 60), degree: (viewsCount / highestCount), color: "#008F00"},
                    {radius: (radius - 120), degree: (downloadsCount / highestCount), color: "#E6E600"}]

    var arc = d3.svg.arc()
        .innerRadius(function (d) {
          return (d.radius - 60);
        })
        .outerRadius(function (d) {
          return d.radius;
        })
        .startAngle(0)
        .endAngle(function (d) {
          return ((d.degree * 360) * (Math.PI / 180));
        });

    svg.selectAll("svg")
      .data(arcData)
      .enter()
      .append("path")
      .attr("class", "arcs comparison")
      .attr("d", arc)
      .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")")
      .attr("fill", function (d) {
        return d.color;
      })
      .attr("stroke", function (d) {
        return d.color;
      });

    textHolder = svg.append("g")
                        .attr("class", "key comparison");

    textHolder.append("text")
              .attr("class", "comparison")
              .attr("x", width / 2)
              .attr("y", 55)
              .text("In Results");

    textHolder.append("text")
              .attr("class", "comparison")
              .attr("x", width / 2)
              .attr("y", 115)
              .text("Views");

    textHolder.append("text")
              .attr("class", "comparison")
              .attr("x", width / 2)
              .attr("y", 175)
              .text("Downloads");
  }

  function drawCommentsBars (data, parseDate, selectedDate, interval) {
    var comments = [],
        colors = ["#000000", "#332100", "#664200", "#B27300", "#FFA500"];
    
    _.forEach(data.comment, function (val) {
      if (val["date"].substring(0, selectedDate.length) == selectedDate) {
        var count = val["count"],
            totalComments = count[5] + count[4] + count[3] + count[2] + count[1];
        comments.push({date: val["date"], totalComments: totalComments, ratings: count});
      }
    });

    if (comments.length > 0) {
      var highestTotalComments = d3.max(comments, function(d) { return d.totalComments; }),
          largestYValue = Math.ceil(highestTotalComments / 50) * 50;

      y.domain([0, largestYValue]);
    }

    yAxisDrawing.call(yAxis)
                .attr("display", "inline")
                .selectAll("text")
                .attr("display", "inline");

    /* The ratings in comments holds the number of ratings each rate level
       has. The following loop calculates the y value each rate level should
       be at on the graph. That is replaced by the rate level
       number in comments.
    */ 
    comments.forEach(function (d) {
      var ratingBefore = d.totalComments;

      for (var index = 5; index > 0; index--) {
        var newRating = ratingBefore - d.ratings[index];
        d.ratings[index] = newRating;
        ratingBefore = newRating;
      }
    });

    var bars = svg.selectAll(".comments")
                  .data(comments)
                  .enter();

    /* Draws the individual bars for each rate level on each month */
    [5, 4, 3, 2, 1].forEach(function (i) {
      bars.append("rect")
          .attr("class", "comments")
          .attr("x", function (d) {
            return x(parseDate(d.date));
          })
          .attr("y", function (d) {
            if (i == 5) {
              return y(d.totalComments);
            }
            return y(d.ratings[i + 1]);
          })
          .attr("width", function (d) {
            if (interval == "yearly" || interval == "monthly") {
              return 40;
            } else {
              return 20;
            }
          })
          .attr("height", function (d) {
            if (i == 5) {
              return y(0) - y(d.totalComments - d.ratings[i]);
            }
            return y(0) - y(d.ratings[i + 1] - d.ratings[i]);
          })
          .style("fill", colors[i - 1])
          .attr("transform", function (d) {
            if (interval == "daily" || interval == "hourly") {
              return "translate(10,0)";
            }
            return "translate(0,0)";
          });
    });
  }

  function drawTextCloud (data, parseDate) {
    xAxisDrawing.attr("display", "none");
    yAxisDrawing.attr("display", "none");

    var searchTerms = [];

    _.forEach(data.search, function (val) {
      searchTerms.push({term: val["searchTerm"], date: parseDate(val["mostRecentDateSearched"]), count: val["count"], size: 0});
    });

    if (searchTerms.length > 0) {
      var highestCount = d3.max(searchTerms, function(d) { return d.count; });

      searchTerms.forEach(function (d) {
        /* Computes each search term's size based on highestCount.
           100 is the biggest font we want. */
        d.size = (d.count * 100) / highestCount;
      });

      var cloud = d3.layout.cloud()
                    .words(searchTerms)
                    .padding(5)
                    .fontSize(function (d) { return d.size; })
                    .rotate(0)
                    .size([width, height])
                    .on("end", drawText)
                    .start();
    }
  }

  function drawText (searchTerms) {
    svg.append("g")
        .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")")
        .selectAll(".textCloud")
        .data(searchTerms)
        .enter()
        .append("text")
        .attr("class", "textCloud")
        .attr("font-size", function (d) { return d.size + "px"; })
        .attr("fill", function (d) { return getTextColor(d); })
        .attr("transform", function (d) {
          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function (d) { return d.term; });
  }

  function getTextColor (d) {
    var color,
        year = d.date.getFullYear(),
        month = d.date.getMonth() + 1,
        day = d.date.getDate(),
        today = new Date(),
        todayYear = today.getFullYear(),
        todayMonth = today.getMonth() + 1,
        todayDay = today.getDate();

    if (year < todayYear) {
        color = "#E6E6E6";
    } else if (month < todayMonth) {
        color = "#B2B2B2";
    } else if (day < (todayDay - 6)) {
        color = "#808080";
    } else if (day != todayDay) {
        color = "#4C4C4C";
    } else {
        color = "#000000";
    }

    return color;
  }

  function drawBubbleCloud (data, parseDate) {
    xAxisDrawing.attr("display", "none");
    yAxisDrawing.attr("display", "none");

    var searchTerms = [],
        links = [],
        colorTargets = {green: "", lightgreen: "", grey: "", lightpink: "", hotpink: ""};

    _.forEach(data.search, function (val) {
      searchTerms.push({term: val["searchTerm"], date: val["mostRecentDateSearched"], count: val["count"], color: "", radius: 0});
    });

    if (searchTerms.length > 0) {
      var highestCount = d3.max(searchTerms, function(d) { return d.count; });

      searchTerms.forEach(function (d) {
        /* Computes each search term's radius based on highestCount */
        d.radius = (d.count * 60) / highestCount;
        d.color = getBubbleColor(parseDate(d.date));
      });

      for (var index = 0; index < searchTerms.length; index++) {
        var textColor = searchTerms[index].color;
        if (colorTargets[textColor] == "") {
          links.push({source: index, target: index})
        } else {
          links.push({source: index, target: colorTargets[textColor]})
        }
      }

      var force = d3.layout.force()
                    .nodes(searchTerms)
                    .charge(function (d) {
                      return -d.radius * d.radius * 1.5;
                    })
                    .links(links)
                    .linkStrength(.4)
                    .linkDistance(10)
                    .size([width, height]);

      force.on("tick", function(e) {
        circles.attr("cx", function (d) {
                  d.x += (500 - d.x) * e.alpha * 1.1;
                  return d.x;
                })
                .attr("cy", function (d) {
                  var color = d.color;
                  switch(d.color) {
                    case "green":
                      d.y += ((height / 2 - 30) - d.y) * e.alpha * 1.1;
                      break;
                    case "lightgreen":
                      d.y += ((height / 2 - 15) - d.y) * e.alpha * 1.1;
                      break;
                    case "grey":
                      d.y += (height / 2 - d.y) * e.alpha * 1.1;
                      break;
                    case "lightpink":
                      d.y += ((height / 2 + 15) - d.y) * e.alpha * 1.1;
                      break;
                    case "hotpink":
                      d.y += ((height / 2 + 30) - d.y) * e.alpha * 1.1;
                      break;
                  }
                  
                  return d.y;
                });

        text.attr("x", function (d) {
              return d.x;
            })
            .attr("y", function (d) {
              return d.y;
            });
      });

      force.start();

      var gTags = svg.selectAll(".mainBubbleCloud")
                      .data(searchTerms)
                      .enter()
                      .append("g")
                      .attr("class", "mainBubbleCloud bubbleCloud");

      var circles = gTags.append("circle")
                          .attr("class", "circles bubbleCloud")
                          .attr("cx", function(d) { return d.x; })
                          .attr("cy", function(d) { return d.y; })
                          .attr("r", function(d) { return d.radius; })
                          .style("fill", function (d) {
                            return d.color;
                          })
                          .style("stroke", function (d) {
                            return d.color;
                          });

      var text = gTags.append("text")
                      .attr("class", "searchTerms bubbleCloud")
                      .attr("x", function (d) {
                        return d.x;
                      })
                      .attr("y", function (d) {
                        return d.y;
                      })
                      .text(function (d) {
                        return d.term;
                      })
                      .attr("font-size", function (d) {
                        return d.radius / 3;
                      });

      force.on("end", function (d) {
        circles.on("mouseover", function (d) {
          circles.filter(function (p) {
            return d === p;
          }).style("stroke", "black").style("stroke-width", "3px");
        });

        circles.on("mouseout", function (d) {
          circles.filter(function (p) {
            return d === p;
          }).style("stroke", d.color).style("stroke-width", "1.5px");
        });
      });
    }
  }

  function getBubbleColor (date) {
    var color,
        year = date.getFullYear(),
        month = date.getMonth() + 1,
        day = date.getDate(),
        today = new Date(),
        todayYear = today.getFullYear(),
        todayMonth = today.getMonth() + 1,
        todayDay = today.getDate();

    if (year < todayYear) {
        color = "hotpink";
    } else if (month < todayMonth) {
        color = "lightpink";
    } else if (day < (todayDay - 6)) {
        color = "grey";
    } else if (day != todayDay) {
        color = "lightgreen";
    } else {
        color = "green";
    }

    return color;
  }

  function isLeapYear (year) {
    return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
  }

});