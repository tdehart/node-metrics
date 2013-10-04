var mongoose = require('mongoose'),
    Profile = mongoose.model('Profile'),
    _ = require('lodash');

exports.load = function(req, res, next, id){
  Profile.load(id, function (err, profile) {
    if (err) return next(err)
    if (!profile) return next(new Error('not found'))
    req.profile = profile
    next()
  })
}

exports.show = function(req, res) {
    res.send(req.profile)
}

exports.list = function(req, res) {
  Profile.list(function(err, profiles) {
    if (err) {
      res.send({'error':'An error has occurred'});
    }

    res.send(profiles)
  })
}

exports.create = function (req, res) {
  var profile = new Profile(req.body)

  profile.create(function (err) {
    if (err) {
      res.send({'error':'An error has occurred when creating'});
    } else {
      res.send(profile);
    }
  })
}

exports.update = function(req, res){
  var profile = req.profile
  profile = _.extend(profile, req.body)

  profile.update(function (err) {
    if (err) {
      res.send({'error':'An error has occurred when updating'});
    } else {
      res.send(profile);
    }
  })
}

exports.destroy = function(req, res){
  var profile = req.profile
  profile.destroy(function(err) {
    if (err) {
      res.send({'error':'An error has occurred when deleting'});
    } else {
      res.send("Deleted successfully")  
    }
  })
}
