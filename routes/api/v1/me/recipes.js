var async = require('async'),
  keystone = require('keystone'),
  _ = require('underscore'),
  service = require(__base + 'services'),
  hideMyApi = require(__base + 'utils/hideMyApi'),
  safe = require(__base + 'utils/apiSafeFields');

/*
	/me/recipes?page=1&perPage=10
*/

exports = module.exports = function(req, res) {
  var answer = {
    success: false,
    error: false
  };
  service.recipeList.recipe.get({
    page: req.query.page || 1,
    perPage: req.query.perPage || 10,
    user: req.user,
    authorId: req.user._id,
    sort: '-editDate',
    all: true,
    fromContests: true,
    populate: ['author', 'contest.id']
  }, function(err, recipes) {
    if (err || !recipes) {
      res.status(404);
      answer.error = true;
    }
    else if (recipes.total > 0) {
      answer.success = true;
      recipes.results = recipes.results.map(function(item, i) {
        return hideMyApi(item, safe.recipe.populated);
      });
      answer.recipes = recipes;
    }
    return res.apiResponse(answer);
  });
};
