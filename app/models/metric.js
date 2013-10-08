var mongoose = require('mongoose'),
    env = process.env.NODE_ENV || 'development',
    config = require('../../config/config')[env],
    Schema = mongoose.Schema
 
var MetricSchema = Schema({
  listing:    { type : Schema.ObjectId, ref : 'Listing' },
  profile:    { type : Schema.ObjectId, ref : 'Profile'},
  timestamp:  { type: String, default: Date.now },
  userAgent:  { type: String },
  siteUrl:    { type: String },
  metricType: { type: String, default: 'view' }, //view, download, comment, search
  attributes: {
    commentText: { type: String },
    commentRating: { type: Number },
    searchTerm: { type: String }
  }
  
});

MetricSchema.statics = {
  load: function (id, cb) {
    this.findOne({ _id : id })
      .populate('profile', 'fullName username email')
      .populate('listing', 'universalName displayName listingUrl')
      .exec(cb)
  },

  list: function(cb) {
    this.find()
      .populate('profile', 'fullName username email')
      .populate('listing', 'universalName displayName listingUrl')
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