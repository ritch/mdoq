Middleware follows two general guidelines:

 - `req` and `res` are only data - they do not support any methods
 - `next` should be called when complete with an optional error and an optional data object

The goal of a middleware is to use the input `req` to modify or generate output `res`.

**Output**

Output of an mdoq middlware chain can be returned all at once or piped to a stream. Each middleware
must decide to either write against the `res` object itself or to the `res` stream.

Examples

    mdoq
    .use(function(req, res, next) {
      // send the data of the req to the res
      res.json = req.query || req.data;

      next();
    })
    .get({foo: 'bar'}, function(err, res) {
      console.info(res); // {"foo": "bar"}
    })


    // streaming response

    var db = mdoq
    .use(function(req, res, next) {
      db.get(req.query).toCursor().next(function(err, item) {
        // this will hand the item to the output pipe
        // passing true as a third argument will call this middleware again
        next(err, item, !!item);
      })
    })
    .pipe(res);


    // supporting both is badass!

    mdoq
    .use(function(req, res, next) {
      if(req.header.streaming) {
        db[req.method](req.query).toCursor().next(function(err, item) {
          // this will hand the item to the output pipe
          // passing true as a third argument will call this middleware again
          next(err, item, !!item);
        })
      } else {
        db[req.method](req.query, function(err, result) {
          // since the entire db result is in this result
          // we will just add it to the res.json object
          // and let other middleware worry about it
          (res.json || (res.json = {})).result = result;
          next(err);
        })
      }
    })
    ;

    // buffered
    db.get({my: 'query'}, function(err, res) {
    console.info(res); // from db: [{my: 'query'}, {my: 'query'}, {my: 'query'}]
    })

    // streaming
    var stream = require('fs').createWriteStream('./db-result.json');
    mdoq.get({my: 'query'}).pipe(stream);


    // req.body streaming (for uploads)
    mdoq
    .use(func)


    // example file uploader in mdoq

    var uploader =
    mdoq
    .use(function(req, res, next) {
      req.stream = require('fs').createReadStream(req.query.path);
      next();
    })
    .use(function(req, res, next) {
      if(req.stream) {
        flickr.pipe(req.stream);
      }
      next();
    })
    ;


    uploader.get({path: './big-image.jpg'}).post(function(err, res) {

    })


    // example req
    var req = {
      query: {foo: 'bar'}, // uses 'qa'.parse
      headers: {
        'Accept': 'text/plain',
        'Accept-Charset': 'utf-8',
        'Authorization': 'Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ=='
      },
      method: 'GET'
    }

    // example post
    var req = {
      headers: {
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8'
      },
      method: 'POST',
      query: {id: 4},
      json: {my: 'post'}
    }

    // example result
    var res = {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      json: {my: 'result'}
    }

    // example streaming request
    var req = {
      headers: {
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8'
      },
      method: 'POST',
      query: {id: 4},
      stream: ReadableStream
    }

    // example streaming response
    var res = {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      stream: WriteableStream
    }
  
