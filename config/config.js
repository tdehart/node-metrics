var path = require('path')

module.exports = {
  development: {
    root: path.normalize(__dirname + '/..'),
    db: 'mongodb://localhost/test',
    seedData: true,
    app: {
      name: 'Metrics'
    }
  }
}