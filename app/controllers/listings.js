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
