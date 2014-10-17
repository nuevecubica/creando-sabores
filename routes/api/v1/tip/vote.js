var async = require('async'),
  keystone = require('keystone'),
  _ = require('underscore'),
  service = require(__base + 'services');

/*
  /tip/:slug/vote/:score
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
      service.tip.get({
        slug: req.params.tip
      }, function(err, tip) {
        if (err || !tip) {
          res.status(404);
          answer.error = true;
          return next(err);
        }
        else {
          if (!tip.scoreCount) {
            tip.scoreCount = 0;
          }
          if (!tip.scoreTotal) {
            tip.scoreTotal = 0;
          }
          var reviews = req.user.review;
          var pos = -1;
          for (var i = 0, l = reviews.length; i < l; i++) {
            if (String(reviews[i].tip) === String(tip._id)) {
              pos = i;
              break;
            }
          }
          if (pos === -1) {
            var review = {
              tip: tip._id,
              rating: req.params.score
            };
            req.user.review.push(review);
            tip.scoreCount += 1;
            tip.scoreTotal += req.params.score;
          }
          else {
            var diff = req.params.score - reviews[pos].rating;
            req.user.review[pos].rating = req.params.score;
            tip.scoreTotal += diff;
          }

          var finish = function(err) {
            if (!err) {
              answer.id = tip._id;
              //answer.rating = tip.rating;
              var rating = tip.scoreTotal / tip.scoreCount;
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
              tip.save(function(err) {
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
