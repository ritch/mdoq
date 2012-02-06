FAUX_DATA = {
  '/users': [
    {
      id: 0,
      name: "Bret Bobson",
      link: "http://www.site.com/1",
      username: "bretter",
      gender: "male"
    },
    {
      id: 1,
      name: "Jina Jobson",
      link: "http://www.site.com/2",
      username: "jinaj",
      gender: "female"
    },
    {
      id: 2,
      name: "Frank Frankson",
      link: "http://www.site.com/3",
      username: "franko",
      gender: "male"
    }
  ]
}

var protocol = 'faux://';

module.exports = function(req, res, next, use) {
  // implements a faux data source for easily testing mdoq-middleware
  
  var method = req.method
    , query = req.query
    , data = req.data
    , url = req.url || this.url
    , collection = FAUX_DATA[url]
    , results = []
    , i = 0
    , item
  ;
  
  function queryMatches(item) {
    var keys = query && Object.keys(query)
      , q = query && keys && keys.length && query
      , key
    ;
    
    while(q && (key = keys.shift())) {      
      if(q[key] != item[key]) return false;
    }
    
    return true;
  }
  
  if(typeof query == 'string') {
    return next(new Error('a query must be an object'));
  }
  
  if(method === 'POST') {
    data.id = collection.length;
    collection.push(data);
    res.data = {post: data};
  } else {
    while(item = collection[i++]) {    
      if(queryMatches(item)) {
        switch(method) {
          case 'DELETE':
            data = true;
          case 'PUT':
            var change = {};
            // for simplicity index == id
            collection[item.id] = change[method.toLowerCase()] = data;
            results.push(change);
          break;
          case 'GET':
            results.push(item);
          break;
        }
      }
    }
    
    res.data = (query && (query.id !== 'undefined')) ? results[0] : results;
  }

  
  next();
}