var async = require('async'),
  keystone = require('keystone'),
  service = require(__base + 'services'),
  _ = require('underscore'),
  Contest = keystone.list('Contest'),
  hideMyApi = require(__base + 'utils/hideMyApi'),
  safe = require(__base + 'utils/apiSafeFields');

/*
  /contests/past?page=1&perPage=5
*/

exports = module.exports = function(req, res) {

  var answer = {
    success: false,
    error: false
  };

  async.series([

      function(callback) {
        service.contestList.getWithWinners({
          page: req.query.page || 1,
          perPage: req.query.perPage || 5,
          states: ['finished']
        }, function(err, contests) {
          if (err) {
            answer.error = true;
            return res.notfound(res.__('Not found'));
          }
          else {
            contests.results.forEach(function(contest, i) {
              contest = hideMyApi(contest, safe.contest);
              if (contest.awards.community) {
                contest.awards.community.winner = hideMyApi(contest.awards.community.winner, safe.recipe.populated);
              }
              if (contest.awards.jury) {
                contest.awards.jury.winner = hideMyApi(contest.awards.jury.winner, safe.recipe.populated);
              }
              contests.results[i] = contest;
            });

            answer.contests = contests;
            answer.success = true;
          }
          callback(err);
        });
      }
    ],
    function(err, results) {
      return res.apiResponse(answer);
    });
};
