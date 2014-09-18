var async = require('async'),
  keystone = require('keystone'),
  _ = require('underscore');

/*
	/recipe/slug/like
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
        else if (!recipe.contest || !recipe.contest.id) {
          res.status(403);
          answer.error = true;
          answer.details = 'Recipe is not in a contest.';
          return next(err);
        }
        else {
          var q2 = Contests.model.findOne({
            '_id': recipe.contest.id
          });
          q2.exec(function(err, contest) {
            if (err || !contest) {
              res.status(404);
              answer.error = true;
              return next(err);
            }
            else if (['submission', 'votes'].indexOf(contest.state) === -1) {
              console.log(contest.state);
              console.log(contest);
              res.status(403);
              answer.error = true;
              answer.details = 'Contest is closed for voting.';
              return next(err);
            }
            else {
              var pos = req.user.likes.indexOf(recipe._id);
              if (!recipe.likes) {
                recipe.likes = 0;
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
      });
    }
  ], function(err) {
    return res.apiResponse(answer);
  });

};
