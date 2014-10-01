var keystone = require('keystone'),
  es = require('elasticsearch'),
  config = require('../../../../../config.js'),
  answer = {
    success: false,
    error: false
  };

var response = function(res) {
  return function(err, results) {
    if (!err && results) {
      answer.success = true;
      answer.results = results;
      return res.apiResponse(answer);
    }
    else {
      answer.error = true;
      answer.errorMessage = err;
      console.log(err);
      return res.apiResponse(answer);
    }
  };
};

exports = module.exports = function(req, res) {

  var collection = req.params.collection,
    term = req.params.term;

  collection = collection.charAt(0).toUpperCase() + collection.slice(1);

  if (collection === 'All') {
    var elasticsearch = es.Client({
      host: config.elasticsearch.url,
      log: 'trace'
    });

    elasticsearch.search({
      index: "_all",
      q: term
    }, response(res));
  }
  else {
    var list = keystone.list(collection);

    if (list) {
      list.model.search({
        query: term
      }, response(res));
    }
    else {
      answer.error = true;
      return res.apiResponse(answer);
    }
  }
};
