var fs = require('fs')
var ndjson = require('ndjson')
var tap = require('tap')
var helper = require('./helper')
var batch = require('../batch')

for (var name in helper.fixtures) {
  tap.test('test ' + name + ' input', function (t) {
    var i = 0
    fs.createReadStream(helper.fixtures[name])
      .pipe(ndjson.parse())
      .pipe(batch({ size: 4 }))
      .on('data', function (docs) {
        t.ok(Array.isArray(docs))
        t.equal(docs.length, i++ === 2 ? 1 : 4)
      })
      .on('end', t.end)
  })
}
