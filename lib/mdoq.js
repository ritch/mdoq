var mdoq = {};

mdoq.preware = function() {
  // return a copy of current middleware
  var middleware = this.middleware
    , len = middleware && middleware.length
    , result = []
    , i = 0;
    
  for(; i < len; i++) result[i] = middleware[i];
  
  return result;
};

mdoq.use = function(fn) {
  // create a new context
  var self = Object.create(this);
  
  // a scope for this context's middleware
  self.middleware = this.preware();
  
  if(typeof fn === 'string') {
    // url context only
    self.url = (self.url || '') + fn;
  } else {
    // add middleware
    self.middleware.push(fn);
  }

  // for chaining
  return self;
};


var modify = function(type, isAction) {
  return function() {
    var arg
      , i = 0
      , req = this.req
        || (this.req = {})
    ;
    
    if(isAction) req.action = type;
    
    // alias 
    if(type === 'update') {
      req.action = 'put';
      type = 'put';
    }
    
    if(type === 'del') {
      req.action = 'delete';
    }
    
    // defaults
    if(type === 'first') {
      req.one = true;
    }
    
    if(type === 'count') {
      req.count = true;
    }
    
    if(type === 'each') {
      req.each = true;
    }
    
    if(type === 'sort') {
      req.sort = arguments;
    }
    
    if(type === 'all') {
      req.all = true;
    }
    
    // aggregate all arguments
    // until a function is provided
    while((arg = arguments[i++]) && !req.callback) {      
      switch(typeof arg) {
        
        case 'object':
          type === 'put' || type == 'post'
            ? req.data = arg
            : req.query = arg
          ;
        break;
        
        case 'number':
          switch(type) {
            case 'skip':
              req.skip = arg;
            break;
            case 'page':
              req.page = req.page || arg;
              if(req.skip) {
                req.limit = arg;
              } else {
                req.skip = req.limit * arg;
              }
            case 'first':
            case 'limit':
            case 'get':
              req.limit = arg;
            break;
          }
          
        break;
        
        case 'function':
          req.callback = arg;
        break;
        
      }
    }
    
    if(req.limit > 1) {
      req.one = false;
    }
    
    if(req.one) {
      req.limit = 1;
    }
    
    if(req.callback) {
      // execute req
      exec.call(this, req);
      // reset req
      this.req = {};
    }
    
    return this;
  }
}

var exec = function(req) {
  // add the last middleware
  // and create new context
  var self = this.use(function(req, res, next) {
    if(req.callback && !req.each) {
      req.callback.call(self, self.err, self.res, self.total);
    }
    
    // there might be more middleware
    // added during other execution
    next();
  });
  
  self.req = req;
  
  function use(middleware) {
    self.middleware.push(middleware);
  }
  
  var current;
  
  (function next(err) {
    if(err = (err || self.err)) {
      if(typeof err == 'string') err = new Error(err);
      req.errored = current;
      req.callback.call(self, err);
    } else {
      current = self.middleware.shift();
      current && current.call(self, req, self.res, next, use);
    }
  })()
}

// actions
var actions = ['post', 'get', 'put', 'update', 'del'];

actions.forEach(function(modifier) {
  mdoq[modifier] = modify(modifier, true);
});

// modifiers
var modifiers = ['first', 'all', 'skip', 'count', 'limit', 'page', 'each', 'all', 'sort'];

modifiers.forEach(function(modifier) {
  mdoq[modifier] = modify(modifier);
});

mdoq.require = function(module) {
  return this.use(require(module));
}

mdoq.proxy = require('./proxy');

mdoq.util = {
  debug: require('./debug'),
  faux: require('./faux')
};

if(module && module.exports) {
  module.exports = mdoq;
}
  

  
  
  
  
  
  
  
  