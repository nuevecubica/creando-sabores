var service = require(__base + 'services');

exports = module.exports = function(req, res) {

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

  var params = {};
  if (collection) {
    params.collections = [collection];
  }
  service.elastic.sync(params, response);
};
