var Readable = require('readable-stream/readable')
var path = require('path')
var tap = require('tap')
var compile = require('../compile')

var fixture = path.join(__dirname, 'fixtures/app')

tap.test('test source argument', function (t) {
  compile(fixture)
    .on('data', function (doc) {
      t.equal(doc._id, 'ten')
    })
    .on('end', t.end)
})

tap.test('test stream interface', function (t) {
  var stream = new Readable()
  stream._read = function () {
    this.push(fixture)
    this.push(null)
  }
  stream
    .pipe(compile())
    .on('data', function (doc) {
      t.equal(doc._id, 'ten')
    })
    .on('end', t.end)
})
