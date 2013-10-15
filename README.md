# Node.js Metrics

This is a prototype Node.js application for recording metrics from [OWF](https://github.com/ozoneplatform/owf) servers

## Install

**NOTE:** You need to have Node.js and MongoDB installed and running.

```sh
  $ git clone https://github.com/tdehart/node-metrics.git
  $ npm install
  $ node generate_seed_data
  $ node server
```

Then visit [http://localhost:3000/](http://localhost:3000/)

## Directory structure
```
-app/
  |__controllers/
  |__models/
  |__views/
-config/
  |__routes.js
  |__config.js
  |__express.js (express.js configs)
-public/
  |__css
  |__fonts
  |__img
  |__js
```