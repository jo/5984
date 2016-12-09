var through2 = require('through2')
var Readable = require('readable-stream/readable')
var couchdbCompile = require('couchdb-compile')

function createReadStream (data) {
  var stream = new Readable()
  stream._read = function () {
    this.push(data)
    this.push(null)
  }
  return stream
}

module.exports = function compile (filename, options) {
  if (typeof filename === 'object') {
    options = filename
    filename = null
  }
  options = options || {}
  options.multipart = false

  var stream = through2({ objectMode: true }, function (filename, enc, callback) {
    var push = this.push.bind(this)
    couchdbCompile(filename.toString(), options, function (error, doc) {
      if (error) return callback(error)

      push(doc)
      callback()
    })
  })

  return filename
    ? createReadStream(filename).pipe(stream)
    : stream
}
