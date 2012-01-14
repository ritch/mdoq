# mdoq
**m**iddleware for **d**ynamic **o**bject **q**ueries

A **node.js** and **browser** JavaScript library for abstracting the source of your data into a middleware friendly HTTP-like api. Comes bundled with middleware for **HTTP**, and **MongoDB**. Easily extendable for any object oriented data source.

* **HTTP** - *for building complex HTTP requests in **node.js** and the browser*
* **MongoDB** - *an ORM-free abstraction of the **mongodb-native** **node.js** driver*

## Status: In Development

## Examples

### HTTP

Using the http middleware of **mdoq**, you can quickly build complex http requests.

Tell **mdoq** you want to use HTTP

    var zappos = mdoq.use('http://api.zappos.com/image');

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

Connect, query, and modify MongoDB's with the `mongodb` middleware.

    var users = mdoq.use('mongodb://localhost/my-testing-db/users')
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
    });

## API

All methods in **mdoq** return the current **mdoq** query (think jQuery).

---

### mdoq.use([name], [middleware])

**name** *String*

The name of the middleware which to define. If a name is provided, the middleware will not be added to the current query. Instead it will be provided to any descendent of the current **mdoq** object.

To enable a middleware defined by name, just include the name of the middleware.

    mdoq.use('mongodb').first({user: 1}, fn);

**middleware** *Function(next)*

Middlewares are a list of modifiers executed in order before or after a request for data is made. The job of a middleware is to modify the current **mdoq** object's request or response and then call `next()`. `next()` can be called with an optional `err` object. This `err` object will be added to the current **mdoq** context.

**returns**

A new or modified **mdoq** object. This can be chained to switch contexts, such as a MongoDB collection or a URL part.

    var db = mdoq.use('mongodb://localhost')
      , users = db.use('users');

---

## Bundled Middleware

### mdoq.limit(limit, [callback])

**limit** *Number* 

Defaults to `1`, can be overridden by passing a number.

**callback** *Function(err, res)*

Called once the query is complete. The first argument will be null if errors do not exist.

---

### mdoq.page(index, [limit], [callback])

**index** *Number*

Starting page of the query. `index = 0` is the first page.

**limit** *Number* 

Defaults to `16`, can be overridden by passing a number.

**callback** *Function(err, res)*

Called once the operation is complete. The first argument will be null if errors do not exist.

---

### mdoq.first([limit], [callback])

**limit** *Number* 

Defaults to `1`, can be overridden by passing a number.

**callback** *Function(err, res)*

Called once the operation is complete. The first argument will be null if errors do not exist.

---

### mdoq.count([callback])

**callback** *Function(err, res)*

Called once the operation is complete. The first argument will be null if errors do not exist.

The `res` object will contain a `count` property with the length of the results of the query, or operations performed.

---

### mdoq.all([callback])

**callback** *Function(err, res)*

Called once the operation is complete. The first argument will be null if errors do not exist.

Useful if you want to override other modifiers (such as `page`) to include all results.

---

## Bundled Action Middleware

Actions are modifiers that normally end or execute queries.

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

Called once the query is complete. The first argument will be null if errors do not exist.

---

### mdoq.put([data], [callback]) or mdoq.update([data], [callback])

**data** *Object*

An object containing data to be updated, must contain an identifier.

**callback** *Function(err, res)*

Called once the query is complete. The first argument will be null if errors do not exist.

---

### mdoq.del([data | id], [callback])

**id** *Object*

A unique identifier of any data to be deleted.

**data** *Object*

An object containing data to be deleted, must contain an identifier.

**callback** *Function(err, res)*

Called once the query is complete. The first argument will be null if errors do not exist.

--- 

### mdoq.each([callback])

**callback** *Function(err, item, index)*

Called for each item as it is returned from a query. The first argument will be null if errors do not exist.