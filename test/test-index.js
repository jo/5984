var tap = require('tap')
var fnef = require('..')

tap.type(fnef, 'object')
tap.type(fnef.bulkDocs, 'function')
tap.type(fnef.fetchRevs, 'function')
tap.type(fnef.compile, 'function')
tap.type(fnef.batch, 'function')
