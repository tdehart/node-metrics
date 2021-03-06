$(function() {

  $('.listings-dropdown').change(function() {
    var val = $(this).val()

    $('.metric').remove()
    if (val !== "None") {
      $('.metrics').append('<div class="metric"></div>')
      renderGraph(val, "monthly")
    }
  })

  function renderGraph(val, interval) {
   var margin = {top: 20, right: 40, bottom: 40, left: 20},
       width = 1280 - margin.left - margin.right,
       height = 800 - margin.top - margin.bottom;

    var x = d3.time.scale().rangeRound([0, width])
    var y = d3.scale.linear().range([height, 0]);
    
    var parseDate = d3.time.format("%Y-%m").parse;

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(d3.time.month, 1)
        .tickFormat(d3.time.format("%b"))
        .tickSize(0)

    var xAxis2 = d3.svg.axis()
        .scale(x)
        .orient("top")
        .ticks(d3.time.year, 1)
        .tickSize(0)

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var svg = d3.select(".metric").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.json("http://127.0.0.1:3000/listings/" + val + "/metrics2?interval=" + interval, function(error, data) {
      _.forEach(data.view, function(d) {
        d.date = parseDate(d.date.toString())
      })

      x.domain(d3.extent(data.view, function(d) { return d.date; }));
      y.domain([0, d3.max(data.view, function(d) { return d.count; })]);


      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
          .style("text-anchor", "end")
          .attr("dx", "2.0em")
          .attr("dy", ".85em")

      svg.append("g")
        .attr("class", "x axis axis2")
        .attr("transform", "translate(0," + (height + 40) + ")")
        .call(xAxis2)
        .selectAll("text")
          .style("text-anchor", "end")
          .attr("dx", "2.2em")

      svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Views");

       svg.selectAll(".bar")
          .data(data.view)
        .enter().append("rect")
          .attr("class", "bar")
          .attr("x", function(d) { 
            return x(d.date); 
          })
          .attr("width", 25)
          .attr("y", function(d) { 
            return y(d.count); 
          })
          .attr("height", function(d) { 
            return height - y(d.count); 
          });

    });
  }
});
