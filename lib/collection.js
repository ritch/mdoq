var jdbq = require('jdbq')
  , exec = jdbq.exec
  , Collection = {};

module.exports = function(name) {
  var inst = Object.create(Collection);
  inst.name = name;
  return inst;
}

function modify(type, isAction) {
  return function() {
    var arg
      , i
      , options = this.options
        || (this.options = {})
    ;
    
    if(isAction) options.action = type;
    
    // defaults
    if(type === 'first') {
      options.limit = 1;
      options.one = true;
    }
    
    if(type === 'count') {
      options.count = true;
    }
    
    // aggregate all arguments
    // until a function is provided
    while((arg = arguments[i++]) && !options.callback)
      switch(typeof arg) {
        
        case 'object':
          type === 'update' || type == 'insert'
            ? options.updates = arg
            : options.query = arg
          ;
        break;
        
        case 'number':
          if(type === 'first' || type === 'limit')
            options.limit = arg;
          if(type === 'skip') {
            i < 1
              ? options.skip
              : options.limit
            ;
          }
        break;
        
        case 'function':
          options.callback = arg;
        break;
        
      }
    }
    
    options.callback && exec(options, this.name);
    
    return this;
  }
}

// actions
['insert', 'find', 'update', 'remove']
.forEach(function(modifier) {
  Collection[modifier] = modify(modifier, true);
});

// modifiers
['first', 'find', 'update', 'remove', 'all', 'skip', 'count', 'take']
.forEach(function(modifier) {
  Collection[modifier] = modify(modifier);
});