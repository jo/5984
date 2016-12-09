var through2 = require('through2')
var normalize = require('./lib/normalize')

module.exports = function batch (options) {
  options = options || {}
  options.size = options.size || 100

  var docsBatch = []

  return through2({ objectMode: true }, function (doc, enc, callback) {
    var push = this.push.bind(this)
    var docs = normalize(doc)

    for (var i = 0; i < docs.length; i++) {
      docsBatch.push(docs[i])

      if (docsBatch.length >= options.size) {
        push(docsBatch.splice(0, options.size))
      }
    }
    callback()
  }, function (callback) {
    if (docsBatch.length) {
      this.push(docsBatch.splice(0, docsBatch.length))
    }
    callback()
  })
}
