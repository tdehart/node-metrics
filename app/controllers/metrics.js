var mongoose = require('mongoose'),
    Metric = mongoose.model('Metric'),
    Profile = mongoose.model('Profile'),
    _ = require('lodash')

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
      res.send({'error':'An error has occurred'});
    }

    res.send(metrics)
  })
}

exports.create = function (req, res) {
  var metric = new Metric(req.body)


  Profile.findOne({ email: req.body.profile }, function (err, profile) {
    metric.profile = profile._id
    metric.create(function (err) {
      if (err) {
        res.send({'error':'An error has occurred when creating'});
      } else {
        res.send(metric);
      }
    })
  });

  
}

exports.update = function(req, res){
  var metric = req.metric
  metric = _.extend(metric, req.body)

  metric.update(function (err) {
    if (err) {
      res.send({'error':'An error has occurred when updating'});
    } else {
      res.send(metric);
    }
  })
}

exports.destroy = function(req, res){
  var metric = req.metric
  metric.destroy(function(err) {
    if (err) {
      res.send({'error':'An error has occurred when deleting'});
    } else {
      res.send("Deleted successfully")  
    }
  })
}
