var async = require('async'),
  keystone = require('keystone'),
  _ = require('underscore'),
  Contest = keystone.list('Contest');

/*
  /contestsPast?page=1&perPage=10
*/

exports = module.exports = function(req, res) {

  var answer = {
    success: false,
    error: false
  };

  var queryLastContest = Contest
    .paginate({
      page: req.query.page || 1,
      perPage: 5
    })
    .populate('awards.jury.winner awards.community.winner')
    .where('state', 'finished')
    .sort('-deadline');

  async.series([

      function(callback) {
        queryLastContest.exec(function(err, contests) {

          if (!err && contests) {

            var optionsJuryAuthor = {
              path: 'awards.jury.winner.author',
              model: 'User'
            };

            var optionsCommunityAuthor = {
              path: 'awards.community.winner.author',
              model: 'User'
            };

            answer.objects = {
              results: []
            };

            async.each(contests.results, function(contest, done) {

                // Populate nested recipe author (jury winner)
                Contest.model.populate(contest, optionsJuryAuthor, function(err, contestJuryPopulated) {

                  if (!err) {
                    // Populate nested recipe author (community winner)
                    Contest.model.populate(contestJuryPopulated, optionsCommunityAuthor, function(err, contestCommunityPopulated) {

                      if (!err) {
                        answer.success = true;

                        answer.objects.results.push(contestCommunityPopulated);

                        done();
                      }
                      else {
                        answer.error = true;
                        res.status(404);
                      }
                    });
                  }
                  else {
                    answer.error = true;
                    res.status(404);
                  }
                });
              },
              function(err) {
                if (err) {
                  answer.error = true;
                  res.status(404);
                }
                else {
                  callback();
                }
              });
          }
          else {
            answer.error = true;
            res.status(404);
          }
        });
      }
    ],
    function(err, results) {
      return res.apiResponse(answer);
    });
};
