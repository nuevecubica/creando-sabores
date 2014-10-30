var async = require('async'),
  keystone = require('keystone'),
  _ = require('underscore'),
  service = require(__base + 'services');

/*
	/recipe/:slug/vote/:score
*/

exports = module.exports = function(req, res) {

  var answer = {
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
      service.recipe.get({
        slug: req.params.recipe
      }, function(err, result) {
        if (err || !result) {
          res.status(404);
          answer.error = true;
          return next(err);
        }
        else if (result.contest && result.contest.id) {
          res.status(403);
          answer.error = true;
          answer.details = 'Recipe is in a contest.';
          return next(err);
        }
        else {
          var recipe = result.recipe._document;
          if (!recipe.scoreCount) {
            recipe.scoreCount = 0;
          }
          if (!recipe.scoreTotal) {
            recipe.scoreTotal = 0;
          }
          var votes = req.user.votes.recipes;
          var pos = -1;
          for (var i = 0, l = votes.length; i < l; i++) {
            if (String(votes[i]._id) === String(recipe._id)) {
              pos = i;
              break;
            }
          }
          if (pos === -1) {
            var vote = {
              _id: recipe._id,
              rating: req.params.score
            };
            req.user.votes.recipes.push(vote);
            recipe.scoreCount += 1;
            recipe.scoreTotal += req.params.score;
          }
          else {
            var diff = req.params.score - votes[pos].rating;
            req.user.votes.recipes[pos].rating = req.params.score;
            recipe.scoreTotal += diff;
          }

          var finish = function(err) {
            if (!err) {
              answer.id = recipe._id;
              //answer.rating = recipe.rating;
              var rating = recipe.scoreTotal / recipe.scoreCount;
              answer.rating = rating;
              answer.success = true;
            }
            else {
              res.status(500);
              answer.error = true;
              answer.errorMessage = err;
            }
            next(err);
          };

          req.user.save(function(err) {
            if (err) {
              finish(err);
            }
            else {
              recipe.save(function(err) {
                finish(err);
              });
            }
          });
        }
      });
    }
  ], function(err) {
    return res.apiResponse(answer);
  });

};
