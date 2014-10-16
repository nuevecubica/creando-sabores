var async = require('async'),
  keystone = require('keystone'),
  service = require(__base + 'services');

/*
  /seasonLists?limit=1&withRecipes=1
	id=
  page=
  perPage=
*/

exports = module.exports = function(req, res) {
  var answer = {
    success: false,
    error: false
  };

  var options = {
    names: req.query.names.split(',')
  };

  service.config.get(options, function(err, configs) {
    if (err || !configs) {
      res.status(404);
      answer.error = true;
    }
    else {
      answer.success = true;
      answer.configs = configs;
    }
    return res.apiResponse(answer);
  });
};
