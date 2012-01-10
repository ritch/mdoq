var jdbq = require('../')
  , db = jdbq.db('jdbq-test')
  , users = db.collection('users')
  , user = {email: 'test@test.com'};

users.on('all', function(command) {
  console.info(command);
})

describe('db.collection', function(){
  
  it('should create a user', function(done){
    users.insert(user, done);
  })
  
  it('should find the user', function(done){
    users.first(user, done);
  })
  
  it('should find the first 3 users', function(done){
    users.first(3, function(err, each) {
      err 
        ? done(err);
        : each(function(user, i) {
          if(i === 2) {
            expect(each.remaining).to.equal(0);
            done();
          }
        })
    })
  })
  
  it('should find all users', function(done){
    users.all(done);
  })
  
  it('should find the last page of users', function(done){
    users.page(-1, 10).count().all(done);
  })
  
  it('should return a count of all users', function(done){
    users.find(user).count(function(err, count) {
      expect(count).to.equal(1);
    })
  })
  
  it('should find a user and modify it', function(done){
    users.find(user).update({updated: true}, done);
  })
  
  it('should delete a user by query', function(done){
    users.remove(user, done);
  })
  
})
