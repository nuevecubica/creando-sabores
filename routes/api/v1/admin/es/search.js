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

var _query = function(q) {
  return {
    "size": 10,
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
          "match_phrase": {
            "description": {
              "query": q,
              "boost": 4
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
          "match": {
            "description": {
              "query": q,
              "boost": 2
            }
          }
        }],
        "minimum_should_match": 1,
        "boost": 1.0
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

  query.body = _query(q);

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
