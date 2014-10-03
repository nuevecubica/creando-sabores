var _ = require('underscore');

/**
 * Converts Elasticsearch hits to model-like documents.
 *
 * Basically it gets the _source attribute and, optionally,
 * includes the Elasticsearch meta-data as the _es attribute.
 *
 * @param  {Array}  hits   Elasticsearch hits array
 * @param  {Bool}   withEs Include ES meta-data?
 * @return {Array}         Just the documents
 */
var hitsToDocuments = function(hits, withEs) {
  var iterator = function(a, i) {
    return a._source;
  };

  var iteratorEs = function(a, i) {
    var _doc = a._source,
      _es = _.clone(a, true);
    delete _es._source;
    _doc._es = _es;
    return _doc;
  };

  var docs = hits.map(withEs ? iteratorEs : iterator);
  return docs;
};

exports = module.exports = hitsToDocuments;
