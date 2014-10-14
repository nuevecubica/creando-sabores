var service = require(__base + 'services');

var reindex = function(idx, params, response) {
  service.elastic._client().indices.delete({
    index: idx
  }, function(err) {
    service.elastic.sync(params, response);
  });
};

var middleware = function(req, res) {

  var collection = req.params.collection ? req.params.collection.capitalize() : null;

  var response = function(err, count) {
    var answer = {
      success: false,
      error: false
    };

    if (!err) {
      answer.success = true;
      answer.log = "indexed " + count + " documents";
      answer.total = count;
    }
    else {
      answer.error = true;
      answer.errorMessage = err;
      console.error('Reindex error', err);
    }
    return res.apiResponse(answer);
  };

  var params = {},
    idx = '*';

  if (collection) {
    params.collections = [collection];
    idx = collection.toLowerCase();
  }

  reindex(idx, params, response);
};

middleware.run = reindex;

exports = module.exports = middleware;
