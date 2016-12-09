var fs = require('fs')
var ndjson = require('ndjson')
var tap = require('tap')
var helper = require('./helper')
var bulkDocs = require('../bulk-docs')

tap.beforeEach(helper.setup)

for (var name in helper.fixtures) {
  tap.test('test ' + name + ' input', function (t) {
    fs.createReadStream(helper.fixtures[name])
      .pipe(ndjson.parse())
      .pipe(bulkDocs(helper.dbUrl))
      .on('data', function (response) {
        t.ok(response.ok)
      })
      .on('end', t.end)
  })
}
