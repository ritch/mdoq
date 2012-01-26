var EventEmitter = require('events').EventEmitter
  , mongodb = require('mongodb')
  , mdoq = require('mdoq')
  , Server = mongodb.Server
  , Db = mongodb.Db
;

// example query
// users
//   .get({age: {$gt: 18}})
//   .put({legal: true})
//   .count()
//   // .limit(10)
//   .page(3, 10) // 3rd page, limit 10 - for convienence
//   .first(function(err, user) {
//     
//   })
// ;  

// example object
// {
//   action: 'put',
//   count: true,
//   data: {legal: true},
//   query: {age: {$gt: 18}},
//   limit: 1, // 10 overriden to 1
//   skip: 30, // limit was at 10 (x 3 pages)
//   first: true, // only include 1 result in callback
//   callback: function(user) {
//     // body...
//   }
// }

// alias middleware
mdoq.use(function(next) {
  var context = this.context[0];
  if(context.indexOf('mongo://') === 0) {
    // parse url
    parsed.url = url.parse(context);
    this.host = parsed.hostname;
    this.port = parsed.port && Number(parsed.port);
    if(parsed.auth) {
      var auth = auth.split(':');
      this.user = auth[0];
      this.password = auth[1];
    }
    if(parsed.path) {
      var path = parsed.path.split('/');
      this.db = path[0];
      this.collection = path[1];
    }
    this.context = [];
    
    // manually call mongodb middleware
    if(this.references && this.references.mongodb) {
      this.references.mongodb.call(this, next);
    } else {
      next(new Error('MongoDB Middleware was not found!'));
    }
  }
  
  next();
})

mdoq.use('mongodb', function(next) {
  
  var partMap = ['host', 'db', 'collection']
    , context = this.context
    , clen = context.length
    , i = clen
    , partName
    , part
  ;
  
  // if there already is a response
  // dont bother querying the db
  // if(this.res) {
  //   
  //   if(this.operation.each && this.res.length > 0) {
  //     var item;
  //     while(item = this.res.shift()) {
  //       this.operation.callback.call(self, null, item);
  //     }
  //   }
  //   
  //   return next();
  // }
  
  while(i--) {
    partName = partMap.pop();
    part = context[i];
    
    if(typeof part == 'number') {
      partName = 'port';
    }
    
    this[partName] = part;
  }
  
  var self = this
    , dbName = this.db
    , collection = this.collection
    , port = this.port || 27017
    , host = this.host || 'localhost'
  ;
  
  if(!dbName) {
    return next(new Error('When executing a mongodb operation, a db name was not provided'));
  }
  
  if(!collection) {
    return next(new Error('When executing a mongodb operation, a collection name was not provided'));
  }
  
  // execution
  var args = []
    , operation = this.operation
  ;

  operation.action = operation.action || 'get';

  // default query
  operation.query = operation.query || {};

  if(operation.action === 'put') {
    args[0] = operation.query;
    args[1] = operation.data;
  } else {
    // for get, post, and del
    // the first argument is either
    // the doc or a query
    args[0] = operation.data || operation.query;
  }

  if(operation.action !== 'get') {
    args.push(function(err, result) {
      self.err = err;
      self.res = result;
      next(self.err);
    });
  }
  
  var dbs = mdoq.dbs || (mdoq.dbs = {})
    , key = [host, port, dbName].join('/')
    , db = dbs[key] || (dbs[key] = new Db(dbName, new Server(host, port)))
    , user = this.user
    , queue = db.queue || (db.queue = new EventEmitter());
    
  var actions = {
    'get': 'find',
    'put': 'update',
    'post': 'insert',
    'delete': 'remove'
  };
  
  function ready(err, db) {
    if(err) {
      next(err);
    } else {
      db.collection(collection, function(err, collection) {
        if(operation.action === 'get') {
          
          // cursor
          var cursor = collection.find.apply(collection, args)
            , limit = operation.limit || -1
            , index = 0;
          
          if(operation.skip) {
            cursor.skip(operation.skip);
          }
          
          if(operation.sort) {
            cursor.sort.apply(cursor, operation.sort);
          }
          
          cursor.nextObject(function iterator(err, doc) {
            if(doc && limit--) {
              
              if(operation.each) {
                operation.callback.call(self, err, doc, index);
              }
              
              if(operation.one) {
                self.res = doc;
                next(err);
                return;
              } else {
                self.res = self.res || [];
                self.res.push(doc);
              }
              
              index++;
              
              // recurse
              cursor.nextObject(iterator);
            } else {
              if(!err && operation.count) {
                cursor.count(function(err, count) {
                  self.total = count;
                  next(err);
                })
              } else {
                next(err); 
              }
            }
          });
        } else {
          collection[actions[operation.action]].apply(collection, args);
        }
      });
    }
  }
  
  if(db.isConnected) {
    ready(null, db);
  } else if(db.isConnecting) {
    db.queue.once('connected', ready);
  } else {
    // first connection
    db.queue.once('connected', ready);
    // set status
    db.isConnecting = true;
    db.open(function(err, db) {
      if(!err && user) {
        db.authenticate(auth[0], auth[1], function(err, success){
          if(success) {
            db.isConnected = true;
            db.queue.emit('connected', null, db);
          }
          else {
            next(err || (new Error('Could not authenticate user ' + user)));
          }
        });
      } else {    
          db.isConnected = true;
          db.isConnecting = false;
          db.queue.emit('connected', err, db);
      }
    });
  }

});