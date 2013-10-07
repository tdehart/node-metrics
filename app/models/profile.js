var mongoose = require('mongoose'),
    env = process.env.NODE_ENV || 'development',
    config = require('../../config/config')[env],
    Schema = mongoose.Schema

var ProfileSchema = Schema({
  fullName: {type: String, default: ''},
  username: {type: String, default: ''},
  email: {type: String, default: ''}
});

ProfileSchema.statics = {
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

ProfileSchema.methods = {
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

var Profile = mongoose.model('Profile', ProfileSchema);