var async = require('async'),
  keystone = require('keystone'),
  service = require('../../../services');

/*
	/recipes?page=1&perPage=10
*/

exports = module.exports = function(req, res) {
  var answer = {
    success: false,
    error: false
  };

  service.recipeList[req.params.type].get({
    page: req.query.page || 1,
    perPage: req.query.perPage || 10
  }, function(err, recipes) {
    if (err || !recipes) {
      res.status(404);
      answer.error = true;
    }
    else {
      answer.success = true;
      answer.recipes = recipes;
    }
    return res.apiResponse(answer);
  });
};
