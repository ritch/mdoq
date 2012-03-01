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
  next();
});

describe('Proxy Server', function(){
  it('should listen', function(done) {
    var app = express.createServer();
    app.get('/test', faux.proxy());

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
})