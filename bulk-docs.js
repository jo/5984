var through2 = require('through2')
var JSONStream = require('JSONStream')
var request = require('./lib/request')
var normalize = require('./lib/normalize')

module.exports = function bulkDocs (db, options) {
  return through2({ objectMode: true }, function (doc, enc, callback) {
    var req = request(db, '_bulk_docs', 'post', options)
    var push = this.push.bind(this)
    var json = JSON.stringify({
      docs: normalize(doc)
    })

    req.on('response', function (response) {
      response
        .pipe(JSONStream.parse('*'))
        .on('data', push)
        .on('error', callback)
        .on('end', callback.bind(null, null))
    })

    req.write(json)
    req.end()
  })
}
