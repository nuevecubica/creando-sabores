var async = require('async'),
  keystone = require('keystone'),
  _ = require('underscore');

/*
	/recipe/:slug/vote/:score
*/

exports = module.exports = function(req, res) {

  var Recipes = keystone.list('Recipe'),
    Contests = keystone.list('Contest'),
    answer = {
      success: false,
      error: false,
    };

  var ref = req.headers.referer;
  if (!ref || ref.split('/')[2] !== req.headers.host) {
    res.status(403);
    answer.error = true;
    answer.details = 'Missing or wrong referer.';
    return res.apiResponse(answer);
  }

  req.params.score = parseInt(req.params.score);
  if (!req.params.score || req.params.score < 1 || req.params.score > 5) {
    res.status(403);
    answer.error = true;
    answer.details = 'Invalid score.';
    return res.apiResponse(answer);
  }

  async.series([

    function(next) {
      var q = Recipes.model.findOne({
        'slug': req.params.recipe
      });
      q.exec(function(err, recipe) {
        if (err || !recipe) {
          res.status(404);
          answer.error = true;
          return next(err);
        }
        else if (recipe.contest && recipe.contest.id) {
          res.status(403);
          answer.error = true;
          answer.details = 'Recipe is in a contest.';
          return next(err);
        }
        else {
          if (!recipe.scoreCount) {
            recipe.scoreCount = 0;
          }
          if (!recipe.scoreTotal) {
            recipe.scoreTotal = 0;
          }
          var reviews = req.user.review;
          var pos = -1;
          for (var i = 0, l = reviews.length; i < l; i++) {
            if (String(reviews[i].recipe) === String(recipe._id)) {
              pos = i;
              break;
            }
          }
          if (pos === -1) {
            var review = {
              recipe: recipe._id,
              rating: req.params.score
            };
            req.user.review.push(review);
            recipe.scoreCount += 1;
            recipe.scoreTotal += req.params.score;
            req.user.save();
            recipe.save();
          }
          else {
            var diff = req.params.score - reviews[pos].rating;
            req.user.review[pos].rating = req.params.score;
            recipe.scoreTotal += diff;
            req.user.save();
            recipe.save();
          }
          answer.id = recipe.id;
          answer.rating = recipe.rating;
          answer.success = true;
          return next(err);
        }
      });
    }
  ], function(err) {
    return res.apiResponse(answer);
  });

};
