var async = require('async'),
  keystone = require('keystone'),
  _ = require('underscore'),
  User = keystone.list('User'),
  service = require(__base + 'services'),
  hideMyApi = require(__base + 'utils/hideMyApi'),
  safe = require(__base + 'utils/apiSafeFields');

/*
  /chef/favourites?page=1&perPage=10
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
    else if (result.isPrivate && (!req.user || req.user._id !== result._id)) {
      res.status(401);
      answer.error = true;
      return res.apiResponse(answer);
    }
    else {
      service.user.favourites.get({
        page: req.query.page || 1,
        perPage: req.query.perPage || 10,
        user: result,
      }, function(err, recipes) {
        if (!err && recipes) {
          recipes.results = recipes.results.map(function(item, i) {
            return hideMyApi(item, safe.recipe.populated);
          });
          answer.recipes = recipes;
          answer.success = true;
        }
        else if (recipes.total > 0) {
          answer.error = true;
        }
        return res.apiResponse(answer);
      });
    }
  });
};
