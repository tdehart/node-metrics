var express = require('express'),
    fs = require('fs')

var env = process.env.NODE_ENV || 'development',
    config = require('./config/config')[env],
    mongoose = require('mongoose')

var db = mongoose.connection;
mongoose.connect(config.db)
 
var app = express();
require('./config/express')(app, config)

var models_path = __dirname + '/app/models'
fs.readdirSync(models_path).forEach(function (file) {
  if (~file.indexOf('.js')) require(models_path + '/' + file)
})

require('./config/routes')(app)
 
// Start the app by listening on <port>
var port = process.env.PORT || 3000
app.listen(port)
console.log('Metrics app started on port '+ port)

db.on('error', console.error);
db.once('open', function() {
  console.log("Database open")

  // Metric = mongoose.model('Metric')
  // var metric = new Metric({comment_text: "Example comment"})
  // metric.save()

});

// expose app
exports = module.exports = app