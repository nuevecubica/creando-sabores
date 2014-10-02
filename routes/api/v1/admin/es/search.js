var _ = require('underscore'),
  service = require(__base + 'services');

var response = function(res) {
  return function(err, results) {
    var answer = {
      success: false,
      error: false
    };

    if (!err && results) {
      answer.success = true;
      answer.results = results;
      return res.apiResponse(answer);
    }
    else {
      answer.error = true;
      answer.errorMessage = err;
      answer.results = results;
      console.log(err);
      return res.apiResponse(answer);
    }
  };
};

var _query = function(q, page, rpp) {
  return {
    "from": ((page - 1) * rpp) || 0,
    "size": rpp || 10,
    "query": {
      "filtered": {
        "filter": {
          "terms": {
            "state": ["published"],
            "_cache": true
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

var requestToQuery = function(req) {
  var query = {},
    q = '';

  var defaults = {
    index: '_all'
  };

  if (req.query['q']) {
    q = req.query['q'];
  }
  else {
    return null;
  }

  if (req.query['idx']) {
    query.index = req.query['idx'];
  }

  var page = parseInt(req.query['page']) || 1,
    rpp = parseInt(req.query['rpp']) || 10;

  query.body = _query(q, page, rpp);

  _.defaults(query, defaults);
  return query;
};

exports = module.exports = function(req, res) {
  var query;

  if (!(query = requestToQuery(req))) {
    response(res)('Invalid query');
  }

  service.elastic.search(query, response(res));
};
