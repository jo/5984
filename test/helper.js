var url = require('url')
var path = require('path')
var http = require('http')
var JSONStream = require('JSONStream')
var tap = require('tap')

var couchdbUrl = process.env.COUCHDB || 'http://localhost:5984'

exports.dbUrl = url.resolve(couchdbUrl, 'fnef-test')
exports.fixtures = {
  docs: path.join(__dirname, 'fixtures/docs.ndjson'),
  bulkDocs: path.join(__dirname, 'fixtures/bulk-docs.ndjson'),
  docsArray: path.join(__dirname, 'fixtures/docs-array.ndjson')
}
exports.docs = require(path.join(__dirname, 'fixtures/docs.json'))
exports.setup = function (done, docs) {
  var u = url.parse(exports.dbUrl)
  var headers = {
    'Content-Type': 'application/json'
  }
  if (u.auth) {
    headers.Authorization = 'Basic ' + new Buffer(u.auth).toString('base64')
  }

  http
    .request({
      hostname: u.hostname,
      protocol: u.protocol,
      port: u.port,
      path: u.path,
      method: 'delete',
      headers: headers
    })
    .on('response', function (response) {
      http
        .request({
          hostname: u.hostname,
          protocol: u.protocol,
          port: u.port,
          path: u.path,
          method: 'put',
          headers: headers
        })
        .on('response', function () {
          if (!docs) return done()

          var req = http
            .request({
              hostname: u.hostname,
              protocol: u.protocol,
              port: u.port,
              path: u.path + '/_bulk_docs',
              method: 'post',
              headers: headers
            })
            .on('response', function (response) {
              response
                .pipe(JSONStream.parse('*'))
                .on('data', function (resp) {
                  tap.ok(resp.ok)
                })
                .on('end', done)
            })
          req.write(JSON.stringify(docs))
          req.end()
        })
        .end()
    })
    .end()
}
