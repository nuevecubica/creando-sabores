var async = require('async'),
  keystone = require('keystone'),
  _ = require('underscore'),
  User = keystone.list('User'),
  service = require(__base + 'services');

/*
  /chef/recipes?page=1&perPage=10
*/

exports = module.exports = function(req, res) {
  var answer = {
    success: false,
    error: false
  };

  var q = User.model.findOne({
    username: req.params.username
  });
  q.exec(function(err, result) {
    if (err || !result) {
      res.status(404);
      answer.error = true;
      return res.apiResponse(answer);
    }
    else {
      service.recipeList.recipe.get({
        page: req.query.page || 1,
        perPage: req.query.perPage || 10,
        user: req.user,
        authorId: result._id,
        sort: '-editDate',
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
    }
  });
};
