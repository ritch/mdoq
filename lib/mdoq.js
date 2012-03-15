var mdoq = {};

mdoq.use = function(fn) {
  // create a seperate execution context
  var self = Object.create(this);
  
  // previous middleware
  var middleware = this.middleware || (this.middleware = [])
    , len = middleware && middleware.length
    , i = 0;
  
  // reset middleware
  self.middleware = [];
  
  // copy previous middleware
  for(; i < len; i++) self.middleware[i] = middleware[i];
  
  // if provided a stack mix it in
  if(fn && fn.middleware) {
    for(var i = 0, len = fn.middleware.length; i < len; i++) {
      this.middleware.push(fn.middleware[i]);
    }
    
    // mix in any modifiers
    var _self = this;
    Object.keys(fn).forEach(function (key) {
      if(typeof fn[key] === 'function' && !this[key]) {
        _self[key] = fn[key];
      }
    })
    
    // finished
    return this;
  }
  
  if(typeof fn === 'string') {
    // url shortcut
    self.url = (self.url || '') + fn;
  } else {
    // add middleware
    self.middleware.push(fn);
    // mixin modifiers
    Object.keys(fn).forEach(function (key) {
      if(typeof fn[key] === 'function') {
        self[key] = fn[key];
      }
    })
  }

  // for chaining
  return self;
}; 

mdoq.exec = function(req, callback, out) {
  var each = typeof out == 'function' && out
    , stream = typeof out == 'object' && out
    , headers = this.req && this.req.headers 
    , res = this.res || {status: 200, headers: {}, stream: stream}
    , lastError
  ;
  
  // add the last middleware
  // and create new context
  var self = this.use(function(req, res, next) {    
    var output = res.data || res.body;
    
    if(callback) {
      callback.call(self, lastError, output, req, res);
    }
    
    // there might be more middleware
    // added during other execution
    next();
  });
  
  // setup the request
  self.req = req || {};
  self.req.headers = headers || self.req.headers || {};
  self.req.url = self.req.url || self.url;
  self.req.method = req.method || 'GET';
  self.req.data = self.req.data || self.req.body;
  
  // setup the response
  self.res = res || {};
  self.res.headers = {};
  self.res.status = 200;
  
  // reset request
  this.req = undefined;
  
  // post execution middleware
  function use(middleware) {
    
    // output-ware is always last
    var last = self.middleware.pop();
    
    // add simple middleware to end
    if(typeof middleware == 'function') {
      self.middleware.push(middleware);
    } else if(middleware.middleware) {
      // add nested middleware to end
      for(var i = 0, mw = middleware.middleware, len = mw.length; i < len; i++) {
        self.middleware.push(mw[i]);
      }
    }
    
    // readd output-ware
    self.middleware.push(last);
    
    return self;
  }
  
  var current;
  
  (function next(err, part, repeat) {
    if(err) {
      if(typeof err == 'string') err = new Error(err);
      lastError = err;
      req.errored = current;
      callback.call(self, err);
    } else {
      // when a part was provided
      // write it to the stream
      if(part && res.stream) {
        res.stream.write(res.serialize(part));
      }
      
      if(!repeat) current = self.middleware.shift();
      current && current.call(self, req, res, next, use);
    }
  })()
}


// exec aliases
var method, methods = ['post', 'get', 'put', 'update', 'del'];

// http map
var map = {get: 'GET', post: 'POST', put: 'PUT', update: 'PUT', del: 'DELETE'};

while(method = methods.shift()) {
  (function(method) {
    mdoq[method] = function() {
      var last = arguments[arguments.length - 1]
        , req = this.req || (this.req = {})
        , callback = typeof last == 'function' && last
        , i = 0
        , type
        , arg
      ;

      // retain method
      req.method = map[method];

      while((arg = arguments[i++]) && typeof arg == 'object') {
        req.method === 'PUT' || req.method == 'POST'
           ? req.data = req.body = arg
           : req.query = arg
         ;
      }

      if(callback) {
        // execute the request
        this.exec(req, callback);
        // reset request
        this.req = {};
      }

      return this;
    }
  })(method);
}

if(typeof module !== 'undefined' && module.exports) {
  // require proxy to avoid module passing
  mdoq.require = function(module) {
    return this.use(require(module));
  }
  
  // connect/express proxy
  mdoq.proxy = require('./proxy');
  
  // callback for on each res.stream.write
  mdoq.each = function(callback) {
    this.exec(this.req, null, callback);
    return this;
  }
  
  // debug and testing utils
  mdoq.util = {
    debug: require('./debug'),
    faux: require('./faux')
  };
  
  // export
  module.exports = mdoq;
}
  

  
  
  
  
  
  
  
