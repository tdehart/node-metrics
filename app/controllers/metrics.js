var mongoose = require('mongoose'),
    Metric = mongoose.model('Metric'),
    Profile = mongoose.model('Profile'),
    Listing = mongoose.model('Listing'),
    _ = require('lodash'),
    async = require('async')

exports.load = function(req, res, next, id){
  Metric.load(id, function (err, metric) {
    if (err) return next(err)
    if (!metric) return next(new Error('not found'))
    req.metric = metric
    next()
  })
}

exports.show = function(req, res) {
    res.send(req.metric)
}

exports.list = function(req, res) {
  Metric.list(function(err, metrics) {
    if (err) {
      res.send({'error':'An error has occurred'})
    }

    res.send(metrics)
  })
}

exports.create = function (req, res) {
    //Find profile by email and listing by universalName in parallel then create metric
    async.parallel([
      function (cb) {
        Profile.findOne({ email: req.body.profile }, function (err, profile) {
          cb(err, profile)
        })
      },
      function (cb) {
        Listing.findOne({ universalName: req.body.listing }, function (err, listing) {
          cb(err, listing)
        })
      }
    ],

    function(err, results) {
      if (err) {
        res.send({'error':'An error has occurred while finding metric references'})
      } else {
        var metric = new Metric({
          commentText: req.body.commentText,
          commentRating: req.body.commentRating,
          commentDate: req.body.commentDate,
          userAgent: req.body.userAgent,
          siteUrl: req.body.siteUrl,
          profile: results[0]._id,
          listing: results[1]._id
        })

        metric.create(function (err) {
          if (err) {
            res.send({'error':'An error has occurred when creating'})
          } else {
            res.send(metric);
          }
        })  
      }
    })
}

exports.update = function(req, res){
  var metric = req.metric
  metric = _.extend(metric, req.body)

  metric.update(function (err) {
    if (err) {
      res.send({'error':'An error has occurred when updating'})
    } else {
      res.send(metric);
    }
  })
}

exports.destroy = function(req, res){
  var metric = req.metric
  metric.destroy(function(err) {
    if (err) {
      res.send({'error':'An error has occurred when deleting'})
    } else {
      res.send("Deleted successfully")  
    }
  })
}
