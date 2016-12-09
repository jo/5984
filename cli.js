#!/usr/bin/env node

var fs = require('fs')
var ndjson = require('ndjson')
var split2 = require('split2')
var program = require('commander')
var pkg = require('./package.json')
var fnef = require('.')

function parseNumber (number, defaultValue) {
  var i = parseInt(number)

  return i > 0 ? i : defaultValue
}

function pipeline (arg, stream) {
  var input = (!process.stdin.isTTY || arg === '-' || !arg)
    ? process.stdin
    : fs.createReadStream(arg)

  return input
    .pipe(ndjson.parse())
    .pipe(stream)
    .pipe(ndjson.serialize())
    .pipe(process.stdout)
}

program
  .version(pkg.version)

program.on('--help', function () {
  console.log('  Input:')
  console.log()
  console.log('    is either read from STDIN or from file, if provided.')
  console.log('    It must be newline delimited JSON (ndjson).')
  console.log('    Each line can either be')
  console.log('      - single doc: `{"_id": "mydoc"}`')
  console.log('      - array of docs: `[{"_id": "mydoc"}, {"_id": "otherdoc"}]`')
  console.log('      - docs object: `{"docs": [{"_id": "mydoc"}, {"_id": "otherdoc"}]}`')
  console.log()
})

program
  .option('--url <url>', 'CouchDB server url, default is http://localhost:5984', 'http://localhost:5984')
  .option('-u, --username <username>', 'username to authenticate with')
  .option('-p, --password <password>', 'password to authenticate with')

program
  .command('bulk-docs <db> [file]')
  .description('upload one or more docs')
  .alias('bulk')
  .action(function (db, arg) {
    pipeline(arg, fnef.bulkDocs(db, program))
  })

program
  .command('fetch-revs <db> [file]')
  .description('fetch revisions')
  .action(function (db, arg) {
    pipeline(arg, fnef.fetchRevs(db, program))
  })

program
  .command('compile [source]')
  .description('compile couchapp directories or files')
  .option('-i, --index', 'look for index.js modules', false)
  .action(function (arg, options) {
    if (!process.stdin.isTTY || arg === '-' || !arg) {
      process.stdin
        .pipe(split2())
        .pipe(fnef.compile(options))
        .pipe(ndjson.serialize())
        .pipe(process.stdout)
    } else {
      fnef.compile(arg, options)
        .pipe(ndjson.serialize())
        .pipe(process.stdout)
    }
  })
  .on('--help', function () {
    console.log('  Input:')
    console.log()
    console.log('    This command is slightly different from the others:')
    console.log('    it either expects newline delimited filenames from STDIN')
    console.log('    or a single source filename as argument.')
    console.log()
  })

program
  .command('batch [file]')
  .description('batch docs')
  .option('-n, --size <size>', 'batch size, default is 100', parseNumber, 100)
  .action(function (arg, options) {
    pipeline(arg, fnef.batch(options))
  })

program
  .command('*')
  .alias('help')
  .description('show this help')
  .action(program.help.bind(program, null))

program.parse(process.argv)

if (!program.args.length) program.help()
