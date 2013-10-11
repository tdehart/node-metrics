var mongoose = require('mongoose'),
    Listing = mongoose.model('Listing'),
    Metric = mongoose.model('Metric')


exports.index = function(req, res) {
  Metric.list(function(err, metrics) {
    if (err) return res.render('500')
    res.render('vis/index', {
      title: 'Visualizations',
      metrics: metrics
    })
  })
}