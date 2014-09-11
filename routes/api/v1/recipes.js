var async = require('async'),
  keystone = require('keystone');

/*
	/recipes?page=1&perPage=10
*/

exports = module.exports = function(req, res) {
  var Recipes = keystone.list('Recipe'),
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

  async.series([

    function(next) {
      var q = Recipes.paginate(query.paginate)
        .where('state', 1)
        .where('isBanned', false)
        .where('isRemoved', false)
        .sort('-rating');

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
