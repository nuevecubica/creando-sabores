var async = require('async'),
  es = require('elasticsearch'),
  config = require(__base + 'config');

exports = module.exports = function(req, res) {
  var answer = {
    success: false,
    error: false
  };

  var elasticsearch = es.Client({
    host: config.elasticsearch.url,
    log: 'trace'
  });

  elasticsearch.ping({
    requestTimeout: 1000,
    hello: "elasticsearch!"
  }, function(err) {
    if (err) {
      answer.error = true;
      answer.errorMessage = err;
      logger.error("elasticsearch is dead");
    }
    else {
      answer.success = true;
    }
    return res.apiResponse(answer);
  });
};
