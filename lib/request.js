var url = require('url')
var path = require('path')
var http = require('http')

module.exports = function request (db, endpoint, method, options) {
  options = options || {}
  options.url = options.url || 'http://localhost:5984'

  var couch = url.parse(options.url)
  var u = url.parse(db)

  u.hostname = u.hostname || couch.hostname
  u.protocol = u.protocol || couch.protocol
  u.host = u.host || couch.host
  u.port = u.port || couch.port
  u.auth = u.auth || couch.auth

  if (options.username && options.password) {
    u.auth = options.username + ':' + options.password
  }

  u.path = path.join(u.path, endpoint)
  if (u.path.match(/^[^/]\w+/)) u.path = '/' + u.path

  var headers = {
    'Content-Type': 'application/json'
  }

  if (u.auth) {
    headers.Authorization = 'Basic ' + new Buffer(u.auth).toString('base64')
  }

  return http.request({
    hostname: u.hostname,
    protocol: u.protocol,
    port: u.port,
    path: u.path,
    method: method,
    headers: headers
  })
}
