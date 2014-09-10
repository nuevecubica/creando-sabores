var keystone = require('keystone'),
  async = require('async'),
  Contest = keystone.list('Contest'),
  Recipe = keystone.list('Recipe');

exports = module.exports = function(req, res) {

  var locals = res.locals,
    view = new keystone.View(req, res);

  // Set locals
  locals.title = res.__('Contest');
  locals.section = 'contest';

  locals.data = {};

  locals.filters = {
    contest: req.params.contest
  };

  // load contests
  view.on('init', function(next) {

    // In async waterfall, first function return is a param in second function
    // Thus, second function (Find recipes top for a contest) get id contest from first function.
    async.waterfall([
      // First funcion, get id contest
      function(callback) {
        // Query for get a contest
        var queryContest = Contest.model.findOne({
            slug: locals.filters.contest
          })
          .populate('awards.jury.winner awards.community.winner');

        queryContest.exec(function(err, result) {
          if (!err && result) {

            var optionsJuryAuthor = {
              path: 'awards.jury.winner.author',
              model: 'User'
            };

            var optionsCommunityAuthor = {
              path: 'awards.community.winner.author',
              model: 'User'
            };

            // Populate nested recipe author (jury winner)
            Contest.model.populate(result, optionsJuryAuthor, function(err, contestJuryPopulated) {

              if (!err) {
                // Populate nested recipe author (community winner)
                Contest.model.populate(contestJuryPopulated, optionsCommunityAuthor, function(err, contestCommunityPopulated) {
                  if (!err) {
                    locals.data.contest = contestCommunityPopulated;

                    callback(null, result.id);
                  }
                  else {
                    callback(err, null);
                  }
                });
              }
              else {
                callback(err, null);
              }
            });
          }
          else {
            callback(err, null);
          }
        });
      },

      // function(contestState, contestId, callback) {

      // },

      function(contestId, callback) {

        if (contestId) {
          var queryTop = Recipe.model.find({
              'contest.id': contestId,
              'contest.state': 'admited',
              'isRemoved': false,
              'isBanned': false
            })
            .limit(4)
            .populate('contest.id')
            .sort('-rating');

          queryTop.exec(function(err, result) {

            if (!err && result) {
              locals.data.top = result;

              callback(null, locals.data);
            }
            else {
              if (err) {
                callback(err);
              }
              else {
                callback(null, null);
              }
            }
          });
        }
        else {
          callback(null, null);
        }
      }
    ], function(err, result) {
      if (!err) {
        next();
      }
      else {
        next(err);
      }
    });

  });

  // Render the view
  view.render('contest');
};
