# mdoq

Build and execute stacks of **connect**, **express**, and **FlatIron** style middleware in **Node.js** and the **browser**.

## Problem

I have a source of data (a database, a REST api, etc) and I have a request for data.

## Typical Solution

Usually the solution looks a lot like this:

    ArticleProvider.prototype.findAll = function(callback) {
      this.db.collection('articles', function(error, article_collection) {
        // ... and so on ... http://howtonode.org/express-mongodb
      });
    };

Now you can "provide" data to the request in, for example, an express route.

    var articleProvider = new ArticleProvider();
    
    app.get('/articles', function(req, res){
      articleProvider.findAll(function(err, docs){
        // and respond ...
      })
    });

## Example Solution

Instead of reinventing the interface (eg. ArticleProvider), proxy and filter data over the existing http interface with **mdoq**.

    var articles = mdoq.require('mdoq-mongodb').use('/articles');

    app.get('/articles', articles.proxy());

**Mdoq** supports execution without a server.

    articles.get({author: 'joe bob'}, function(err, res) {
      console.log(res) // articles by joe bob
    });

Re-use **mdoq** middleware to filter and pipe data between sources.

    var articles = mdoq.require('mdoq-mongodb').use('/articles')
      , feed = mdoq.require('mdoq-http').use('http://articles.com/feed.json');

    function combine(req, res, next, end) {
      res.articles = res.data;
      end(function(req, res) {
        if(req.data.concat && req.data.length) {
          res.body = req.data.concat(res.articles);
        }
        next();
      })
      next();
    }

    // get articles from db and rss feed
    articles.use(combine).use(feed).get(function(err, res) {
      console.info(res); // [ ...MongoDB and Feed Articles... ]
    })

## More Examples

By itself, **mdoq** only builds middleware stacks and request objects. It is up to other middleware to fetch and or modify data while updating the response.
    
    // if you use mdoq alone
    var mdoq = require('mdoq');

    // nothing much will happen
    mdoq.use('/blog/articles').post({author: 'joe bob'}, function(err, res) {
      console.info('mdoq built this request:', this.req);
    });
    
**Mdoq** will build a request, then execute the request against any middleware being used.
    
    mdoq built this request: { method: 'POST',
      data: { author: 'joe bob' },
      headers: {},
      url: '/blog-post' }

Add in middleware by calling `use()` on the current mdoq object. Calling `use()` will return a new **mdoq** context.
This is useful for reusing middleware stacks against different urls.

    var http = mdoq.use(mdoq.http())
      , blog = http.use('/blog')
      , articles = blog.use('/articles');
      
    articles.post({author: 'jimmy jones'}, function(err, res) {
      console.info(res); // the http response body
    });

## Features

 - A consistent http api for building server and client middleware
 - Works in **Node.js**, and modern **browsers**
 - Tools for debugging and testing middleware
 - Modular design for intuitive comprehension and small footprint

## Middleware

Middleware is not bundled. Instead middleware is built separately as independent modules.

 - **[http](https://github.com/ritch/mdoq-http)** - execute http requests in **Node.js** and via **jQuery** in the **browser**
 - **[mongodb](https://github.com/ritch/mdoq-mongodb)** - proxy http requests into **mongodb** to read and write documents with an http api
 - **[offline](https://github.com/ritch/mdoq-offline)** - pass all requests through a local browser persistence layer and automatically sync when the network is available
 - **[debug](https://github.com/ritch/mdoq/blob/master/lib/debug.js)** - trace out http information such as **url**, **response**, **duration**, and **errors**
 - **[faux](https://github.com/ritch/mdoq/blob/master/lib/faux.js)** - test new middleware implementations against a faux datasource

## Modifiers

Middleware may expose functions that will patch **mdoq**'s api. This is useful for methods that should only be included in the api once a middleware is added.

The **[mongodb](https://github.com/ritch/mdoq-mongodb)** middleware uses this to add methods such as `first()`.

    // example middleware
    function middleware(req, res, next) {
      // modify the req and or res and call next with any errors
      next();
    }
    
    // add a modifier that will patch the current mdoq context
    middleware.example = function(str, num, etc) {
      console.info(this); // the currently executing mdoq context
      console.info(this.req);
      console.info(this.res);
      
      // always return this
      return this;
    }

## API

All methods in **mdoq** return an **mdoq** object (think jQuery).

---

### mdoq.use(middleware | url)

**url** *String*

Calling `use()` with urls allows separate execution contexts. This is useful for controlling when certain middleware are used.

    var api = mdoq.use('http://localhost:3000')
      , users = api.use('/users');

**middleware** *MiddlewareFunction(req, res, next, use)*

A function to add to the middleware stack.

**returns**

A new **mdoq** object. This can be chained to switch contexts, such as a MongoDB collection or a URL part.

    var db = mdoq.use('mongodb://localhost')
      , users = db.use('users');

---

### MiddlewareFunction(req, res, next, end)

Middleware are functions executed in the order they are `use()`d. Middleware modify the provided `req` and `res` objects
and call `next()` to continue to the next middleware in the stack.

**next** *Function(err)*

Can be called with an optional `err` object. This `err` object will be added to the current **mdoq** object at `mdoq.err`.

**end** *Function(middleware)*

For adding middleware to the end of the stack during execution. Useful for middleware that require execution before and after other middleware.

    mdoq.use(function(req, res, next, end) {
      // automatically handle data as JSON
      if(!res.body) res.body = {};
      end(function(req, res, next) {
        if(typeof res.body == 'object') {
          // serialize it as json
          res.body = JSON.stringify(res.body);
        }
        next();
      })
      next();
    })

---

### mdoq.get([query], [callback])

**query** *Object*

An object representing a request query to be serialized as a query string.

**callback** *ResponseFunction(err, res)*

---

### mdoq.post([data], [callback])

**data** *Object*

An object containing data to be created or inserted.

**callback** *ResponseFunction(err, res)*

---

### mdoq.put([data], [callback]) or mdoq.update([data], [callback])

**data** *Object*

An object containing data to be updated, must contain an identifier.

**callback** *ResponseFunction(err, res)*

---

### mdoq.del([data | id], [callback])

**id** *Object*

A unique identifier of any data to be deleted.

**data** *Object*

An object containing data to be deleted, must contain an identifier.

**callback** *ResponseFunction(err, res)*

---

### ResponseFunction(err, body, res, req)

**err** *Object*

An object containing any error information. `err` will be undefined if an error did not occur.

**data** *Object*

An object containing the `res.body` or `res.data`.

---

### mdoq.proxy()

**returns** *MiddlewareFunction(req, res, next, use)*

A function that wraps all the current middleware. Useful for proxying data between servers, clients and other **mdoq** stacks.

    var app = require('express').createServer();
      , db = mdoq.require('mdoq-mongodb')
      , users = db.use('/users');
      
    app.get('/users', users.proxy());

---

## Tests

Install the dev dependencies.
  
    $ npm install -d
    
Run the tests with `make`.

    $ make
