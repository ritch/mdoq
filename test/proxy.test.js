var mdoq = require('../')
  , PORT = 3333
  , expect = require('chai').expect
  , express = require('express')
  , http = mdoq.require('mdoq-http').use('http://localhost:' + PORT)
;

var testData = {
  a: 'b',
  c: ['d', 'e', 'f'],
  g: 'hijkglmn',
  o: {
    p: 'q',
    r: ['s', 7, 8,]
  }
};

var faux = mdoq.use(function (req, res, next) {
  res.data = testData;
  
  // return posted data (if any)
  if(req.data && Object.keys(req.data).length) {
    res.data = req.data;
  }
  
  next();
});

describe('Proxy Server', function(){
  it('should listen', function(done) {
    var app = express.createServer(express.bodyParser());
    app.all('/test', faux.proxy());
    app.on('listening', function () {
      done();
    });

    app.listen(PORT);
  })
})

describe('Proxying', function(){
  it('should return the test data', function(done) {
    http.use('/test').get(function (err, res) {
      expect(res).to.eql(testData);
      done(err);
    })
  })
  
  it('should return the posted test data', function(done) {
    var tdata = {foo:'bar', bat: 'baz'};
    
    http.use('/test').post(tdata, function (err, res) {
      expect(res).to.eql(tdata);
      
      done(err);
    })
  })
})

describe('Proxying - use()', function(){
  it('should support mdoq proxies', function(done) {
    var simple = mdoq
      .use(function (req, res, next) {
        if(res.data) res.data.simple = 'bar';
        next();
      })
      .use(function (req, res, next) {
        setTimeout(function () {
          if(res.data) res.data.bar = 'foo';
          next();
        }, 22);
      })
    ;
    
    var complex = mdoq.use(function (req, res, next) {
      res.data = {complex:true};
      next();
    })
    
    complex.use(simple).get(function (err, res) {
      expect(res.complex).to.exist;
      expect(res.simple).to.exist;
      expect(res.bar).to.exist;
      done(err);
    })
  })
})