var async = require('async'),
  keystone = require('keystone'),
  _ = require('underscore'),
  User = keystone.list('User'),
  service = require(__base + 'services');

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
    else {
      service.user.favourites.get({
        page: req.query.page || 1,
        perPage: req.query.perPage || 10,
        user: result,
      }, function(err, recipes) {
        if (!err && recipes) {
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
