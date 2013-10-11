var express = require('express'),
    helpers = require('view-helpers'),
    pkg = require('../package.json')


  module.exports = function (app, config) {
    app.set('showStackError', true)

      // should be placed before express.static
    app.use(express.compress({
      filter: function (req, res) {
        return /json|text|javascript|css/.test(res.getHeader('Content-Type'))
      },
      level: 9
    }))

    app.use(express.favicon())
    app.use(express.static(config.root + '/public'))

    // set views path, template engine and default layout
    app.set('views', config.root + '/app/views')
    app.set('view engine', 'jade')

    app.configure(function () {
      app.use(function (req, res, next) {
        res.locals.pkg = pkg
        next()
      })

    app.use(helpers(pkg.name))

    app.use(express.logger('dev'));
    app.use(express.bodyParser());

    // routes should be at the last
    app.use(app.router)

    // app.use(function(req, res, next){
    //   res.locals.csrf_token = req.csrfToken()
    //   next()
    // })

    app.locals.pretty = true
    
  });
}