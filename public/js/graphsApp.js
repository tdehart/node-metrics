$(function() {
  $('.listings-dropdown, .year-radio, .compareDownloads-checkbox, .graph-radio').change(function() {
    var val = $('.listings-dropdown').val(),
      yearToShow = $('input[name=year]:checked').val(),
      graphToShow = $('input[name=graph]:checked').val();

    $('.metric').remove();

    if (graphToShow === "Bar") {
      $('.compare-checkboxes').show();

      if (val !== "None") {
      $('.metrics').append('<div class="metric"></div>');
        renderBarGraph(val, yearToShow);
      }
    } else {
      $('.compare-checkboxes').hide();

      if (val !== "None") {
      $('.metrics').append('<div class="metric"></div>');
        renderPieGraph(val, yearToShow);
      }
    }
  });

  function renderBarGraph(val, yearToShow) {
    var margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var parseDate = d3.time.format("%Y-%m").parse;

    var svg = d3.select(".metric").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.json("http://127.0.0.1:3000/listings/" + val + "/metrics", function(error, data) {
      var views = [],
          downloads = [],
          fullYear = (new Date(yearToShow, 0)).getFullYear();
      
      _.forEach(data.view, function (val, key) {
        var date = parseDate(key);
        if (date.toString().substring(11, 15) == fullYear) {
          views.push({date: parseDate(key), count: val})
        }
      });

      var highestViews = d3.max(views, function(d) { return d.count; }),
          largestYValue = Math.ceil(highestViews / 50) * 50;

      var x = d3.time.scale()
                .domain([new Date(fullYear, 0), new Date(fullYear + 1, 0)])
                .range([0, width - 10]);

      var y = d3.scale.linear()
                .domain([0, largestYValue])
                .range([height, 0]);

      var xAxis = d3.svg.axis()
                    .scale(x)
                    .ticks(d3.time.months)
                    .tickFormat(function (d) {
                      var monthAbbrev = d.toString().substring(4, 7),
                          dataYear = d.toString().substring(11, 15);

                      if ((monthAbbrev == "Jan") && (dataYear == (fullYear + 1))) {
                        return "";
                      }

                      return monthAbbrev;
                    })
                    .tickSize(4)
                    .tickPadding(10)
                    .orient("bottom");

      var yAxis = d3.svg.axis()
                    .scale(y)
                    .innerTickSize(width)
                    .tickPadding(10)
                    .orient("left");


      svg.append("g")
          .attr("class", "x-axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

      svg.append("g")
          .attr("class", "y-axis")
          .attr("transform", "translate(" + width + ", 0)")
          .call(yAxis);

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
          .style("fill", function (d) {
            if ((d.date.toString().substring(4, 7) == "Jan") && (d.date.toString().substring(11, 15) == (fullYear + 1))) {
              return "none";
            }
            return "#003380";
          })
          .style("stroke", "none");

      if ($('.compareDownloads-checkbox').is(':checked')) {
        _.forEach(data.download, function (val, key) {
          var date = parseDate(key);
          if (date.toString().substring(11, 15) == fullYear) {
            downloads.push({date: parseDate(key), count: val})
          }
        });

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
              if ((d.date.toString().substring(4, 7) == "Jan") && (d.date.toString().substring(11, 15) == (fullYear + 1))) {
                return "none";
              }
              return "orange";
            })
            .style("stroke", "none");
      }

    });
  }

  function renderPieGraph(val, yearToShow) {
    var margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var parseDate = d3.time.format("%Y-%m").parse;

    var svg = d3.select(".metric").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.json("http://127.0.0.1:3000/listings/" + val + "/metrics", function(error, data) {
      var rgbColor = d3.rgb("#4DB8FF"),
          views = [],
          fullYear = (new Date(yearToShow, 0)).getFullYear(),
          lineData = [{"x1": width / 2, "y1": 0, "x2": width / 2, "y2": height},
                      {"x1": (width - height) / 2, "y1": height / 2, "x2": (width + height) / 2, "y2": height / 2}];
      
      _.forEach(data.view, function (val, key) {
        var date = parseDate(key);
        if (date.toString().substring(11, 15) == fullYear) {
          views.push({date: key, count: val})
        }
      });

      var highestViews = d3.max(views, function(d) { return d.count; }),
          radius = height / 2;

      var line = d3.svg.line()
                    .x(function (d) {
                      return d.x;
                    })
                    .y(function (d) {
                      return d.y;
                    })
                    .interpolate("linear");

      svg.selectAll("svg")
          .data(lineData)
          .enter()
          .append("line")
          .attr("class", "lines")
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
          });

      svg.selectAll("svg")
          .data(lineData)
          .enter()
          .append("line")
          .attr("class", "lines")
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
          .attr("transform", "rotate(30," + width / 2 + "," + height / 2 + ")");

      svg.selectAll("svg")
          .data(lineData)
          .enter()
          .append("line")
          .attr("class", "lines")
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
          .attr("transform", "rotate(60," + width / 2 + "," + height / 2 + ")");

      var miniCircles = svg.append("g")
                            .attr("class", "mini-circles");

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

      svg.selectAll("svg")
          .data(views)
          .enter()
          .append("path")
          .attr("d", arc)
          .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
          .attr("fill", function (d) {
            return rgbColor.darker((d.count * 2.5) / highestViews);
          })
          .attr("stroke", function (d) {
            return rgbColor.darker((d.count * 2.5) / highestViews);
          });

      var textHolder = svg.append("g")
                    .attr("class", "scale");

      for(var iteration = 5; iteration <= highestViews; iteration+=5) {
        textHolder.append("text")
                  .attr("x", width / 2)
                  .attr("y", (height / 2) + ((iteration * radius) / highestViews))
                  .text(iteration);
      }

    });

  }

});