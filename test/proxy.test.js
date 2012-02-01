var mdoq = require('../')
  , expect = require('chai').expect
  , faux = mdoq.require('../lib/faux') // .require('../lib/debug')
  , usersServer = faux.use('/users')
  , express = require('express')
  , users = mdoq.require('mdoq-http').use('http://localhost:6543/users')
  , user = FAUX_DATA['/users'][0]
;

var app = express.createServer();


describe('Proxy', function(){

  it('should start listening', function(done){
    app.use(express.bodyParser());
    app.all('/users', usersServer.proxy());
    app.on('listening', function() {
      done();
    });

    app.listen(6543);
  })

  it('should return a user by query', function(done){
    users.get({id: user.id}, function(err, res) {
      expect(res).to.eql(user);
      done()
    })
  })

  it('should update a user by id', function(done){
    var updates = {updated: true};

    users.get({id: 0}).put(updates, function(err, res) {
      expect(res.put).to.eql(updates);
      done();
    });
  })

  it('should insert a new user', function(done){
    var newUser = {name: 'New User'};

    users.post(newUser, function(err, res) {
      expect(res.post.name).to.equal(newUser.name);
      expect(res.post.id).to.be.a('number');
      done();
    })
  })

  it('should delete the newly entered user', function(done){
    users.del({name: 'New User'}, function(err, res) {
      expect(res.delete).to.equal(true);
      done();
    })
  })

  it('should error when provided improper input', function(done){
    mdoq
      // .use(require('../lib/debug'))
      .use(function(req, res, next) {
        this.req.query = 'a bad query';
        next();
      })
      .use(require('../lib/faux'))
      .use('/users')
      .get(function(err, res) {
        expect(err).to.be.a('object');
        done()
      })
    ;
  })

})

  