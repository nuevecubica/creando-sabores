/**
 * Suggests corrections to misspelled words.
 * @type {API Controller}
 */
var _ = require('underscore'),
  service = require(__base + 'services'),
  utils = require('./utils');

/**
 * Request to query magic.
 *
 * If there's a place to tweak searches, it's here.
 *
 * @param  {String}  q    Term to look for
 * @return {Object}       ES query
 */
var _query = function(q) {
  return {
    "text": q,
    "words": {
      "term": {
        "field": "title",
        "size": 5
      }
    }
  };
};

exports = module.exports = function(req, res) {
  var query;

  if (!(query = utils.requestToQuery(req, _query))) {
    return utils.response(res)('Invalid query');
  }

  service.elastic.suggest(query, utils.response(res));
};
