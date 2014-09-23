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
  if (false) { //(!ref || ref.split('/')[2] !== req.headers.host) {
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
          // TODO: nada de indexof, son elementos {id,rating}
          console.log(req.user);
          //req.user.review = [{recipe: 'test-recipe-1', rating: 5}];
          //req.user.save();
          return next(null);
          var pos = req.user.review.indexOf(recipe._id);
          if (!recipe.scoreCount) {
            recipe.scoreCount = 0;
          }
          if (!recipe.scoreTotal) {
            recipe.scoreTotal = 0;
          }
          if (req.params.action === 'like') {
            if (pos === -1) {
              req.user.likes.push(recipe._id);
              req.user.save();
              recipe.likes += 1;
              recipe.save();
            }
          }
          else if (req.params.action === 'unlike') {
            if (pos !== -1) {
              req.user.likes.splice(pos, 1);
              req.user.save();
              recipe.likes -= 1;
              recipe.save();
            }
          }
          answer.id = recipe.id;
          answer.likes = recipe.likes;
          answer.success = true;
          return next(err);
        }
      });
    }
  ], function(err) {
    return res.apiResponse(answer);
  });

};
