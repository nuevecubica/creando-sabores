var async = require('async'),
  keystone = require('keystone'),
  _ = require('underscore'),
  hideMyApi = require(__base + 'utils/hideMyApi'),
  safe = require(__base + 'utils/apiSafeFields');

/*
  /contest/recipes?page=1&perPage=10
*/

exports = module.exports = function(req, res) {
  var Recipes = keystone.list('Recipe'),
    Contest = keystone.list('Contest'),
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
      var q = Contest.model.findOne({
        slug: req.params.contest
      });
      q.sort('title')
        .exec(function(err, result) {
          if (err || !result) {
            res.status(404);
            answer.error = true;
            return res.apiResponse(answer);
          }
          next(err, result);
        });
    },

    function(contest, next) {
      /*
       * TODO: Convert into service
       */
      var q = Recipes.paginate(query.paginate)
        .where('contest.id', contest._id)
        .where('state', 'published');

      if (req.query.order === 'recent') {
        q.sort('-publishedDate');
      }
      else {
        q.sort('-likes');
      }

      q.exec(function(err, recipes) {
        if (err || !recipes) {
          res.status(404);
          answer.error = true;
        }
        else if (recipes.total > 0) {
          recipes.results = recipes.results.map(function(item, i) {
            var liked = req.user.likes.indexOf(item._id) !== -1;
            item = hideMyApi(item, safe.recipe.populated);
            item.liked = liked;
            item.ingredients = _.compact(item.ingredients.replace(/(<\/p>|\r|\n)/gi, '').split('<p>'));
            return item;
          });
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
