var mongoose = require('mongoose'),
    env = process.env.NODE_ENV || 'development',
    config = require('../../config/config')[env],
    Schema = mongoose.Schema

var UserSchema = Schema({
  username: {type: String, default: ''},
  email: {type: String, default: ''}
});

mongoose.model('User', UserSchema)