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
    app.all('/continue', faux.proxy(true), function (req, res) {
      res.send(res.data);
    });
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
  
  it('should still return when using continue', function(done) {
    var tdata = {foo:'bar', bat: 'baz'};
    
    http.use('/continue').post(tdata, function (err, res) {
      expect(res).to.eql(tdata);
      
      done(err);
    })
  })
})