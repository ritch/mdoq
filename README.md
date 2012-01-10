# JDBQ
JSON Database Query API

**Problem** Most sources of JSON data can be expose over HTTP. Even though they can be accessed over the same transport protocol, the actual client interface is usually different or non-existent. Why not modularize this problem into an intuitive HTTP client API that can be adapted for any source of JSON data.

**Solution** A simple, fluent, HTTP compatible API for reading and writing JSON from any source including non-HTTP. Easily pluggable to support **HTTP Requests**, **JSON REST APIs**, **MongoDB**, **HTML5 localStorage**, and **CouchDB**.


## Examples

Two execution and storage middlewares are bundled with **jdbq**

  * **HTTP** - *for building complex HTTP requests in **node.js** and the browser*
  * **MongoDB** - *an ORM-free abstraction of the **mongodb-native** **node.js** driver*

### HTTP

Using the http middleware of **jdbq**, you can easily build complex http requests with the same api you use to query your db.

Tell **jdbq** you want to use HTTP

    var zappos = jdbq.use('http://api.zappos.com/image');

Then build up your query in a chain

    // Delete an image from the zappos api
    zappos
      .get({styleId: ['123456'], recipe: ['RECIPE_NAME']})
      .del(function(err, res) {
        console.info('goodbye!', res); // {status: 200}
      })
    ;

This will serialize the query string and send the request as you would expect

    DELETE http://api.zappos.com//Image?styleId=["123456"]&recipe=["RECIPE_NAME"]

### MongoDB

Connect, query, and modify MongoDB's with the same API.

    var users = jdbq.use('mongodb://localhost/my-testing-db/users')
      , perPage = 10;

    users
      .get({age: {$gte: 18}})
      .put({legal: true})
      .sort('age')
      .page(3, perPage)
      .each(function(user, i) {
        console.info(user.name, 'is', i, 'of', perPage);
      })
    ;

Grab a single user with `.first()`.

    users.first({_id: 1}, function(err, user) {
      if(err) console.error(err);
      if(user) {
        console.info(user); // {_id: 1, name: 'john toblerone'}
      }
    })

Easily add queries as middleware to **connect** or **express** apps.

    app.get('/user/:id', users.first().get, function(req, res) {
      res.send(res.users); // 'users' inferred from collection name
    })

## Status: In Development

### TODO

  * Write more tests for more complex queries
  * Add hooks for layer's to add modifiers and actions (ie: map())
  * Finalize hook / layer api
  * Create connect middleware
  * collection.each support
  
### Nice to have

  * Cache api, hooks
  * Simple in memory layer example
  * CouchDB layer
  * Browser support (localStorage, SQLite)
  * EventEmitter support