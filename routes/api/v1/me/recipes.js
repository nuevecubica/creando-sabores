var async = require('async'),
  keystone = require('keystone'),
  _ = require('underscore'),
  service = require('../../../../services');

/*
	/me/recipes?page=1&perPage=10
*/

exports = module.exports = function(req, res) {
  var answer = {
    success: false,
    error: false
  };
  service.recipeList.get({
    page: req.query.page || 1,
    perPage: req.query.perPage || 10,
    userId: req.user._id,
    sort: '-editDate',
    all: true,
    fromContests: true
  }, function(err, recipes) {
    if (err || !recipes) {
      res.status(404);
      answer.error = true;
    }
    else if (recipes.total > 0) {
      answer.success = true;
      answer.recipes = recipes;
    }
    return res.apiResponse(answer);
  });
};
