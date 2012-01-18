require('../lib/middleware/mongodb');

var expect = require('chai').expect;

var mdoq = require('../')
  , user = {email: 'joe@bob.com', password: '1234', name: 'joe'}
  , users = mdoq.use('mongodb').use('test-db').use('users')
;

describe('mongodb', function(){
  
  it('should use the test-db and users collection', function(done){

    users.first(function(err, res) {
      expect(this.db).to.equal('test-db');
      expect(this.collection).to.equal('users');
    })

    done();
  })
  
  it('should create a user', function(done){
    users.post(user, function(err, res) {
      done(err);
    });
  })
  
  it('should get the user', function(done){
    users.first(user, function(err, res) {
      expect(res).to.be.a('object');
      expect(res.email).to.equal(user.email);
      
      done(err);
    });
  })
    
  it('should iterate over each result', function(done){
    users.limit(3).each(function(err, doc, i) {
      if(i === 2) done(err);
    })
  })

  it('should get the first 3 users', function(done){
    users.first(3, function(err, res) {
      expect(res.length).to.equal(3);
      done(err);
    })
  })
  
  it('should get all users', function(done){
    users.all(function(err, res) {
      expect(res.length > 3).to.be.ok;
      done(err);
    });
  })
  
  it('should get the second page of three users', function(done){
    users.page(2, 3).get(function(err, res) {
      expect(res.length).to.equal(3);
      done(err);
    });
  })
  
  it('should return a count of all users', function(done){
    users.get(user).count(function(err, res, count) {
      expect(count).to.be.a('number');
      done(err);
    })
  })
  
  it('should get a user and modify it', function(done){
    users.get({_id: user._id}).put({updated: true}, function(err) {
      done(err);
    });
  })
  
  it('should get one user', function(done){
      users.first({_id: user._id}, function(err, res) {
        expect(res.updated).to.equal(true);
        done(err);
      })
  })
  
  it('should delete a user by query', function(done){
    users.del(user, done);
  })
  
})