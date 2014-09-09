var async = require('async'),
  keystone = require('keystone');

/*
	/me/recipes?page=1&perPage=10
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
        .where('author', req.user._id)
        .where('isBanned', false)
        .where('isRemoved', false)
        .sort('-editDate');

      q.exec(function(err, recipes) {
        //console.log('EXEC ' + JSON.stringify(recipes));

        if (err || !recipes) {
          //console.log('ERROR ' + err);
          res.status(404);
          answer.error = true;
        }
        else if (recipes.total > 0) {
          //console.log('RECIPES ' + recipes);
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
