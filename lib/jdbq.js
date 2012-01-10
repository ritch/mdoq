var jdbq = module.exports = {}
  , collection = 
;

jqdb.collection = require('./collection');

// provide a layer to use
// for executing db commands
jdbq.use = function(layer) {
  jdbq.exec = layer.exec;
  jdbq.db = layer.db;
  
  return jdbq;
}

// by default
// use mongodb
jdbq.use(require('./execs/exec-mongo'));