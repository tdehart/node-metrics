$(function() {

  $('.listings-dropdown').change(function() {
    var val = $(this).val()

    $('.metric').remove()
    if (val !== "Select a listing") {
      $('.metrics').append('<div class="metric"></div>')
      renderGraph(val)
    }
  })

  function renderGraph(val) {
   var margin = {top: 20, right: 20, bottom: 30, left: 50},
       width = 960 - margin.left - margin.right,
       height = 500 - margin.top - margin.bottom;

    var parseDate = d3.time.format("%Y-%m").parse;

    var x = d3.time.scale()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var svg = d3.select(".metric").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.json("http://127.0.0.1:3000/listings/" + val + "/metrics", function(error, data) {
      this.views = []
      var self = this

      _.forEach(data.view, function(val, key) {
        self.views.push({date: parseDate(key), count: val})
      })

      x.domain(d3.extent(this.views, function(d) { return d.date; }));
      y.domain([0, d3.max(this.views, function(d) { return d.count; })]);


      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

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
          .data(this.views)
        .enter().append("rect")
          .attr("class", "bar")
          .attr("x", function(d) { return x(d.date); })
          .attr("width", 15)
          .attr("y", function(d) { return y(d.count); })
          .attr("height", function(d) { return height - y(d.count); });


    });
  }




});
