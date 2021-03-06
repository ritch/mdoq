var mdoq = require('../')
  , expect = require('chai').expect;
  
// middleware
var testing = function(req, res, next) {
  this.testing = true;
  next();
};

// modifier
testing.modify = function (num) {
  this.num = num;
  return this;
}
  
describe('Middleware', function(){

  describe('mdoq.use(middleware | url)', function(){
    it('should set the url', function(done){
      var test = mdoq.use('protocol://host').use('/test').use(function (req, res, next) {
        next();
      });
      
      expect(test.url).to.equal('protocol://host/test');
      
      test.use('/a').get(function (err, res) {
        expect(this.req.url).to.equal('protocol://host/test/a');
        test.use('/b').get(function (err, res) {
          expect(this.req.url).to.equal('protocol://host/test/b');
          test.exec({url: 'foo bar'}, function (err, res) {
            expect(this.req.url).to.equal('foo bar');
            done();
          })
        })
      })
      
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
    
    it('should create a req', function(done){
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
    
    it('should add all modifiers to the current context', function(done) {
      expect(mdoq.modify).to.not.exist;
      var tester = mdoq.use(testing);
      expect(tester.modify).to.be.a('function');
      
      tester.modify(7).get(function (err, res) {
        expect(this.num).to.equal(7);
        done(err);
      })
    })
    
    it('should add modifiers even when changing context', function(done) {
      var o = require('mdoq').use(require('mdoq-http')).use(function (req, res, next) {});
      
      expect(o.pipe).to.be.a('function');
      done();
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
    
    it('should be able to mix in other mdoq stacks', function() {
      var mw1 = function () {
        
      };
      
      mw1.fun = function () {
        
      };
      
      var a = mdoq.use(function () {
        
      }).use(mw1);
      
      var b = mdoq.use(function () {
        
      }).use(a);
      
      expect(b.fun).to.be.a('function');
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
        expect(this.res.status).to.equal(200);
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