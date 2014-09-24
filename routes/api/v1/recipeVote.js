var async = require('async'),
  keystone = require('keystone'),
  _ = require('underscore'),
  service = require('../../../services');

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
        recipe: req.params.recipe
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
          if (!result.recipe.scoreCount) {
            result.recipe.scoreCount = 0;
          }
          if (!result.recipe.scoreTotal) {
            result.recipe.scoreTotal = 0;
          }
          var reviews = req.user.review;
          var pos = -1;
          for (var i = 0, l = reviews.length; i < l; i++) {
            if (String(reviews[i].recipe) === String(result.recipe._id)) {
              pos = i;
              break;
            }
          }
          if (pos === -1) {
            var review = {
              recipe: result.recipe._id,
              rating: req.params.score
            };
            req.user.review.push(review);
            result.recipe.scoreCount += 1;
            result.recipe.scoreTotal += req.params.score;
          }
          else {
            var diff = req.params.score - reviews[pos].rating;
            req.user.review[pos].rating = req.params.score;
            result.recipe.scoreTotal += diff;
          }
          // /* Esto no debería hacer falta, ya que está en el modelo...
          result.recipe.set('scoreCount', result.recipe.scoreCount, {
            strict: true
          });
          result.recipe.set('scoreTotal', result.recipe.scoreTotal, {
            strict: true
          });
          // */

          var finish = function(err) {
            if (!err) {
              answer.id = result.recipe._id;
              //answer.rating = result.recipe.rating;
              var rating = result.recipe.scoreTotal / result.recipe.scoreCount;
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
              result.recipe.save(function(err) {
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
