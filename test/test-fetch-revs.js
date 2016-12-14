var fs = require('fs')
var ndjson = require('ndjson')
var tap = require('tap')
var helper = require('./helper')
var fetchRevs = require('../fetch-revs')

tap.beforeEach(helper.setup.bind(null, helper.docs))

for (var name in helper.fixtures) {
  tap.test('test ' + name + ' input', function (t) {
    fs.createReadStream(helper.fixtures[name])
      .pipe(ndjson.parse())
      .pipe(fetchRevs(helper.dbUrl))
      .on('data', function (doc) {
        t.ok(doc._id)
        t.ok(doc._rev)
      })
      .on('end', t.end)
  })
}
