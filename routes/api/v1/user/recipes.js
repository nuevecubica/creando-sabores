var async = require('async'),
  keystone = require('keystone'),
  _ = require('underscore');

/*
	/chef/recipes?page=1&perPage=10
*/

exports = module.exports = function(req, res) {
  var Recipes = keystone.list('Recipe'),
    User = keystone.list('User'),
    query = {
      paginate: {
        page: req.query.page || 1,
        perPage: req.query.perPage || 10
      }
    },
    answer = {
      success: false,
      error: false
    };

  async.waterfall([

    function(next) {
      var q = User.model.findOne({
        username: req.params.username
      });
      q.exec(function(err, result) {
        if (err || !result) {
          res.status(404);
          answer.error = true;
          return res.apiResponse(answer);
        }
        next(err, result);
      });
    },

    function(profile, next) {
      var q = Recipes.paginate(query.paginate)
        .where('author', profile._id)
        .where('state', 1)
        .where('isBanned', false)
        .where('isRemoved', false)
        .sort('-editDate');

      q.exec(function(err, recipes) {
        if (err || !recipes) {
          res.status(404);
          answer.error = true;
        }
        else if (recipes.total > 0) {
          answer.success = true;
          answer.recipes = recipes;
        }
        return next(err);
      });
    }
  ], function(err) {
    return res.apiResponse(answer);
  });

};
