var mdoq = require('../')
  , expect = require('chai').expect
  , faux = mdoq.use(require('../lib/debug')).use(require('../lib/faux'))
  , user = FAUX_DATA['/users'][0]
  , users = faux.use('/users')
;

describe('Faux Data Source Middleware', function(){

  it('should return a user by query', function(done){
    users.get({id: user.id}, function(err, res) {
      expect(res).to.equal(user);
      done()
    })
  })

  it('should update a user by id', function(done){
    var updates = {updated: true};
    
    users.get({id: 0}).put(updates, function(err, res) {
      expect(res.put).to.equal(updates);
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
      .use(require('../lib/debug'))
      .use(function(next) {
        this.operation.query = 'a bad query';
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

describe('Simulated Slow Middleware', function(){
  it('should respond after 100ms', function(done){
    users
      .use(function(next) {
        setTimeout(next, 100)
      })
      .get(done)
    ;
  })
})