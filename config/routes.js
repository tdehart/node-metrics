var metrics = require('../app/controllers/metrics'),
    profiles = require('../app/controllers/profiles')

module.exports = function (app) {
  app.get('/metrics', metrics.list)
  app.get('/metrics/:id', metrics.show)
  app.post('/metrics', metrics.create)
  app.put('/metrics/:id', metrics.update)
  app.delete('/metrics/:id', metrics.destroy)
  app.param('id', metrics.load)

  app.get('/profiles', profiles.list)
  app.get('/profiles/:profileId', profiles.show)
  app.post('/profiles', profiles.create)
  app.put('/profiles/:profileId', profiles.update)
  app.delete('/profiles/:profileId', profiles.destroy)
  app.param('profileId', profiles.load)

  app.get('/', metrics.list)
}