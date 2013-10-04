var metrics = require('../app/controllers/metrics')

module.exports = function (app) {
  app.get('/metrics', metrics.list)
  app.get('/metrics/:id', metrics.show)
  app.post('/metrics', metrics.create)
  app.put('/metrics/:id', metrics.update)
  app.delete('/metrics/:id', metrics.destroy)

  app.param('id', metrics.load)

  app.get('/', metrics.list)
}