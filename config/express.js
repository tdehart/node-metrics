var express = require('express')
  module.exports = function (app, config) {
    app.set('showStackError', true)

    app.configure(function () {
      app.use(express.logger('dev'));
      app.use(express.bodyParser());
    });
}