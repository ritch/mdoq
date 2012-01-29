var mdoq = require('../')
  , expect = require('chai').expect;
  
var testing = function(next) {
  this.testing = true;
  next();
};
  
describe('Middleware', function(){

  describe('mdoq.use(middleware | url)', function(){
    it('should set the url', function(done){
      var test = mdoq.use('protocol://host').use('/test');
      
      expect(test.url).to.equal('protocol://host/test');
      done();
    })
    
    it('should still have an req after executing async middleware', function(done){
      mdoq
      .use(function(next) {
        setTimeout(function() {
          next();
        }, 0);
      })
      .use(function(next) {
        expect(this.req.action).to.equal('get');
        next();
      })
      .get(done);
    })
    
    it('should create an req', function(done){
      mdoq
        .use(function(next) {
          this.currentreq = this.req;
          next();
        })
        .use(function(next) {
          expect(this.req).to.be.a('object');
          expect(this.req).to.equal(this.currentreq);
          next();
        })
        .get(done)
      ;
    })
    
    it('should add a middleware to the stack', function(done){
      mdoq.use(testing).get(function() {
        expect(this.testing).to.equal(true);
        done();
      });
    })
    
    it('should execute an adhoc middleware', function(done){
      mdoq
        .use(function(next) {
          this.adhoc = true;
          next();
        })
        .get(function() {
          expect(this.adhoc).to.equal(true);
          done();
        })
      ;
    })
    
    it('should be able to add middleware within another middleware', function(done){
      mdoq
        .use(function(next, use) {
          use(function(next) {
            done();
            next();
          });
          
          next();
        })
        .get(function() {
        })
      ;
    })
  })
})

describe('Modifiers', function(){

var simple = mdoq.use(function(next) {
      next();
    });
  
  describe('mdoq.limit(limit, [callback])', function(){
    it('should modify the reqs limit', function(done){
      simple.limit(3, function(err, res) {
        expect(this.req.limit).to.equal(3);
        done();
      })
    })
  })
  
  describe('mdoq.page(index, [limit], [callback])', function(){
    it('should modify the reqs skip and limit', function(done){
      simple.page(3, 10, function(err, res) {
        expect(this.req.limit).to.equal(10);
        expect(this.req.skip).to.equal(30);
        done();
      })
    })
  })
  
  describe('mdoq.first([limit], [callback])', function(){
    it('should force the reqs limit to 1', function(done){
      simple.first(function(err, res) {
        expect(this.req.limit).to.equal(1);
        expect(this.req.one).to.equal(true);
        done();
      })
    })
    
    it('should modify the reqs limit', function(done){
      simple.first(7, function(err, res) {
        expect(this.req.limit).to.equal(7);
        expect(this.req.first).to.not.equal(true);
        done();
      })
    })
  })
  
  describe('mdoq.count([callback])', function(){
    it('should set the reqs count property to true', function(done){
      simple.count().first(function(err, res) {
        expect(this.req.count).to.equal(true);
        done();
      })
    })
  })
  
  describe('mdoq.each([callback])', function(){
    it('should set the reqs each property to true', function(done){
      simple.each();
      expect(simple.req.each).to.equal(true);
      done();
    })
  })
  
  describe('mdoq.all([callback])', function(){
    it('should set the reqs all property to true', function(done){
      simple.all();      
      expect(simple.req.all).to.equal(true);
      done();
    })
  })
  
})

describe('Actions', function(){
  var simple = mdoq.use(function(next) {
        next();
      });
      
  describe('mdoq.get([data], [callback])', function(){
    it('should set the req action to get', function(done){
      simple.get(function() {
        expect(this.req.action).to.equal('get');
        done();
      })
    })
  })
  
  describe('mdoq.post([data], [callback])', function(){
    it('should set the req action to post', function(done){
      simple.post(function() {
        expect(this.req.action).to.equal('post');
        done();
      })
    })
  })
  
  describe('mdoq.put([data], [callback])', function(){
    it('should set the req action to put', function(done){
      simple.put(function() {
        expect(this.req.action).to.equal('put');
        done();
      })
    })
  })
  
  describe('mdoq.update([data], [callback])', function(){
    it('should set the req action to put', function(done){
      simple.update(function() {
        expect(this.req.action).to.equal('put');
        done();
      })
    })
  })
  
  describe('mdoq.del([data | id], [callback])', function(){
    it('should set the req action to delete', function(done){
      simple.del(function() {
        expect(this.req.action).to.equal('delete');
        done();
      })
    })
  })
  
})