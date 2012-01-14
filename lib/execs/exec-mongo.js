var mongodb = require('mongodb')

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

exports.exec = function(options, collection) {
  var args = [];

  if(options.action === 'put') {
    args[0] = options.query;
    args[1] = options.data;
  } else {
    // for get, post, and del
    // the first argument is either
    // the doc or a query
    args[0] = options.data || options.query;
  }
  
  args.push(options.callback);
  
  db.collection(collection, function(err, collection) {
    collection[action].apply(this, args);
  });
};

exports.db = function(name) {
  // TODO - return a mdoq wrapped connection to mongodb
  //      - support various types of mongo connection strs
  //      - if called without any arguments, should return
  
  return this;
}
