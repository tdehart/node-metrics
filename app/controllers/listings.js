var mongoose = require('mongoose'),
    Listing = mongoose.model('Listing'),
    Metric = mongoose.model('Metric'),
    _ = require('lodash');

exports.load = function(req, res, next, id){
  Listing.load(id, function (err, listing) {
    if (err) return next(err)
    if (!listing) return next(new Error('not found'))
    req.listing = listing
    next()
  })
}

exports.show = function(req, res) {
  res.send(req.listing)
}

exports.list = function(req, res) {
  Listing.list(function(err, listings) {
    if (err) {
      res.send({'error':'An error has occurred'});
    } else {
      res.send(listings)  
    }
  })
}

exports.metrics = function(req, res) {
  Metric.find({ listing : req.listing }, function (err, metrics) {
    if (err) {
      res.send({'error':'An error has occurred'});
    } else {
      var data = {view: {}, download: {}, comment: {}}
      _.forEach(metrics, function(m) {  
        var timestamp = m.timestamp.split('-')[0] + '-' + m.timestamp.split('-')[1]
        var type = m.metricType

        if (type == "comment") {
          if (data[type][timestamp]) {
            data[type][timestamp][m.attributes.commentRating] += 1
          } else {
            data[type][timestamp] = {1:0, 2:0, 3:0, 4:0, 5:0}
            data[type][timestamp][m.attributes.commentRating] += 1
          }
        } else {
          if (data[type][timestamp] > 0) {
            data[type][timestamp] += 1
          } else {
            data[type][timestamp] = 1
          }
        }
        
      });

      res.send(data)
    }
  })
}

exports.metrics2 = function(req, res) {
  var types = typeof req.param('type') !== 'undefined' ? _.flatten([req.param('type')]) : []
  var interval = req.param('interval')
  var options = {
    metricTypes: types,
    criteria: { listing: req.listing }
  }

  Metric.list(options, function(err, metrics) {
    if (err) {
      res.send({'error':'An error has occurred'});
    } else {
      metrics = getCounts(metrics, interval)
      res.send(metrics)
    }
  })
}

exports.create = function (req, res) {
  var listing = new Listing(req.body)

  listing.create(function (err) {
    if (err) {
      res.send({'error':'An error has occurred when creating'});
    } else {
      res.send(listing);
    }
  })
}

exports.update = function(req, res){
  var listing = req.listing
  listing = _.extend(listing, req.body)

  listing.update(function (err) {
    if (err) {
      res.send({'error':'An error has occurred when updating'});
    } else {
      res.send(listing);
    }
  })
}

exports.destroy = function(req, res){
  var listing = req.listing
  listing.destroy(function(err) {
    if (err) {
      res.send({'error':'An error has occurred when deleting'});
    } else {
      res.send("Deleted successfully")  
    }
  })
}

//Returns an object with the number of metrics for each type under a given time interval
//ex) {"view": [{"date": 2012, "count": 173}, {"date": 2011, "count": 159}], "download": [{"date": 2011,"count": 150}, ...}]}
var getCounts = function(metrics, interval) {
  var data = {view: [], download: [], comment: []}

  _.forEach(metrics, function(m) {  
    var timestamp = new Date(m.timestamp),
        time = [timestamp.getFullYear(), (timestamp.getMonth()+1), timestamp.getDate(), timestamp.getHours()],
        type = m.metricType

    switch(interval) {
      case 'hourly':
        //2012-05-31-5 (Year-Month-Date-Hour)
        time = time.join('-')
        break
      case 'daily':
        //2012-05-31 (Year-Month-Date)
        time = time.splice(0,3).join('-')
        break
      case 'monthly':
        //2012-05 (Year-Month)
        time = time.splice(0,2).join('-')
        break
      case 'yearly':
      default:
        //2012 (Year)
        time = time[0]
        break
    }
    
    //Find object by date so we can increase its count
    var date = _.find(data[type], function(d) {
      return d.date === time
    })

    //Increase count by 1 or create a new entry for that date
    if (date && date.count > 0) {
      date.count += 1
    } else {
      data[type].push({date: time, count: 1})
    }
  });

  return data;

}