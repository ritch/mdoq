# mdoq

Middleware style development for clients. For **Node.js** and the **browser**.

    mdoq
      .use(function(next) {
        // a simple db middleware
        db[this.req.action](this.req.query || this.req.data, next);
      })
      .use(function(next) {
        // filter it, cache it, etc
        cache(this.req, this.res, next);
      })
      // execute with an action (get, post, put, del)
      .get(function(err, res) {
        console.info(res); // the requested data
      })

Reuse middleware with different sources of data.

    function notFound(next, use) {
      if(this.req.action == 'get')
        // add during execution
        use(function(next) {
          if(!this.res) {
            this.res = {error: 'not found'};
          }
          next();
        })
      }
  
      next();
    }

    // twitter api http client
    var twitter = mdoq.use(require('mdoq-http')).use('https://api.twitter.com').use(notFound);

    // mongodb client
    var tweets = mdoq.use(require('mdoq-mongodb')).use('/tweets').use(notFound);

Control the execution order of middleware during a request.

    function data(next, use) {
      switch(this.req.action) {
        case 'post':
        case 'put':
          use(require('my-db-middleware'))
          use(require('my-cache-middleware'))
        break;
        default:
          use(require('my-cache-middleware'))
          use(function(next, use) {
            if(!this.res) use(require('my-db-middleware'))
            next();
          })
        break;
      }
    }

    var posts = mdoq.use(data).use('/my-db/posts');

    posts.post({id: 1}, function(err, res) {
      console.info(res, 'inserted into the db (and cache)');
    })

    posts.get({id: 1}, function(err, res) {
      console.info(res, 'retrieved from the cache (or db)');
    })

## Features

 - Re-use middleware for different data sources
 - Fluent API for complex client flow control
 - Easily support any source of data
 - Re-use middleware in **Node.js** and the **browser**
 - Add middleware during execution
 - **TODO** Bundled middleware for testing and debugging
 - High Test Coverage
 
## API

All methods in **mdoq** return the current **mdoq** object (think jQuery).

---

### mdoq.use(middleware | url)

**url** *String*

A url is the location or relative location to the resource your client is connecting to. Calls to `use()` can be chained to separate context, such as an entire database and a single collection.

    var db = mdoq.use('mongodb://my-host:27015/my-db')
      , collection = db.use('/my-collection');

**middleware** *Function(next, use)*

Middleware are functions executed in the order they are `use()`d after an action is executed. The job of a middleware is to modify the current **mdoq** object's `req` or `res` (available via `this.req` or `this.res`) and then call `next()`.

**next** *Function(err)*

Can be called with an optional `err` object. This `err` object will be added to the current **mdoq** object at `mdoq.err`.

**use** *Function(middleware)*

Allows for middleware to add additional middleware in place without creating a new **mdoq** object. Useful for adding middleware in specific `req` conditions.

    mdoq.use(function(next, use) {
      if(this.req.action === 'get') {
        use(function(next, use) {
          // called after all other existing middleware are finished
          if(this.res) {
            cache(this.res);
          } else {
            next(new Error('nothing was found when executing' + this.req));
          }
        })
      }
    })

**returns**

A new **mdoq** object. This can be chained to switch contexts, such as a MongoDB collection or a URL part.

    var db = mdoq.use('mongodb://localhost')
      , users = db.use('users');

---

## Modifiers

### mdoq.limit(limit, [callback])

**limit** *Number* 

Defaults to `1`, can be overridden by passing a number.

**callback** *Function(err, res)*

Called once the query or req is complete. The first argument will be null if errors do not exist.

---

### mdoq.page(index, [limit], [callback])

**index** *Number*

Starting page of the query. `index = 0` is the first page.

**limit** *Number* 

Defaults to `16`, can be overridden by passing a number.

**callback** *Function(err, res)*

Called once the req is complete. The first argument will be null if errors do not exist.

---

### mdoq.first([limit], [callback])

**limit** *Number* 

Defaults to `1`, can be overridden by passing a number.

**callback** *Function(err, res)*

Called once the req is complete. The first argument will be null if errors do not exist.

---

### mdoq.count([callback])

**callback** *Function(err, res, count)*

Called once the req is complete. The first argument will be null if errors do not exist. Also includes a third argument: `count` containing the total number of items affected.

This method can be called within a chain to ensure the callback includes a count.

    users.page(2, 10).count().get({term: 'shoes'}, function(err, res, count) {
      console.log(count); // 4 - the number of results returned
    });

---

### mdoq.all([callback])

**callback** *Function(err, res)*

Called once the req is complete. The first argument will be null if errors do not exist.

Useful if you want to override other modifiers (such as `page`) to include all results.

---

## Actions

Actions execute reqs. The default action of any **mdoq** req or query is `get()`. Actions can be inferred and executed from modifiers:

    mdoq.use('http://localhost/tasks').page({owner: 'joe'}, 3, 16, function(err, res) {
      // GET http://localhost/tasks?limit=16&skip=48&owner=joe
      console.info(res); // the 3rd page of joe's tasks
    })

Actions can be used to override the defaults. Overrides are useful for interacting with systems that do not use standard conventions such as semi-RESTful APIs.

    mdoq.use('http://bad-api/users').del({name: 'joe'}).post(function(err, res) {
      // this would have POSTed to the url http://bad-api/users?method=delete
      console.info(res); // the response from the api
    })

### mdoq.get([data], [callback])

**data** *Object*

An object containing data to query the source.

**callback** *Function(err, res)*

Called once the query is complete. The first argument will be null if errors do not exist.

---

### mdoq.post([data], [callback])

**data** *Object*

An object containing data to be created or inserted.

**callback** *Function(err, res)*

Called once the req is complete. The first argument will be null if errors do not exist.

---

### mdoq.put([data], [callback]) or mdoq.update([data], [callback])

**data** *Object*

An object containing data to be updated, must contain an identifier.

**callback** *Function(err, res)*

Called once the req is complete. The first argument will be null if errors do not exist.

---

### mdoq.del([data | id], [callback])

**id** *Object*

A unique identifier of any data to be deleted.

**data** *Object*

An object containing data to be deleted, must contain an identifier.

**callback** *Function(err, res)*

Called once the delete is complete. The first argument will be null if errors do not exist.

--- 

### mdoq.each([callback])

**callback** *Function(err, item, index)*

Called for each item as it is returned from a query. The first argument will be null if errors do not exist.