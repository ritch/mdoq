var map = {
  'GET': 'get',
  'POST': 'post',
  'PUT': 'put',
  'DELETE': 'del'
}

module.exports = function() {
  var context = this;
  
  // express middleware
  return function(req, res, next) {
    if(req.method === 'PUT') {
      context.get(req.query);
    }
        
    context.exec(req, function(err, result) {
      res.send(result || err);
    });
  }
}