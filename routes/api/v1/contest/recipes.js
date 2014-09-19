var async = require('async'),
  keystone = require('keystone'),
  modelCleaner = require('../../../../utils/modelCleaner'),
  _ = require('underscore');

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
      var q = Recipes.paginate(query.paginate)
        .where('contest.id', contest._id)
        .where('contest.state', 'admited')
        .where('state', 1)
        .where('isBanned', false)
        .where('isRemoved', false);
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
          for (var i = 0, l = recipes.results.length; i < l; i++) {
            recipes.results[i] = recipes.results[i].toObject({
              virtuals: true,
              transform: modelCleaner.transformer
            });
            var liked = req.user.likes.indexOf(recipes.results[i]._id) !== -1;
            recipes.results[i].liked = liked;
            var ingr = recipes.results[i].ingredients;
            ingr = _.compact(ingr.replace(/(<\/p>|\r|\n)/gi, '').split('<p>'));
            recipes.results[i].ingredients = ingr;
          }
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
