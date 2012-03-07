/**
 * Proxy middleware.
 */

module.exports = function() { 
  var context = this;
  
  // middleware
  return function(req, res, next) {
    context.res = res;
    context.exec(req, function(err, result) {
      if(err) return next(err);
      
      // TODO support all mimes of connect - ditch send
      res.send(result);
    });
  }
};