var _ = require('underscore'),
  service = require(__base + 'services'),
  utils = require('./utils');

/**
 * Request to query magic.
 *
 * If there's a place to tweak searches, it's here.
 *
 * @param  {String}  q    Term to look for
 * @param  {Integer} page Page number. Default: 1.
 * @param  {Integer} rpp  Results per page
 * @return {Object}       ES query
 */
var _query = function(q, page, rpp) {
  page = page || 1;
  rpp = rpp || 10;

  return {
    "from": ((page - 1) * rpp) || 0,
    "size": rpp || 10,
    "query": {
      "filtered": {
        "filter": {
          "bool": {
            "must": [{
              "term": {
                "state": "published",
                "_cache": true
              }
            }]
          }
        },
        "query": {
          "bool": {
            "should": [{
              "match_phrase": {
                "title": {
                  "query": q,
                  "boost": 5
                }
              }
            }, {
              "match": {
                "title": {
                  "query": q,
                  "boost": 3
                }
              }
            }, {
              "match_phrase": {
                "_all": {
                  "query": q,
                  "boost": 2
                }
              }
            }, {
              "match": {
                "_all": {
                  "query": q
                }
              }
            }],
            "minimum_should_match": 1,
            "boost": 1.0
          }
        }
      }
    }
  };
};

exports = module.exports = function(req, res) {
  var query;

  if (!(query = utils.requestToQuery(req, _query))) {
    return utils.response(res)('Invalid query');
  }

  service.elastic.search.keystoned(query, utils.response(res));
};
