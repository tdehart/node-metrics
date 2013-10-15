$(function() {

  $('.listings-dropdown').change(function() {
    var val = $(this).val()
    console.log(val)

    $('.metric').remove()
    if (val !== "Select a listing") {
      $('.metrics').append('<div class="metric"></div>')
      renderGraph(val)  
    }
  })

  function renderGraph(val) {
    // var margin = {top: 20, right: 20, bottom: 30, left: 40},
    // width = 960 - margin.left - margin.right,
    // height = 500 - margin.top - margin.bottom;

    // var formatPercent = d3.format(".0%");

    // var x = d3.scale.ordinal()
    //     .rangeRoundBands([0, width], .1);

    // var y = d3.scale.linear()
    //     .range([height, 0]);

    // var xAxis = d3.svg.axis()
    //     .scale(x)
    //     .orient("bottom");

    // var yAxis = d3.svg.axis()
    //     .scale(y)
    //     .orient("left")
    //     .tickFormat(formatPercent);

    // var svg = d3.select("metric").append("svg")
    //     .attr("width", width + margin.left + margin.right)
    //     .attr("height", height + margin.top + margin.bottom)
    //   .append("g")
    //     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.json("http://127.0.0.1:3000/listings/" + val + "/metrics", function(error, data) {
      console.log(data.view)

      console.log(_.keys(data.view))

      console.log(_.keys(data.view).sort())


      // x.domain(data.map(function(d) { return d.letter; }));
      // y.domain([0, d3.max(data, function(d) { return d.frequency; })]);

      // svg.append("g")
      //     .attr("class", "x axis")
      //     .attr("transform", "translate(0," + height + ")")
      //     .call(xAxis);

      // svg.append("g")
      //     .attr("class", "y axis")
      //     .call(yAxis)
      //   .append("text")
      //     .attr("transform", "rotate(-90)")
      //     .attr("y", 6)
      //     .attr("dy", ".71em")
      //     .style("text-anchor", "end")
      //     .text("Frequency");

      // svg.selectAll(".bar")
      //     .data(data)
      //   .enter().append("rect")
      //     .attr("class", "bar")
      //     .attr("x", function(d) { return x(d.letter); })
      //     .attr("width", x.rangeBand())
      //     .attr("y", function(d) { return y(d.frequency); })
      //     .attr("height", function(d) { return height - y(d.frequency); });

    });

    // function type(d) {
    //   d.frequency = +d.frequency;
    //   return d;
    // }
  }




});
