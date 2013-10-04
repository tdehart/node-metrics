var mongoose = require('mongoose'),
    env = process.env.NODE_ENV || 'development',
    config = require('../../config/config')[env],
    Schema = mongoose.Schema

var ListingSchema = Schema({
  displayName: {type: String, default: ''},
  universalName: {type: String, default: ''},
  listingUrl: {type: String, default: ''}
});

mongoose.model('Listing', ListingSchema)