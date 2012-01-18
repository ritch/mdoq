var mdoq = {};

mdoq.use = function() {
  // create a new object
  var self = Object.create(this);
    
  self.middleware = [];
  
  // copy old middleware
  if(this.middleware && this.middleware.length) {
    for(var i = 0; i < this.middleware.length; i++) {
      self.middleware[i] = this.middleware[i];
    }
  }

  // for named reference
  self.references = mdoq.references || (mdoq.references = {});

  // get middleware function
  var first = arguments[0]
    , last = arguments[arguments.length - 1]
    , name = (typeof first === 'string') && first
    , middleware = (typeof last === 'function') && last
  
  if(name && middleware) {
    // define a middleware reference
    self.references[name] = middleware;
    // everything is complete
    return self;
  } else if(name) {
    // use an existing middleware by name
    middleware = self.references[name];
  }
  
  // for context only calls
  if(!middleware) {
    self.context = self.context || [];
    self.context.push(name);
  }
  
  // add the current middleware
  middleware && self.middleware.push(middleware);
  
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
      operation.num = ++ops;
      // execute operation
      exec.call(this, operation);
      // reset operation
      this.operation = {};
    }
    
    return this;
  }
}

var ops = 0;

var exec = function(operation) {
  // add the final middleware
  // and create new context
  var self = this.use(function() {
    if(operation.callback && !operation.each) {
      operation.callback.call(self, self.err, self.res, self.total);
    }
  });

  var middleware = self.middleware
    , i = 0
  ;
  
  function next(err) {    
    if(err) {
      // end with final middleware
      self.err = err;
      middleware[middleware.length - 1].call(self);
    } else {
      middleware[++i].call(self, next);
    }
  }
  
  // start middleware by manually
  // calling the first
  middleware[0].call(self, next);
}

// actions
var actions = ['post', 'get', 'put', 'del'];

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
  
  
  
  
  
  
  
  
  
  
  