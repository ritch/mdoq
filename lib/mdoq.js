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
      , operation = this.operation
        || (this.operation = {})
    ;
    
    if(isAction) operation.action = type;
    
    // alias 
    if(type === 'update') {
      operation.action = 'put';
      type = 'put';
    }
    
    if(type === 'del') {
      operation.action = 'delete';
    }
    
    // defaults
    if(type === 'first') {
      operation.one = true;
    }
    
    if(type === 'count') {
      operation.count = true;
    }
    
    if(type === 'each') {
      operation.each = true;
    }
    
    if(type === 'sort') {
      operation.sort = arguments;
    }
    
    if(type === 'all') {
      operation.all = true;
    }
    
    // aggregate all arguments
    // until a function is provided
    while((arg = arguments[i++]) && !operation.callback) {      
      switch(typeof arg) {
        
        case 'object':
          type === 'put' || type == 'post'
            ? operation.data = arg
            : operation.query = arg
          ;
        break;
        
        case 'number':
          switch(type) {
            case 'skip':
              operation.skip = arg;
            break;
            case 'page':
              operation.page = operation.page || arg;
              if(operation.skip) {
                operation.limit = arg;
              } else {
                operation.skip = operation.limit * arg;
              }
            case 'first':
            case 'limit':
            case 'get':
              operation.limit = arg;
            break;
          }
          
        break;
        
        case 'function':
          operation.callback = arg;
        break;
        
      }
    }
    
    if(operation.limit > 1) {
      operation.one = false;
    }
    
    if(operation.one) {
      operation.limit = 1;
    }
    
    if(operation.callback) {
      // execute operation
      exec.call(this, operation);
      // reset operation
      this.operation = {};
    }
    
    return this;
  }
}

var exec = function(operation) {
  // add the last middleware
  // and create new context
  var self = this.use(function(next) {
    if(operation.callback && !operation.each) {
      operation.callback.call(self, self.err, self.res, self.total);
    }
    
    // there might be more middleware
    // added during other execution
    next();
  });
  
  self.operation = operation;
  
  function use(middleware) {
    self.middleware.push(middleware);
  }
  
  var current;
  
  (function next(err) {
    if(err = (err || self.err)) {
      if(typeof err == 'string') err = new Error(err);
      operation.errored = current;
      operation.callback.call(self, err);
    } else {
      current = self.middleware.shift();
      current && current.call(self, next, use);
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

if(module && module.exports) {
  module.exports = mdoq;
}
  
  
  
  
  
  
  
  
  
  
  