require('../lib/middleware/mongodb');

var expect = require('chai').expect;

var mdoq = require('../')
  , user = {email: 'joe@bob.com', password: '1234', name: 'joe'}
  , users = mdoq.use('mongodb').use('test-db').use('users')
;


var cache = require('cache');

mdoq.use('cache', function(next, err, res) {
  var query = JSON.stringify(this.operation.query)
    , self = this;
  
  cache.get(query, function(err, res) {
    if(res) {
      self.res = res;
    }
    
    next(err);
  });
  
  self.use(function(next) {
    if(this.res) {
      cache.set(query, this.res);
    }
    next();
  })
  
})

var validator = require('validator');

mdoq.use('permissions', function(next) {
  validator.can(this.operation.action, this.operation.user, function(err, res) {
    if(res) {
      next();
    } else {
      next(err);
    }
  })
  if(this.res) {
    // validate results
  }
})


var users = 
    mdoq
      .use('cache')
      .use('validator')
      .use('permissions')
      .use('redis')
      .use('mongodb')
      .use('my-collection')

users.first(function() {
  
})
