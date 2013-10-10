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
