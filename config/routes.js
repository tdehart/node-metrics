var metrics = require('../app/controllers/metrics'),
    profiles = require('../app/controllers/profiles'),
    listings = require('../app/controllers/listings'),
    vis = require('../app/controllers/vis')

module.exports = function (app) {
  app.get('/metrics', metrics.list)
  app.get('/metrics/:metricId', metrics.show)
  app.post('/metrics', metrics.create)
  app.put('/metrics/:metricId', metrics.update)
  app.delete('/metrics/:metricId', metrics.destroy)
  app.param('metricId', metrics.load)

  app.get('/vis', vis.index)
  app.get('/vis/graphs', vis.graphs)

  app.get('/profiles', profiles.list)
  app.get('/profiles/:profileId', profiles.show)
  app.post('/profiles', profiles.create)
  app.put('/profiles/:profileId', profiles.update)
  app.delete('/profiles/:profileId', profiles.destroy)
  app.param('profileId', profiles.load)

  app.get('/listings', listings.list)
  app.get('/listings/:listingId', listings.show)
  app.post('/listings', listings.create)
  app.put('/listings/:listingId', listings.update)
  app.delete('/listings/:listingId', listings.destroy)
  app.get('/listings/:listingId/metrics', listings.metrics)
  app.get('/listings/:listingId/metrics2', listings.metrics2)
  app.param('listingId', listings.load)

  app.get('/', metrics.list)
}