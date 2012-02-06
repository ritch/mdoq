var mdoq = require('../')
  , expect = require('chai').expect;
  
var testing = function(req, res, next) {
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
      .use(function(req, res, next) {
        setTimeout(function() {
          next();
        }, 0);
      })
      .use(function(req, res, next) {
        expect(this.req.method).to.equal('GET');
        next();
      })
      .get(done);
    })
    
    it('should create an req', function(done){
      mdoq
        .use(function(req, res, next) {
          this.currentreq = this.req;
          next();
        })
        .use(function(req, res, next) {
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
        .use(function(req, res, next) {
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
        .use(function(req, res, next, use) {
          use(function(req, res, next) {
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

describe('Actions', function(){
  var simple = mdoq.use(function(req, res, next) {
        next();
      });
      
  describe('mdoq.get([data], [callback])', function(){
    it('should set the req method to get', function(done){
      simple.get(function() {
        expect(this.req.method).to.equal('GET');
        done();
      })
    })
  })
  
  describe('mdoq.post([data], [callback])', function(){
    it('should set the req method to post', function(done){
      simple.post(function() {
        expect(this.req.method).to.equal('POST');
        done();
      })
    })
  })
  
  describe('mdoq.put([data], [callback])', function(){
    it('should set the req method to put', function(done){
      simple.put(function() {
        expect(this.req.method).to.equal('PUT');
        done();
      })
    })
  })
  
  describe('mdoq.update([data], [callback])', function(){
    it('should set the req method to put', function(done){
      simple.update(function() {
        expect(this.req.method).to.equal('PUT');
        done();
      })
    })
  })
  
  describe('mdoq.del([data | id], [callback])', function(){
    it('should set the req method to delete', function(done){
      simple.del(function() {
        expect(this.req.method).to.equal('DELETE');
        done();
      })
    })
  })
  
})