var mongoose = require('mongoose'),
    Listing = mongoose.model('Listing'),
    Metric = mongoose.model('Metric')


exports.index = function(req, res) {
  Listing.list(function(err, listings) {
    if (err) return res.render('500')
    res.render('vis/index', {
      title: 'Visualizations',
      listings: listings
    })
  })
}

exports.graphs = function(req, res) {
	Listing.list(function(err, listings) {
    if (err) return res.render('500')
    res.render('vis/graphs-index', {
      title: 'Visualizations',
      listings: listings
    })
  })
}
