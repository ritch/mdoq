var util = require('util')
  , tty = require('tty')
  , isatty = tty.isatty(1) && tty.isatty(2)
  , useColors = isatty
;

var colors = {
    'error': 31
  , 'bright yellow': 93
  , 'fast': 90
  , 'medium': 33
  , 'slow': 31
  , 'green': 32
  , 'light': 90
};

var slow = 75;

function color(type, str) {
  if (useColors) str = '\033[' + colors[type] + 'm' + str + '\033[0m';
  return str;
}

module.exports = function(next, use) {
 
  // adds useful debug output to any mdoq operation

  var operation = this.operation
    , ind = '  '
    , output = ''
    , started = new Date().getTime()
  ;

  function write(str, indents) {
    var tab = '';
    
    while(indents--) {
      tab += ind;
    }
    
    str = tab + str.replace(/\n/g, '\n' + tab);
    
    output += '\n' + str;
  }

  write(this.url || operation.url);

  if(operation.query) {
    write('query', 1);
    write(color('light', util.inspect(operation.query)), 2);
  }

  if(operation.data) {
    write('data', 1);
    write(color('light', util.inspect(operation.data)), 2);
  }

  // wrap callback for error reporting
  
  var cb = this.operation.callback;
  
  this.operation.callback = function(err, res) {
    var duration = new Date().getTime() - started;
    var medium = slow / 2;
    var speed = duration > slow
          ? 'slow'
          : duration > medium
            ? 'medium'
            : 'fast'
    ;
    
    write('response ' + color(speed, '(' + duration + 'ms)'), 1);
    write(color('light', util.inspect(res || 'no response was sent')), 2)

    if(err) {
      write('error', 1);
      Error.captureStackTrace(err, arguments.callee);
      write(color('error', err.stack), 2);
      console.error(output);
    } else {
      console.info(output);
    }
    
    cb.apply(this, arguments);
  }

  next();
}