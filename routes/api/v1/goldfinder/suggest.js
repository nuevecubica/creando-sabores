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
var _query = function(q, idx) {
  return {
    "index": idx,
    "body": {
      "suggest": {
        "text": q,
        "completion": {
          "field": "suggest",
        }
      }
    }
  };
};

exports = module.exports = function(req, res) {
  var query;

  var q = req.query['q'] || '';
  var idx = req.query['idx'] || '_all';
  query = _query(q, idx);

  service.elastic.suggest(query, utils.response(res));
};
