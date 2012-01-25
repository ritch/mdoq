var mdoq = require('../')
  , expect = require('chai').expect;
  
var testing = function(next) {
  this.testing = true;
  next();
};
  
describe('Middleware', function(){

  describe('mdoq.use(name | middleware)', function(){
    it('should create an operation', function(done){
      mdoq
        .use(function(next) {
          this.currentOperation = this.operation;
          next();
        })
        .use(function(next) {
          expect(this.operation).to.be.a('object');
          expect(this.operation).to.equal(this.currentOperation);
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
    it('should modify the operations limit', function(done){
      simple.limit(3, function(err, res) {
        expect(this.operation.limit).to.equal(3);
        done();
      })
    })
  })
  
  describe('mdoq.page(index, [limit], [callback])', function(){
    it('should modify the operations skip and limit', function(done){
      simple.page(3, 10, function(err, res) {
        expect(this.operation.limit).to.equal(10);
        expect(this.operation.skip).to.equal(30);
        done();
      })
    })
  })
  
  describe('mdoq.first([limit], [callback])', function(){
    it('should force the operations limit to 1', function(done){
      simple.first(function(err, res) {
        expect(this.operation.limit).to.equal(1);
        expect(this.operation.one).to.equal(true);
        done();
      })
    })
    
    it('should modify the operations limit', function(done){
      simple.first(7, function(err, res) {
        expect(this.operation.limit).to.equal(7);
        expect(this.operation.first).to.not.equal(true);
        done();
      })
    })
  })
  
  describe('mdoq.count([callback])', function(){
    it('should set the operations count property to true', function(done){
      simple.count().first(function(err, res) {
        expect(this.operation.count).to.equal(true);
        done();
      })
    })
  })
  
  describe('mdoq.each([callback])', function(){
    it('should set the operations each property to true', function(done){
      simple.each();
      expect(simple.operation.each).to.equal(true);
      done();
    })
  })
  
  describe('mdoq.all([callback])', function(){
    it('should set the operations all property to true', function(done){
      simple.all();      
      expect(simple.operation.all).to.equal(true);
      done();
    })
  })
  
})

describe('Actions', function(){
  var simple = mdoq.use(function(next) {
        next();
      });
      
  describe('mdoq.get([data], [callback])', function(){
    it('should set the operation action to get', function(done){
      simple.get(function() {
        expect(this.operation.action).to.equal('get');
        done();
      })
    })
  })
  
  describe('mdoq.post([data], [callback])', function(){
    it('should set the operation action to post', function(done){
      simple.post(function() {
        expect(this.operation.action).to.equal('post');
        done();
      })
    })
  })
  
  describe('mdoq.put([data], [callback])', function(){
    it('should set the operation action to put', function(done){
      simple.put(function() {
        expect(this.operation.action).to.equal('put');
        done();
      })
    })
  })
  
  describe('mdoq.update([data], [callback])', function(){
    it('should set the operation action to put', function(done){
      simple.update(function() {
        expect(this.operation.action).to.equal('put');
        done();
      })
    })
  })
  
  describe('mdoq.del([data | id], [callback])', function(){
    it('should set the operation action to del', function(done){
      simple.del(function() {
        expect(this.operation.action).to.equal('del');
        done();
      })
    })
  })
  
})