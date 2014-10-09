var async = require('async'),
  keystone = require('keystone'),
  _ = require('underscore'),
  Contest = keystone.list('Contest');

/*
  /contests/past?page=1&perPage=5
*/

exports = module.exports = function(req, res) {

  var answer = {
    success: false,
    error: false
  };

  var queryLastContest = Contest
    .paginate({
      page: req.query.page || 1,
      perPage: req.query.perPage || 5
    })
    .populate('awards.jury.winner awards.community.winner')
    .where('state', 'finished')
    .sort('-deadline');

  async.series([

      function(callback) {
        queryLastContest.exec(function(err, contests) {

          // Paginate object
          answer.contests = contests;

          if (!err && contests.results && contests.results.length > 0) {

            var optionsJuryAuthor = {
              path: 'awards.jury.winner.author',
              model: 'User'
            };

            var optionsCommunityAuthor = {
              path: 'awards.community.winner.author',
              model: 'User'
            };

            async.map(contests.results, function(contest, done) {

                // Populate nested recipe author (jury winner)
                Contest.model.populate(contest, optionsJuryAuthor, function(err, contestJuryPopulated) {

                  if (!err && contestJuryPopulated) {
                    // Populate nested recipe author (community winner)
                    Contest.model.populate(contestJuryPopulated, optionsCommunityAuthor, function(err, contestCommunityPopulated) {

                      if (!err && contestCommunityPopulated) {
                        answer.success = true;

                        done(err, contestCommunityPopulated);
                      }
                      else {
                        answer.error = true;
                        return res.notfound(res.__('Not found'));
                      }
                    });
                  }
                  else {
                    answer.error = true;
                    return res.notfound(res.__('Not found'));
                  }
                });
              },
              function(err, finalResults) {

                if (err) {
                  answer.error = true;
                  return res.notfound(res.__('Not found'));
                }
                else {
                  answer.contests.results = finalResults;
                  answer.success = true;
                }

                callback(err);
              });
          }
          else {
            if (err) {
              answer.error = true;
            }
            else {
              answer.success = true;
            }

            callback(err);
          }
        });
      }
    ],
    function(err, results) {
      return res.apiResponse(answer);
    });
};
