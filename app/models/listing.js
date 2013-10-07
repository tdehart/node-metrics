var mongoose = require('mongoose'),
    env = process.env.NODE_ENV || 'development',
    config = require('../../config/config')[env],
    Schema = mongoose.Schema

var ListingSchema = Schema({
  displayName: {type: String, default: ''},
  universalName: {type: String, default: ''},
  listingUrl: {type: String, default: ''}
});

ListingSchema.statics = {
  load: function (id, cb) {
    this.findOne({ _id : id })
      .exec(cb)
  },

  list: function(cb) {
    this.find()
      .sort({ 'createdAt': -1 })
      .exec(cb)
  }
}

ListingSchema.methods = {
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

mongoose.model('Listing', ListingSchema)