module.exports = function normalize (doc) {
  return Array.isArray(doc) ? doc : Array.isArray(doc.docs) ? doc.docs : [doc]
}
