var mongodb = require('mongodb')

// example query
// users
//   .find({age: {$gt: 18}})
//   .update({legal: true})
//   .count()
//   // .limit(10)
//   .page(3, 10) // 3rd page, limit 10 - for convienence
//   .first(function(err, user) {
//     
//   })
// ;  

// example object
// {
//   action: 'update',
//   count: true,
//   updates: {legal: true},
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

  if(options.action === 'update') {
    args[0] = options.query;
    args[1] = options.updates;
  } else {
    // for find, insert, and remove
    // the first argument is either
    // the doc or a query
    args[0] = options.updates || options.query;
  }
  
  args.push(options.callback);
  
  db.collection(collection, function(err, collection) {
    collection[action].apply(this, args);
  });
};

exports.db = function(name) {
  // TODO - return a jdbq wrapped connection to mongodb
  //      - support various types of mongo connection strs
  //      - if called without any arguments, should return
  
  return this;
}
