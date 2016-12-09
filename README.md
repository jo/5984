# 5984
_Lightweight CouchDB CLI and Node API for efficient stream processing._

5984 is a set of a few specific tools. Chaining provides wide flexibility.
```sh
5984 batch -n 1000 docs.ndjson \
  | 5984 fetch-revs mydb \
  | 5984 batch -n 100 \
  | 5984 bulk mydb
```

For now 5984 provides the following commands:

* **bulk-docs:** push document to couchdb
* **fetch-revs:** fetch document revisions
* **compile:** compile couchapp directories and modules
* **batch:** batch documents

Please [share your thoughts](https://github.com/jo/5984/issues/new) - what is
important to you and where you'd see a good fit for it.

The commandline client handles [Newline Delimited JSON](http://ndjson.org/),
which is a perfect fit for CouchDB for many reasons. CouchDB also provides its
continuous changes feed as ndjson.

I have tried to minimize dependency footprint. Thats why I use plain http
requests for example.

[![Build Status](https://travis-ci.org/jo/5984.svg?branch=master)](https://travis-ci.org/jo/5984)

## Installation
```sh
npm install 5984 -g
```


## Interface
You can feed the 5984 CLI either with ndjson files provided via commandline
argument or via stdin:
```sh
5984 bulk mydb docs.ndjson
echo '{"_id": "mydoc"}' | 5984 bulk mydb
```

The Node API has a stream interface:
```js
var fnef = require('5984')
var bulk = fnef.bulkDocs('mydb')
bulk.on('data', function (response) {
  console.log(response)
})
bulk.write({ _id: 'mydoc' })
```


## Input Format
Documents can can be given using different formats:

##### Single Doc
Input chunk can be a single document object:
```json
{ "_id": "one" }
```
##### Array of Docs
...or an array of docs:
```json
[
  { "_id": "one" },
  { "_id": "two" }
]
```
##### Docs Object
...or an object with a `docs` property with an array of docs, like eg. used in
`_bulk_docs` requests:
```json
{
  "docs": [
    { "_id": "one" },
    { "_id": "two" }
  ]
}
```


## Common Options
There are some global options:

* `options.url`: CouchDB server url (defaults to http://localhost:5984)
* `options.username`: username to authenticate with
* `options.password`: password to authenticate with


## Commands & API
Commands are invoked in a Git-style manner: `5984 <command> [options]`
Run `5984` without an argument or `5984 help` for detailed CLI usage.

The API can be imported either as a whole or directly:
```js
var fnef = require('5984')
var bulkDocs = require('5984/bulk-docs')
```

All API endpoints return a readable stream in object mode.

### bulkDocs(db, options)
Post documents via `_bulk_docs` to a CouchDB.

* `db`: database url. Can also be a database name, in which case the host from `options.url` is used.


### fetchRevs(db, options)
Queries current revisions from database via `_all_docs` request and inserts them
into the documents.

* `db`: database url. Can also be a database name, in which case the host from `options.url` is used.


### compile([source], options)
Compile couchapp directories and CommonJS modules. See
[couchdb-compile](https://github.com/jo/couchdb-compile) for details.

Input is *not* ndjson but plain newline delimited filenames. 
If `source` is provided, use it as input rather than a stream of filenames.

* `source`: compile source file. Optional.
* `options.index`: look for `index.js` files. Default is false.


### batch(options)
Group documents to batches.

* `options.size`: batch size (default is 100)


## Examples
Please also have a look at the tests.

##### Compile design document and push it to the couch:
```sh
$ 5984 compile ./ddoc | 5984 fetch-revs mydb | 5984 bulk-docs mydb
{"ok":true,"id":"_design/myapp","rev":"1-967a00dff5e02add41819138abb3284d"}
```

##### Create a force push chain with optimized batching: 
```sh
5984 batch -n 1000 docs.ndjson \
  | 5984 fetch-revs mydb \
  | 5984 batch -n 100 \
  | 5984 bulk mydb
```
First the input docs are batched into 1000er batches. For each batch a request
is being made to retrieve current revisions of the documents. Now the docs are
again batched, this time into 100er batches. These batches are posted to
CouchDB.


## License
Apache 2.0.

(c) 2016 Johannes J. Schmidt
