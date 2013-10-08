var mongoose = require('mongoose');
mongoose.Model.seed = function(entities) {
    var promise = new mongoose.Promise;
    this.create(entities, function(err) {
        if(err) { 
          console.log(err);
          promise.reject(err);
        }
        else {
          promise.resolve(); 
        }
    });
    return promise;
};