var mdoq = module.exports = {}
  , collection = 
;

mdoq.collection = require('./collection');

// provide a layer to use
// for executing db commands
mdoq.use = function(layer) {
  mdoq.exec = layer.exec;
  mdoq.db = layer.db;
  
  return mdoq;
}

// by default
// use mongodb
mdoq.use(require('./execs/exec-mongo'));