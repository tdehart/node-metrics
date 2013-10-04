var mongoose = require('mongoose'),
    env = process.env.NODE_ENV || 'development',
    config = require('../../config/config')[env],
    Schema = mongoose.Schema
 
var MetricSchema = Schema({
  //listing: {type : Schema.ObjectId, ref : 'Listing'},
  profile: {type : Schema.ObjectId, ref : 'Profile'},
  comment_text: {type: String, default: ''},
  comment_rating: {type: Number, min: 1, max: 5 },
  comment_date: {type: Date, default: Date.now},
  user_agent: {type: String, default: ''},
  site_url: {type: String, default: ''}
});

MetricSchema.statics = {
  load: function (id, cb) {
    this.findOne({ _id : id })
      .populate('profile', 'username email')
      .exec(cb)
  },

  list: function(cb) {
    this.find()
      .populate('profile', 'username email')
      .sort({ 'createdAt': -1 })
      .exec(cb)
  }
}

MetricSchema.methods = {
  create: function(cb) {
    this.save(cb)
  },

  update: function(cb) {
    this.save(cb)
  },

  destroy: function(cb) {
    this.remove(cb)
  }
}

var Metric = mongoose.model('Metric', MetricSchema);