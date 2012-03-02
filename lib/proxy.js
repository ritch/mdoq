/**
 * Proxy middleware.
 */

module.exports = function() {
  var context = this;
  
  // middleware
  return function(req, res, next) {     
    
    context.exec(req, function(err, result) {
      result = err || result;
      
      if(typeof result != 'string') {
        result = JSON.stringify(result);
      }
      
      res.end(result);
    });
  }
}