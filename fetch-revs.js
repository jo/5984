var through2 = require('through2')
var JSONStream = require('JSONStream')
var request = require('./lib/request')
var normalize = require('./lib/normalize')

module.exports = function fetchRevs (db, options) {
  return through2({ objectMode: true }, function (doc, enc, callback) {
    var req = request(db, '_all_docs', 'post', options)
    var push = this.push.bind(this)
    var docs = normalize(doc).reduce(function (memo, doc) {
      memo[doc._id] = doc
      return memo
    }, {})
    var json = JSON.stringify({
      keys: Object.keys(docs)
    })

    req.on('response', function (response) {
      response
        .pipe(JSONStream.parse('rows.*'))
        .on('data', function (row) {
          var doc = docs[row.key]
          if (row.value && row.value.rev) {
            doc._rev = row.value.rev
          }
          push(doc)
        })
        .on('error', callback)
        .on('end', callback.bind(null, null))
    })

    req.write(json)
    req.end()
  })
}
